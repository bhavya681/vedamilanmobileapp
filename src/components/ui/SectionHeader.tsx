import React from "react";
import { Pressable, View } from "react-native";

import { spacing } from "@/theme/tokens";
import { Text } from "./Text";

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  style,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: object;
}) {
  return (
    <View
      style={[
        {
          flexDirection: "row",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: spacing.md,
          gap: spacing.md,
        },
        style,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text variant="title">{title}</Text>
        {subtitle ? (
          <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} hitSlop={10}>
          <Text variant="caption" weight="semibold" tone="gold">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
