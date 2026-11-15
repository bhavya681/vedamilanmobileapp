import { Stack } from "expo-router";
import React from "react";

import { AuthGate } from "@/components/auth/AuthGate";
import { useTheme } from "@/theme/ThemeProvider";

export default function OnboardingLayout() {
  const { palette } = useTheme();
  return (
    <AuthGate>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: palette.canvas },
          animation: "fade",
        }}
      />
    </AuthGate>
  );
}
