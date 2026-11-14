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
import { spacing } from "@/theme/tokens";
import { Text } from "./Text";

type Props = {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  title?: string;
  subtitle?: string;
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

  const body = scroll ? (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        { padding: padded ? spacing.xl : 0, paddingBottom: spacing.huge },
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
      {title || showBack || right ? (
        <View style={[styles.header, { borderBottomColor: palette.border }]}>
          {showBack ? (
            <Pressable
              onPress={onBack ?? (() => router.back())}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={12}
              style={styles.back}
            >
              <ChevronLeft size={24} color={palette.text} />
            </Pressable>
          ) : null}
          <View style={{ flex: 1 }}>
            {title ? (
              <Text variant="titleLg" numberOfLines={1}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text variant="caption" tone="muted" numberOfLines={2} style={{ marginTop: 2 }}>
                {subtitle}
              </Text>
            ) : null}
          </View>
          {right ? <View style={{ marginLeft: spacing.md }}>{right}</View> : null}
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
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  back: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
