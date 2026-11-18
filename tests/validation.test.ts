import { describe, expect, it } from "vitest";

import {
  birthDetailsSchema,
  loginSchema,
  registerSchema,
  resetSchema,
} from "@/lib/validation";

describe("form validation", () => {
  it("normalizes email and requires a password on login", () => {
    expect(loginSchema.parse({ email: "  USER@Example.com ", password: "secret" })).toEqual({
      email: "user@example.com",
      password: "secret",
    });
    expect(loginSchema.safeParse({ email: "not-an-email", password: "secret" }).success).toBe(false);
  });

  it("enforces registration rules", () => {
    const base = {
      name: "Asha Rao",
      email: "asha@example.com",
      password: "Vedic123",
      confirmPassword: "Vedic123",
      acceptedTerms: true,
    };
    expect(registerSchema.safeParse(base).success).toBe(true);
    expect(registerSchema.safeParse({ ...base, confirmPassword: "Different1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, acceptedTerms: false }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
  });

  it("validates OTP and matching passwords on reset", () => {
    const valid = {
      email: "asha@example.com",
      otp: "123456",
      password: "Vedic123",
      confirmPassword: "Vedic123",
    };
    expect(resetSchema.safeParse(valid).success).toBe(true);
    expect(resetSchema.safeParse({ ...valid, otp: "abc" }).success).toBe(false);
  });

  it("validates birth details used for chart generation", () => {
    const valid = {
      birthDate: "1994-08-17",
      birthTime: "14:35",
      placeName: "Mumbai",
      latitude: 19.076,
      longitude: 72.8777,
      timezone: "Asia/Kolkata",
    };
    expect(birthDetailsSchema.safeParse(valid).success).toBe(true);
    expect(birthDetailsSchema.safeParse({ ...valid, latitude: 190 }).success).toBe(false);
    expect(birthDetailsSchema.safeParse({ ...valid, birthDate: "17-08-1994" }).success).toBe(false);
  });
});
