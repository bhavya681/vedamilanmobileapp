import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { palettes, type ColorScheme, type Palette } from "./tokens";

export type ThemeMode = "light" | "dark" | "system";

type ThemePreferenceState = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const useThemePreference = create<ThemePreferenceState>()(
  persist(
    (set) => ({
      mode: "system",
      setMode: (mode) => set({ mode }),
    }),
    {
      name: "vedamilan.theme",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

type ThemeContextValue = {
  mode: ThemeMode;
  scheme: ColorScheme;
  palette: Palette;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const mode = useThemePreference((s) => s.mode);
  const setMode = useThemePreference((s) => s.setMode);

  const scheme: ColorScheme = mode === "system" ? (systemScheme === "dark" ? "dark" : "light") : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({ mode, scheme, palette: palettes[scheme], setMode }),
    [mode, scheme, setMode],
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
  const create = useCallback(() => factory(palette, scheme), [factory, palette, scheme]);
  return useMemo(create, [create]);
}
