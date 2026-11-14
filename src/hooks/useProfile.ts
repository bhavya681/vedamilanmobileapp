import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { queryKeys } from "@/api/queryKeys";
import {
  profileApi,
  type AppearancePrefs,
  type BirthDetailsInput,
  type LocaleSettings,
  type ProfileUpdateInput,
} from "@/api/endpoints/profile";
import type { Preferences } from "@/api/types/models";
import { useSession } from "@/providers/SessionProvider";

export function useProfileBundle(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.profile.bundle,
    queryFn: () => profileApi.getBundle(),
    enabled: enabled && isAuthenticated,
  });
}

export function useBirthDetails(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.profile.birthDetails,
    queryFn: () => profileApi.getBirthDetails(),
    enabled: enabled && isAuthenticated,
  });
}

export function usePreferences(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.profile.preferences,
    queryFn: () => profileApi.getPreferences(),
    enabled: enabled && isAuthenticated,
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: ProfileUpdateInput) => profileApi.update(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.profile.bundle });
      void qc.invalidateQueries({ queryKey: ["matchmaking"] });
    },
  });
}

export function useSaveBirthDetails() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: BirthDetailsInput) => profileApi.saveBirthDetails(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.profile.bundle });
      void qc.invalidateQueries({ queryKey: queryKeys.profile.birthDetails });
      void qc.invalidateQueries({ queryKey: ["horoscope"] });
      void qc.invalidateQueries({ queryKey: ["astrology"] });
      void qc.invalidateQueries({ queryKey: ["panchanga"] });
      void qc.invalidateQueries({ queryKey: ["compatibility"] });
      void qc.invalidateQueries({ queryKey: ["numerology"] });
    },
  });
}

export function useSavePreferences() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Preferences) => profileApi.savePreferences(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.profile.preferences });
      void qc.invalidateQueries({ queryKey: queryKeys.profile.bundle });
    },
  });
}

export type PreferencesPatch = Partial<
  Preferences & {
    appearance?: AppearancePrefs;
    locale?: Partial<LocaleSettings>;
    discovery?: Record<string, unknown>;
  }
>;

export function useUploadPhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { dataUrl?: string; imageUrl?: string; makePrimary?: boolean }) =>
      profileApi.uploadPhoto(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.profile.bundle });
    },
  });
}

export function useDeletePhoto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (publicId: string) => profileApi.deletePhoto(publicId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.profile.bundle });
    },
  });
}
