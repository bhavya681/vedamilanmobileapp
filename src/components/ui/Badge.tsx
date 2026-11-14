import React from "react";
import { View, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { Text } from "./Text";

export function Badge({
  label,
  tone = "gold",
  size = "md",
}: {
  label: string;
  tone?: "gold" | "emerald" | "ruby" | "temple" | "neutral";
  size?: "sm" | "md";
}) {
  const { palette } = useTheme();
  const color =
    tone === "emerald"
      ? palette.emerald
      : tone === "ruby"
        ? palette.ruby
        : tone === "temple"
          ? palette.temple
          : tone === "neutral"
            ? palette.textMuted
            : palette.gold;

  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: `${color}55`,
          backgroundColor: `${color}14`,
          paddingHorizontal: size === "sm" ? spacing.sm : spacing.md,
          paddingVertical: size === "sm" ? 2 : 3,
        },
      ]}
    >
      <Text variant={size === "sm" ? "micro" : "caption"} weight="semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radii.pill,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
});
