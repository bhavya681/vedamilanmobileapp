import { ApiError, kindFromStatus } from "@/api/client/errors";
import { requestRaw, type RequestOptions } from "@/api/client/http";
import { extractAuthCookie, tokenStore } from "@/lib/auth/tokenStore";
import type { AuthMe } from "@/api/types/models";

type BetterAuthBody = {
  token?: string;
  user?: unknown;
  message?: string;
  code?: string;
  error?: { message?: string; code?: string };
};

async function readAuthBody(response: Response): Promise<BetterAuthBody> {
  let body: BetterAuthBody = {};
  try {
    body = (await response.json()) as BetterAuthBody;
  } catch {
    body = {};
  }
  if (!response.ok) {
    throw new ApiError({
      kind: response.status === 401 ? "unauthorized" : response.status === 429 ? "rate_limit" : "validation",
      status: response.status,
      code: body.code ?? body.error?.code ?? "AUTH_ERROR",
      message:
        body.message ??
        body.error?.message ??
        (response.status === 401
          ? "Incorrect email or password."
          : "We could not complete that request."),
    });
  }
  return body;
}

/**
 * Better Auth endpoints return their own payloads (not the mobile
 * `{ success, data }` envelope). Session lookup uses this raw shape.
 */
async function readSession(response: Response): Promise<AuthMe> {
  let body: Record<string, unknown> = {};
  try {
    body = (await response.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  if (!response.ok || body.authenticated !== true || typeof body.user !== "object") {
    throw new ApiError({
      kind: kindFromStatus(response.status),
      status: response.status,
      code: (body.code as string | undefined) ?? "SESSION_UNAVAILABLE",
      message:
        (body.message as string | undefined) ??
        (response.status === 401
          ? "Your session has expired. Please sign in again."
          : "We could not load your session."),
    });
  }

  return body as unknown as AuthMe;
}

async function authRequest(path: string, options: RequestOptions = {}): Promise<void> {
  const { response } = await requestRaw(path, options);
  if (!response.ok) {
    await readAuthBody(response);
  }
}

async function establishSession(response: Response, nextToken: string | null): Promise<AuthMe> {
  const body = await readAuthBody(response);
  const headerToken = nextToken;
  const bodyToken = typeof body.token === "string" ? body.token : null;
  const cookie = extractAuthCookie(response.headers.get("set-cookie"));
  const token = headerToken || bodyToken;

  // Preferred path: bearer session (requires the backend bearer plugin).
  if (token) {
    await tokenStore.set({ token, cookie, mode: "bearer" });
    const me = await authApi.me().catch(() => null);
    if (me) return me;
  }

  // Fallback: signed session cookie (works on deployments that predate the
  // bearer plugin). Stored encrypted; never logged.
  if (cookie) {
    await tokenStore.set({ token: null, cookie, mode: "cookie" });
    const me = await authApi.me();
    return me;
  }

  await tokenStore.clear();
  throw new ApiError({
    kind: "server",
    code: "SESSION_UNAVAILABLE",
    message:
      "The server did not return a usable session. Ensure the backend supports mobile sessions (bearer plugin) and try again.",
  });
}

export const authApi = {
  async me(): Promise<AuthMe> {
    const { response } = await requestRaw("/auth/me");
    return readSession(response);
  },

  async signIn(input: { email: string; password: string }): Promise<AuthMe> {
    const { response, nextToken } = await requestRaw("/auth/sign-in/email", {
      method: "POST",
      anonymous: true,
      body: { email: input.email.trim().toLowerCase(), password: input.password },
    });
    return establishSession(response, nextToken);
  },

  async signUp(input: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    displayName?: string;
  }): Promise<AuthMe> {
    const { response, nextToken } = await requestRaw("/auth/sign-up/email", {
      method: "POST",
      anonymous: true,
      body: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: input.password,
        ...(input.phone ? { phone: input.phone } : {}),
        ...(input.displayName ? { displayName: input.displayName } : {}),
      },
    });
    return establishSession(response, nextToken);
  },

  async signOut(): Promise<void> {
    try {
      await authRequest("/auth/sign-out", { method: "POST", body: {} });
    } catch {
      // Local credentials are cleared regardless of network state.
    } finally {
      await tokenStore.clear();
    }
  },

  async requestPasswordResetOtp(email: string): Promise<void> {
    await authRequest("/auth/email-otp/request-password-reset", {
      method: "POST",
      anonymous: true,
      body: { email: email.trim().toLowerCase() },
    });
  },

  async resetPasswordWithOtp(input: { email: string; otp: string; password: string }): Promise<void> {
    await authRequest("/auth/email-otp/reset-password", {
      method: "POST",
      anonymous: true,
      body: {
        email: input.email.trim().toLowerCase(),
        otp: input.otp.trim(),
        password: input.password,
      },
    });
  },

  async sendVerificationOtp(email: string): Promise<void> {
    await authRequest("/auth/email-otp/send-verification-otp", {
      method: "POST",
      anonymous: true,
      body: { email: email.trim().toLowerCase(), type: "email-verification" },
    });
  },

  async verifyEmailOtp(input: { email: string; otp: string }): Promise<void> {
    await authRequest("/auth/email-otp/verify-email", {
      method: "POST",
      anonymous: true,
      body: { email: input.email.trim().toLowerCase(), otp: input.otp.trim() },
    });
  },
};
