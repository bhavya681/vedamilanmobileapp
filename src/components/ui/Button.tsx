import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { minTouchTarget, radii, spacing } from "@/theme/tokens";
import { Text } from "./Text";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "gold" | "outline";
export type ButtonSize = "sm" | "md" | "lg";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  haptics?: boolean;
  accessibilityHint?: string;
  textColor?: string;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  fullWidth,
  icon,
  haptics = true,
  accessibilityHint,
  textColor,
  style,
}: Props) {
  const { palette } = useTheme();
  const isDisabled = disabled || loading;

  const height = size === "sm" ? 40 : size === "lg" ? 54 : 48;
  const paddingH = size === "sm" ? spacing.md : spacing.xl;
  const textSize = size === "sm" ? "small" : "bodyLg";

  const handlePress = () => {
    if (isDisabled) return;
    if (haptics) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onPress?.();
  };

  const content = (
    <View style={[styles.inner, { paddingHorizontal: paddingH, height }]}>
      {loading ? (
        <ActivityIndicator size="small" color={textColorFor(variant, palette)} />
      ) : (
        <>
          {icon}
          <Text
            variant={textSize}
            weight="semibold"
            style={[
              { color: textColor ?? textColorFor(variant, palette) },
              icon ? { marginLeft: spacing.sm } : null,
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  const gradient =
    variant === "primary"
      ? palette.primaryGradient
      : variant === "gold"
        ? palette.goldGradient
        : null;

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: gradient ? "transparent" : backgroundColor(variant, palette),
          borderColor: borderColor(variant, palette),
          borderWidth: variant === "secondary" || variant === "outline" ? 1 : 0,
          opacity: isDisabled ? 0.5 : pressed ? 0.88 : 1,
          transform: [{ scale: pressed && !isDisabled ? 0.985 : 1 }],
          minHeight: minTouchTarget,
          shadowColor: gradient ? palette.shadow : "transparent",
          shadowOpacity: gradient ? 0.24 : 0,
        },
        fullWidth && { alignSelf: "stretch" },
        style,
      ]}
    >
      {gradient ? (
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radii.md }]}
        />
      ) : null}
      {content}
    </Pressable>
  );
}

function backgroundColor(variant: ButtonVariant, palette: ReturnType<typeof useTheme>["palette"]) {
  switch (variant) {
    case "primary":
      return palette.temple;
    case "secondary":
      return palette.raised;
    case "ghost":
      return "transparent";
    case "danger":
      return palette.ruby;
    case "gold":
      return palette.gold;
    case "outline":
      return "transparent";
  }
}

function borderColor(variant: ButtonVariant, palette: ReturnType<typeof useTheme>["palette"]) {
  if (variant === "secondary") return palette.border;
  if (variant === "outline") return palette.borderStrong;
  return "transparent";
}

function textColorFor(variant: ButtonVariant, palette: ReturnType<typeof useTheme>["palette"]) {
  switch (variant) {
    case "primary":
      return palette.onAccent;
    case "danger":
      return "#FFFFFF";
    case "gold":
      return palette.onGold;
    case "secondary":
    case "outline":
      return palette.text;
    case "ghost":
      return palette.gold;
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    overflow: "hidden",
    alignSelf: "flex-start",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
