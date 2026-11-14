import { z } from "zod";

const email = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Enter a valid email address")
  .transform((v) => v.toLowerCase());

const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80),
    email,
    phone: z
      .string()
      .trim()
      .regex(/^[+]?[0-9\s-]{8,16}$/, "Enter a valid phone number")
      .optional()
      .or(z.literal("")),
    password,
    confirmPassword: z.string(),
    acceptedTerms: z.literal(true, { error: "Please accept the Terms and Privacy Policy" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({
    email,
    otp: z.string().trim().regex(/^\d{4,8}$/, "Enter the 4–8 digit code"),
    password,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const verifyEmailSchema = z.object({
  email,
  otp: z.string().trim().regex(/^\d{4,8}$/, "Enter the 4–8 digit code"),
});

export const birthDetailsSchema = z.object({
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Choose your birth date"),
  birthTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Choose your birth time"),
  birthTimeUnknown: z.boolean().optional(),
  placeName: z.string().trim().min(2, "Enter your birth city"),
  latitude: z.coerce.number().min(-90, "Latitude must be between -90 and 90").max(90),
  longitude: z.coerce.number().min(-180, "Longitude must be between -180 and 180").max(180),
  timezone: z.string().trim().min(3, "Enter your timezone"),
  chartStylePreference: z.enum(["NORTH", "SOUTH", "EAST"]).optional(),
  ayanamsha: z.string().optional(),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
export type ForgotValues = z.infer<typeof forgotSchema>;
export type ResetValues = z.infer<typeof resetSchema>;
export type BirthDetailsValues = z.infer<typeof birthDetailsSchema>;
