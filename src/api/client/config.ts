const DEFAULT_API_URL = "https://vedamilan-lihn.vercel.app";

function normalizeBaseUrl(value: string | undefined): string {
  const raw = (value ?? DEFAULT_API_URL).trim();
  return raw.replace(/\/+$/, "");
}

export const API_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
export const WEB_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_WEB_URL || API_URL);

export const REQUEST_TIMEOUT_MS = 25_000;
export const UPLOAD_TIMEOUT_MS = 60_000;

export const PUSHER_KEY = process.env.EXPO_PUBLIC_PUSHER_KEY ?? "";
export const PUSHER_CLUSTER = process.env.EXPO_PUBLIC_PUSHER_CLUSTER ?? "ap2";
export const PUSHER_ENABLED = PUSHER_KEY.length > 0;

export const isProductionApi = API_URL.includes("vedamilan-lihn.vercel.app");

/** Builds an absolute API URL from a path beginning with "/". */
export function apiUrl(path: string): string {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function withQuery(path: string, query?: Record<string, unknown>): string {
  if (!query) return path;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.append(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
