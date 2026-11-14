import React from "react";
import { StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { Text } from "./Text";

export function Divider({ label, spacingY = spacing.lg }: { label?: string; spacingY?: number }) {
  const { palette } = useTheme();
  if (!label) {
    return (
      <View
        style={{
          height: StyleSheet.hairlineWidth,
          backgroundColor: palette.border,
          marginVertical: spacingY,
        }}
      />
    );
  }
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginVertical: spacingY }}>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: palette.border }} />
      <Text variant="micro" tone="faint">
        {label.toUpperCase()}
      </Text>
      <View style={{ flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: palette.border }} />
    </View>
  );
}
