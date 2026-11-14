import React from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

type Props = ViewProps & {
  padded?: boolean;
  tone?: "raised" | "sunken" | "outlined" | "gold";
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Card({
  padded = true,
  tone = "raised",
  onPress,
  style,
  children,
  accessibilityLabel,
  ...rest
}: Props) {
  const { palette } = useTheme();
  const base = [
    styles.base,
    padded && { padding: spacing.lg },
    tone === "raised" && { backgroundColor: palette.raised, borderColor: palette.border },
    tone === "sunken" && { backgroundColor: palette.sunken, borderColor: "transparent" },
    tone === "outlined" && { backgroundColor: "transparent", borderColor: palette.borderStrong },
    tone === "gold" && {
      backgroundColor: palette.raised,
      borderColor: palette.goldSoft,
      borderWidth: 1,
    },
    style,
  ];

  if (!onPress) {
    return (
      <View {...rest} style={base}>
        {children}
      </View>
    );
  }

  return (
    <Pressable
      {...rest}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [base, pressed && { opacity: 0.9, transform: [{ scale: 0.998 }] }]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
});
