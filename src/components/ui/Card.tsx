import React from "react";
import { Pressable, StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

type Props = ViewProps & {
  padded?: boolean;
  tone?: "raised" | "sunken" | "outlined" | "gold" | "hero";
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
    tone === "raised" && {
      backgroundColor: palette.raised,
      borderColor: palette.border,
      shadowOpacity: 0.08,
    },
    tone === "sunken" && { backgroundColor: palette.sunken, borderColor: "transparent", shadowOpacity: 0 },
    tone === "outlined" && {
      backgroundColor: palette.raised,
      borderColor: palette.borderStrong,
      shadowOpacity: 0,
    },
    tone === "gold" && {
      backgroundColor: `${palette.goldSoft}0F`,
      borderColor: `${palette.goldSoft}66`,
      borderWidth: 1,
      shadowOpacity: 0,
    },
    tone === "hero" && {
      backgroundColor: palette.templeDeep,
      borderColor: `${palette.goldSoft}33`,
      shadowOpacity: 0,
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
      style={({ pressed }) => [base, pressed && { opacity: 0.92, transform: [{ scale: 0.995 }] }]}
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
    shadowColor: "#0B0F16",
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 12,
    shadowOpacity: 0,
    elevation: 1,
  },
});
