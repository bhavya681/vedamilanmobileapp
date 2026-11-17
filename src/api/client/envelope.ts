export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiFailure = {
  success: false;
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
};

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure;

export function isApiSuccess<T>(payload: unknown): payload is ApiSuccess<T> {
  return Boolean(payload && typeof payload === "object" && (payload as { success?: unknown }).success === true);
}

export function isApiFailure(payload: unknown): payload is ApiFailure {
  return Boolean(payload && typeof payload === "object" && (payload as { success?: unknown }).success === false);
}

export function readApiFailure(payload: unknown): ApiFailure["error"] {
  if (!isApiFailure(payload)) return undefined;
  return payload.error;
}
