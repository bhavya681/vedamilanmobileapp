import { Redirect } from "expo-router";
import React from "react";
import { ActivityIndicator, View } from "react-native";

import { useSession } from "@/providers/SessionProvider";
import { useTheme } from "@/theme/ThemeProvider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const { palette } = useTheme();

  if (status === "loading") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.canvas,
        }}
      >
        <ActivityIndicator color={palette.gold} />
      </View>
    );
  }

  if (status !== "authenticated") {
    return <Redirect href="/(auth)/welcome" />;
  }

  return <>{children}</>;
}
