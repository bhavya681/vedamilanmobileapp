import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { profileApi } from "@/api/endpoints/profile";
import { queryKeys } from "@/api/queryKeys";
import { useSession } from "@/providers/SessionProvider";
import { useAppearancePreference, useTheme } from "@/theme/ThemeProvider";
import {
  normalizeAppearance,
  type AppearancePreferences,
} from "@/theme/presets";

const appearanceKey = queryKeys.profile.appearance;

export function useAppearanceQuery(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: appearanceKey,
    queryFn: () => profileApi.getAppearance(),
    enabled: enabled && isAuthenticated,
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export function useAppearanceController() {
  const theme = useTheme();
  const { isAuthenticated } = useSession();
  const qc = useQueryClient();
  const setAppearance = useAppearancePreference((state) => state.setAppearance);
  const resetAppearance = useAppearancePreference((state) => state.resetAppearance);

  const mutation = useMutation({
    mutationFn: (prefs: AppearancePreferences) => profileApi.saveAppearance(prefs),
    onSuccess: (saved) => {
      const normalized = normalizeAppearance(saved);
      setAppearance(normalized);
      qc.setQueryData(appearanceKey, normalized);
    },
  });

  const update = useCallback(
    (patch: Partial<AppearancePreferences>) => {
      const next = normalizeAppearance({
        mode: theme.mode,
        theme: theme.theme,
        expression: theme.expression,
        accentOverride: theme.accentOverride,
        borderIntensity: theme.borderIntensity,
        reducedMotion: theme.reducedMotion,
        ...patch,
      });
      setAppearance(next);
      if (isAuthenticated) mutation.mutate(next);
    },
    [
      isAuthenticated,
      mutation,
      setAppearance,
      theme.accentOverride,
      theme.borderIntensity,
      theme.expression,
      theme.mode,
      theme.reducedMotion,
      theme.theme,
    ],
  );

  const reset = useCallback(() => {
    const next = normalizeAppearance({});
    resetAppearance();
    if (isAuthenticated) mutation.mutate(next);
  }, [isAuthenticated, mutation, resetAppearance]);

  return {
    ...theme,
    update,
    reset,
    saving: mutation.isPending,
    saveError: mutation.error,
    isAuthenticated,
  };
}
