import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  normalizeAppearance,
  resolvePresetPalette,
  type AccentOverrideId,
  type AppearanceExpression,
  type AppearanceMode,
  type AppearancePreferences,
  type AppearanceThemeId,
  type BorderIntensity,
} from "./presets";
import type { ColorScheme, Palette } from "./tokens";

export type ThemeMode = AppearanceMode;
export type { AppearancePreferences };

type AppearanceStore = Required<AppearancePreferences> & {
  setMode: (mode: AppearanceMode) => void;
  setTheme: (theme: AppearanceThemeId) => void;
  setExpression: (expression: AppearanceExpression) => void;
  setAccentOverride: (accentOverride: AccentOverrideId | null) => void;
  setBorderIntensity: (borderIntensity: BorderIntensity) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setAppearance: (prefs: Partial<AppearancePreferences>) => void;
  resetAppearance: () => void;
};

export const useAppearancePreference = create<AppearanceStore>()(
  persist(
    (set) => ({
      ...DEFAULT_APPEARANCE,
      setMode: (mode) => set({ mode }),
      setTheme: (theme) => set({ theme }),
      setExpression: (expression) => set({ expression }),
      setAccentOverride: (accentOverride) => set({ accentOverride }),
      setBorderIntensity: (borderIntensity) => set({ borderIntensity }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setAppearance: (prefs) => set((state) => normalizeAppearance({ ...state, ...prefs })),
      resetAppearance: () => set({ ...DEFAULT_APPEARANCE }),
    }),
    {
      name: APPEARANCE_STORAGE_KEY,
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      partialize: (state) => ({
        mode: state.mode,
        theme: state.theme,
        expression: state.expression,
        accentOverride: state.accentOverride,
        borderIntensity: state.borderIntensity,
        reducedMotion: state.reducedMotion,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...normalizeAppearance(persisted as Partial<AppearancePreferences>),
      }),
    },
  ),
);

export const useThemePreference = useAppearancePreference;

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: ColorScheme;
  theme: AppearanceThemeId;
  expression: AppearanceExpression;
  accentOverride: AccentOverrideId | null;
  borderIntensity: BorderIntensity;
  reducedMotion: boolean;
  palette: Palette;
  setMode: (mode: ThemeMode) => void;
  setTheme: (theme: AppearanceThemeId) => void;
  setExpression: (expression: AppearanceExpression) => void;
  setAccentOverride: (accentOverride: AccentOverrideId | null) => void;
  setBorderIntensity: (borderIntensity: BorderIntensity) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
  setAppearance: (prefs: Partial<AppearancePreferences>) => void;
  resetAppearance: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const mode = useAppearancePreference((s) => s.mode);
  const theme = useAppearancePreference((s) => s.theme);
  const expression = useAppearancePreference((s) => s.expression);
  const accentOverride = useAppearancePreference((s) => s.accentOverride);
  const borderIntensity = useAppearancePreference((s) => s.borderIntensity);
  const reducedMotion = useAppearancePreference((s) => s.reducedMotion);
  const setMode = useAppearancePreference((s) => s.setMode);
  const setTheme = useAppearancePreference((s) => s.setTheme);
  const setExpression = useAppearancePreference((s) => s.setExpression);
  const setAccentOverride = useAppearancePreference((s) => s.setAccentOverride);
  const setBorderIntensity = useAppearancePreference((s) => s.setBorderIntensity);
  const setReducedMotion = useAppearancePreference((s) => s.setReducedMotion);
  const setAppearance = useAppearancePreference((s) => s.setAppearance);
  const resetAppearance = useAppearancePreference((s) => s.resetAppearance);

  const scheme: ColorScheme = mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const palette = useMemo(
    () =>
      resolvePresetPalette(scheme, {
        theme,
        expression,
        accentOverride,
        borderIntensity,
      }),
    [scheme, theme, expression, accentOverride, borderIntensity],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      scheme,
      theme,
      expression,
      accentOverride,
      borderIntensity,
      reducedMotion,
      palette,
      setMode,
      setTheme,
      setExpression,
      setAccentOverride,
      setBorderIntensity,
      setReducedMotion,
      setAppearance,
      resetAppearance,
    }),
    [
      mode,
      scheme,
      theme,
      expression,
      accentOverride,
      borderIntensity,
      reducedMotion,
      palette,
      setMode,
      setTheme,
      setExpression,
      setAccentOverride,
      setBorderIntensity,
      setReducedMotion,
      setAppearance,
      resetAppearance,
    ],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
  return ctx;
}

export function useThemedStyles<T>(factory: (palette: Palette, scheme: ColorScheme) => T): T {
  const { palette, scheme } = useTheme();
  return useMemo(() => factory(palette, scheme), [factory, palette, scheme]);
}
