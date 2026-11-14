import { Stack } from "expo-router";
import React from "react";

import { useTheme } from "@/theme/ThemeProvider";

export default function AuthLayout() {
  const { palette } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: palette.canvas },
        animation: "slide_from_right",
      }}
    />
  );
}
