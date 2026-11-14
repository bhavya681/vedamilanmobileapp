import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { Text } from "@/components/ui/Text";

export function AuthShell({
  title,
  subtitle,
  children,
  showBack = true,
  footer,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showBack?: boolean;
  footer?: React.ReactNode;
  eyebrow?: string;
}) {
  const { palette } = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {showBack ? (
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(auth)/welcome"))}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              style={styles.back}
            >
              <ChevronLeft size={24} color={palette.text} />
            </Pressable>
          ) : null}

          <View style={{ gap: spacing.sm, marginBottom: spacing.xxl }}>
            {eyebrow ? (
              <Text variant="micro" tone="gold" style={{ letterSpacing: 2 }}>
                {eyebrow.toUpperCase()}
              </Text>
            ) : null}
            <Text variant="display">{title}</Text>
            {subtitle ? (
              <Text variant="bodyLg" tone="muted">
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={{ gap: spacing.lg }}>{children}</View>
          {footer ? <View style={{ marginTop: spacing.xxl }}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxxl,
  },
  back: {
    width: 40,
    height: 40,
    marginLeft: -spacing.sm,
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
});
