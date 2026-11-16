import { Stack } from "expo-router";
import React from "react";
import { View } from "react-native";

import { AuthGate } from "@/components/auth/AuthGate";
import { AppTabBar } from "@/components/navigation/AppTabBar";
import { useTheme } from "@/theme/ThemeProvider";

export default function AppLayout() {
  const { palette } = useTheme();
  return (
    <AuthGate>
      <View style={{ flex: 1, backgroundColor: palette.canvas }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: palette.canvas },
            animation: "slide_from_right",
            gestureEnabled: true,
          }}
        />
        <AppTabBar />
      </View>
    </AuthGate>
  );
}
