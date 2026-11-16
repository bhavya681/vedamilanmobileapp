import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import React from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
} from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { Text } from "./Text";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: React.ReactNode;
  edges?: Edge[];
  contentContainerStyle?: ScrollViewProps["contentContainerStyle"];
  background?: string;
};

export function Screen({
  children,
  scroll = true,
  padded = true,
  title,
  subtitle,
  eyebrow,
  showBack = false,
  onBack,
  right,
  refreshing,
  onRefresh,
  footer,
  edges = ["top", "left", "right"],
  contentContainerStyle,
  background,
}: Props) {
  const { palette } = useTheme();
  const router = useRouter();
  const hasHeader = Boolean(title || showBack || right || eyebrow);

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        { padding: padded ? spacing.xl : 0, paddingBottom: spacing.giant },
        contentContainerStyle,
      ]}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={Boolean(refreshing)}
            onRefresh={onRefresh}
            tintColor={palette.gold}
            colors={[palette.gold]}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  ) : (
    <View style={{ flex: 1, padding: padded ? spacing.xl : 0 }}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={edges}
      style={{ flex: 1, backgroundColor: background ?? palette.canvas }}
    >
      {hasHeader ? (
        <View
          style={[
            styles.header,
            {
              backgroundColor: palette.canvas,
              borderBottomColor: palette.border,
            },
          ]}
        >
          {showBack ? (
            <Pressable
              onPress={
                onBack ??
                (() => {
                  if (router.canGoBack()) router.back();
                  else router.replace("/(tabs)");
                })
              }
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={10}
              style={({ pressed }) => [
                styles.back,
                {
                  backgroundColor: palette.raised,
                  borderColor: palette.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <ChevronLeft size={21} color={palette.text} strokeWidth={2} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1, gap: 1 }}>
            {eyebrow ? (
              <Text variant="micro" tone="gold" style={{ letterSpacing: 1.8 }}>
                {eyebrow.toUpperCase()}
              </Text>
            ) : null}
            {title ? (
              <Text variant="title" numberOfLines={1} weight="semibold">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text variant="caption" tone="muted" numberOfLines={2} style={{ marginTop: 1 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right ? <View style={{ marginLeft: spacing.sm }}>{right}</View> : null}
        </View>
      ) : null}
      {body}
      {footer}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
});
