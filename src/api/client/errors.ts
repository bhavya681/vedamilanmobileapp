export type ApiErrorKind =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "rate_limit"
  | "payment_required"
  | "server"
  | "network"
  | "timeout"
  | "unknown";

export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(args: {
    kind: ApiErrorKind;
    message: string;
    status?: number;
    code?: string;
    details?: unknown;
  }) {
    super(args.message);
    this.name = "ApiError";
    this.kind = args.kind;
    this.status = args.status ?? 0;
    this.code = args.code ?? "UNKNOWN";
    this.details = args.details;
  }

  get isNetwork() {
    return this.kind === "network" || this.kind === "timeout";
  }

  /** Copy that is safe to show to a user. */
  get userMessage(): string {
    switch (this.kind) {
      case "network":
        return "You appear to be offline. Check your connection and try again.";
      case "timeout":
        return "The connection took too long. Please try again.";
      case "unauthorized":
        return "Your session has expired. Please sign in again.";
      case "forbidden":
        return this.message || "You do not have access to this.";
      case "not_found":
        return this.message || "We could not find what you were looking for.";
      case "rate_limit":
        return "Too many requests. Please wait a moment and try again.";
      case "payment_required":
        return this.message || "A premium subscription is required.";
      case "validation":
        return this.message || "Please check the details and try again.";
      case "server":
        return "Something went wrong on our side. Please try again shortly.";
      default:
        return this.message || "Something went wrong. Please try again.";
    }
  }
}

export function kindFromStatus(status: number): ApiErrorKind {
  if (status === 401) return "unauthorized";
  if (status === 402) return "payment_required";
  if (status === 403) return "forbidden";
  if (status === 404) return "not_found";
  if (status === 400 || status === 422) return "validation";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server";
  return "unknown";
}

export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.userMessage;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
