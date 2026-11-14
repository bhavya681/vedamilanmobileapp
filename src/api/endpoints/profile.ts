import { request } from "@/api/client/http";
import type { BirthDetails, Preferences, Profile, ProfileBundle } from "@/api/types/models";

export type ProfileUpdateInput = {
  name?: string;
  headline?: string;
  about?: string;
  gender?: "MALE" | "FEMALE" | "OTHER" | "UNDISCLOSED";
  dateOfBirth?: string | null;
  heightCm?: number | null;
  maritalStatus?: string;
  religion?: string | null;
  community?: string | null;
  motherTongue?: string | null;
  languages?: string[];
  education?: string | null;
  profession?: string | null;
  company?: string | null;
  incomeRange?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string;
  lifestyle?: { diet?: string | null; smoking?: string | null; drinking?: string | null };
  visibility?: "PUBLIC" | "MEMBERS" | "HIDDEN";
  privacy?: {
    showAge?: boolean;
    showMoonSign?: boolean;
    showLagna?: boolean;
    showManglik?: boolean;
    showNakshatra?: boolean;
    acceptInterests?: boolean;
    showOnlineStatus?: boolean;
  };
  completeOnboarding?: boolean;
};

export type BirthDetailsInput = Omit<BirthDetails, "ayanamsha" | "chartStylePreference"> & {
  ayanamsha?: string;
  chartStylePreference?: "NORTH" | "SOUTH" | "EAST";
};

export type AppearancePrefs = Record<string, unknown>;

export type LocaleSettings = {
  language: string;
  region: string;
  timezone: string;
  dateFormat: "locale" | "DMY" | "MDY" | "YMD";
  timeFormat: "12h" | "24h";
  currency: string;
  aiLanguage: string | null;
};

export const profileApi = {
  getBundle: () => request<ProfileBundle>("/profile"),

  update: (input: ProfileUpdateInput) =>
    request<Profile>("/profile", { method: "PATCH", body: input }),

  getBirthDetails: () => request<BirthDetails | null>("/birth-details"),

  saveBirthDetails: (input: BirthDetailsInput) =>
    request<BirthDetails>("/birth-details", { method: "PUT", body: input }),

  getPreferences: () => request<Preferences | null>("/preferences"),

  savePreferences: (input: Preferences) =>
    request<Preferences>("/preferences", { method: "PUT", body: input }),

  uploadPhoto: (input: { dataUrl?: string; imageUrl?: string; makePrimary?: boolean }) =>
    request<{ photo?: unknown; photos?: unknown }>("/profile/photos", {
      method: "POST",
      body: input,
      timeoutMs: 60_000,
    }),

  deletePhoto: (publicId: string) =>
    request<unknown>(`/profile/photos?publicId=${encodeURIComponent(publicId)}`, {
      method: "DELETE",
    }),

  getAppearance: () => request<AppearancePrefs>("/appearance"),

  saveAppearance: (input: AppearancePrefs) =>
    request<AppearancePrefs>("/appearance", { method: "PATCH", body: input }),

  getLocale: () => request<{ localization: LocaleSettings }>("/settings/locale"),

  saveLocale: (input: LocaleSettings) =>
    request<{ localization: LocaleSettings }>("/settings/locale", {
      method: "PATCH",
      body: input,
    }),
};
