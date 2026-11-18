import { describe, expect, it } from "vitest";

import { ApiError, errorMessage, kindFromStatus } from "@/api/client/errors";
import { withQuery } from "@/api/client/config";

describe("API error taxonomy", () => {
  it("maps backend status codes to error kinds", () => {
    expect(kindFromStatus(400)).toBe("validation");
    expect(kindFromStatus(401)).toBe("unauthorized");
    expect(kindFromStatus(403)).toBe("forbidden");
    expect(kindFromStatus(404)).toBe("not_found");
    expect(kindFromStatus(429)).toBe("rate_limit");
    expect(kindFromStatus(500)).toBe("server");
  });

  it("shows safe copy for server and rate-limit failures", () => {
    expect(errorMessage(new ApiError({ kind: "server", message: "postgres stack trace" }))).not.toContain("postgres");
    expect(errorMessage(new ApiError({ kind: "rate_limit", message: "raw" }))).toMatch(/too many/i);
  });

  it("classifies network errors as retryable", () => {
    const error = new ApiError({ kind: "timeout", message: "aborted" });
    expect(error.isNetwork).toBe(true);
    expect(errorMessage(error)).toMatch(/too long/i);
  });

  it("serializes query values without empty parameters", () => {
    expect(withQuery("/matches", { q: "a b", page: 2, empty: "", skip: undefined })).toBe(
      "/matches?q=a+b&page=2",
    );
  });
});
