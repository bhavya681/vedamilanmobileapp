import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { useProfileBundle } from "@/hooks/useProfile";
import { useSession } from "@/providers/SessionProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { Text } from "@/components/ui/Text";

export default function Bootstrap() {
  const router = useRouter();
  const { status, isAuthenticated } = useSession();
  const { palette } = useTheme();
  const bundle = useProfileBundle(isAuthenticated);

  useEffect(() => {
    if (status === "loading") return;
    if (!isAuthenticated) {
      router.replace("/(auth)/welcome");
      return;
    }
    if (bundle.isLoading) return;
    if (bundle.isError) {
      router.replace("/(tabs)");
      return;
    }
    const hasBirthDetails = Boolean(bundle.data?.birthDetails?.birthDate);
    router.replace(hasBirthDetails ? "/(tabs)" : "/(onboarding)");
  }, [status, isAuthenticated, bundle.isLoading, bundle.isError, bundle.data, router]);

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: palette.canvas,
        gap: spacing.xl,
      }}
    >
      <LogoMark size={96} />
      <Wordmark size="lg" />
      <ActivityIndicator color={palette.gold} style={{ marginTop: spacing.lg }} />
      <Text variant="caption" tone="faint">
        Aligning the stars…
      </Text>
    </View>
  );
}
