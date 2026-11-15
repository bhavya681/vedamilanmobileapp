import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "vedamilan.session.token";
const COOKIE_KEY = "vedamilan.session.cookie";
const MODE_KEY = "vedamilan.session.mode";

export type AuthMode = "bearer" | "cookie";

export type SessionCredentials = {
  /** Bearer token (preferred; emitted as `set-auth-token` once the backend
   * bearer plugin is deployed — already patched in this workspace). */
  token: string | null;
  /** Signed Better Auth session cookie string. Used only as a fallback so the
   * app keeps working against deployments that predate the bearer plugin.
   * Stored in SecureStore, never AsyncStorage/localStorage. */
  cookie: string | null;
  mode: AuthMode;
};

let credentials: SessionCredentials = { token: null, cookie: null, mode: "bearer" };
let hydrated = false;
let hydration: Promise<SessionCredentials> | null = null;

async function secureAvailable(): Promise<boolean> {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}

async function readKey(key: string): Promise<string | null> {
  try {
    if (Platform.OS === "web") return globalThis.sessionStorage?.getItem(key) ?? null;
    if (await secureAvailable()) return await SecureStore.getItemAsync(key);
  } catch {
    // ignore
  }
  return null;
}

async function writeKey(key: string, value: string | null): Promise<void> {
  try {
    if (Platform.OS === "web") {
      if (value === null) globalThis.sessionStorage?.removeItem(key);
      else globalThis.sessionStorage?.setItem(key, value);
      return;
    }
    if (await secureAvailable()) {
      if (value === null) await SecureStore.deleteItemAsync(key);
      else
        await SecureStore.setItemAsync(key, value, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });
    }
  } catch {
    // Fail closed: in-memory credentials still work for this app session.
  }
}

export const tokenStore = {
  get(): SessionCredentials {
    return credentials;
  },

  getToken(): string | null {
    return credentials.token;
  },

  async hydrate(): Promise<SessionCredentials> {
    if (hydrated) return credentials;
    if (!hydration) {
      hydration = (async () => {
        const [token, cookie, mode] = await Promise.all([
          readKey(TOKEN_KEY),
          readKey(COOKIE_KEY),
          readKey(MODE_KEY),
        ]);
        credentials = {
          token: token || null,
          cookie: cookie || null,
          mode: mode === "cookie" ? "cookie" : "bearer",
        };
        hydrated = true;
        return credentials;
      })();
    }
    return hydration;
  },

  async set(next: Partial<SessionCredentials>): Promise<void> {
    await tokenStore.hydrate();
    credentials = {
      token: next.token !== undefined ? next.token : credentials.token,
      cookie: next.cookie !== undefined ? next.cookie : credentials.cookie,
      mode: next.mode ?? credentials.mode,
    };
    hydrated = true;
    await Promise.all([
      writeKey(TOKEN_KEY, credentials.token),
      writeKey(COOKIE_KEY, credentials.cookie),
      writeKey(MODE_KEY, credentials.mode),
    ]);
  },

  async clear(): Promise<void> {
    await tokenStore.hydrate().catch(() => undefined);
    credentials = { token: null, cookie: null, mode: "bearer" };
    hydrated = true;
    await Promise.all([writeKey(TOKEN_KEY, null), writeKey(COOKIE_KEY, null), writeKey(MODE_KEY, null)]);
  },
};

/**
 * Extract Better Auth cookies from a `set-cookie` header.
 * React Native returns headers as a single string; browsers may expose only
 * one cookie. We keep only auth-related cookies and never log their values.
 */
export function extractAuthCookie(setCookieHeader: string | null): string | null {
  if (!setCookieHeader) return null;
  const parts = setCookieHeader.split(/,(?=\s*[A-Za-z0-9_.-]+=)/);
  const pairs: string[] = [];
  for (const part of parts) {
    const pair = part.split(";")[0]?.trim() ?? "";
    const name = pair.split("=")[0]?.toLowerCase() ?? "";
    if (!pair.includes("=")) continue;
    if (name.includes("better-auth") || name.startsWith("ba_") || name.includes("session_token")) {
      pairs.push(pair);
    }
  }
  return pairs.length ? pairs.join("; ") : null;
}
