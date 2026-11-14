import { tokenStore } from "@/lib/auth/tokenStore";

import { apiUrl, REQUEST_TIMEOUT_MS, UPLOAD_TIMEOUT_MS, WEB_URL } from "./config";
import { ApiError, kindFromStatus } from "./errors";

type ApiSuccess<T> = { success: true; data: T; meta?: Record<string, unknown> };
type ApiFailure = { success: false; error: { code?: string; message?: string; details?: unknown } };

export type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeoutMs?: number;
  /** Skips Authorization (public endpoints). */
  anonymous?: boolean;
  /** AbortSignal for screen-level cancellation. */
  signal?: AbortSignal;
};

let unauthorizedHandler: (() => void) | null = null;

/** Registered by the session provider so a 401 can clear local session state. */
export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };
  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (!options.anonymous) {
    const credentials = tokenStore.get();
    if (credentials.mode === "bearer" && credentials.token) {
      headers.Authorization = `Bearer ${credentials.token}`;
    } else if (credentials.cookie) {
      // Legacy fallback for deployments without the bearer plugin. The Origin
      // header matches the web app so Better Auth's CSRF/trusted-origin checks
      // treat this as a first-party client.
      headers.Cookie = credentials.cookie;
      headers.Origin = WEB_URL;
    }
  }
  return headers;
}

function buildUrl(path: string, query?: Record<string, unknown>): string {
  const base = apiUrl(path);
  if (!query) return base;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

async function execute(path: string, options: RequestOptions): Promise<Response> {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onExternalAbort = () => controller.abort();
  options.signal?.addEventListener("abort", onExternalAbort);

  try {
    return await fetch(buildUrl(path, options.query), {
      method,
      headers: buildHeaders(options),
      body:
        options.body === undefined
          ? undefined
          : options.body instanceof FormData
            ? options.body
            : JSON.stringify(options.body),
      signal: controller.signal,
    });
  } catch (error) {
    const aborted = controller.signal.aborted;
    const timedOut = aborted && !options.signal?.aborted;
    if (timedOut) {
      throw new ApiError({ kind: "timeout", message: "Request timed out", code: "TIMEOUT" });
    }
    if (options.signal?.aborted) {
      throw error;
    }
    throw new ApiError({
      kind: "network",
      message: error instanceof Error ? error.message : "Network request failed",
      code: "NETWORK_ERROR",
    });
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener("abort", onExternalAbort);
  }
}

async function toApiError(response: Response): Promise<ApiError> {
  let code = "HTTP_ERROR";
  let message = `Request failed with status ${response.status}`;
  let details: unknown;
  try {
    const body = (await response.json()) as ApiFailure;
    if (body && body.success === false && body.error) {
      code = body.error.code ?? code;
      message = body.error.message ?? message;
      details = body.error.details;
    }
  } catch {
    // Non-JSON error body (e.g. HTML error page). Keep the generic message.
  }
  return new ApiError({
    kind: kindFromStatus(response.status),
    status: response.status,
    code,
    message,
    details,
  });
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? "GET";
  let response: Response;

  try {
    response = await execute(path, options);
  } catch (error) {
    // One safe retry for idempotent reads only.
    if (method === "GET" && error instanceof ApiError && error.isNetwork) {
      response = await execute(path, options);
    } else {
      throw error;
    }
  }

  if (response.status === 401) {
    unauthorizedHandler?.();
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  let payload: ApiSuccess<T> | ApiFailure;
  try {
    payload = (await response.json()) as ApiSuccess<T> | ApiFailure;
  } catch {
    throw new ApiError({
      kind: "server",
      status: response.status,
      code: "INVALID_RESPONSE",
      message: "The server returned an unexpected response.",
    });
  }

  if (payload && payload.success === true) return payload.data;
  if (payload && payload.success === false) {
    throw new ApiError({
      kind: kindFromStatus(response.status),
      status: response.status,
      code: payload.error?.code ?? "API_ERROR",
      message: payload.error?.message ?? "Request failed",
      details: payload.error?.details,
    });
  }
  throw new ApiError({
    kind: "server",
    status: response.status,
    code: "INVALID_RESPONSE",
    message: "The server returned an unexpected response.",
  });
}

export async function requestRaw(
  path: string,
  options: RequestOptions = {},
): Promise<{ response: Response; nextToken: string | null }> {
  const response = await execute(path, options);
  const nextToken = response.headers.get("set-auth-token");
  if (response.status === 401) unauthorizedHandler?.();
  return { response, nextToken };
}

export function uploadRequest<T>(path: string, form: FormData, signal?: AbortSignal): Promise<T> {
  return request<T>(path, {
    method: "POST",
    body: form,
    timeoutMs: UPLOAD_TIMEOUT_MS,
    signal,
  });
}
