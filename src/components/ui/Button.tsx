import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

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

  const height = size === "sm" ? 38 : size === "lg" ? 54 : 48;
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
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "gold" ? palette.onAccent : palette.text}
        />
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

  const bg = backgroundColor(variant, palette);

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
          backgroundColor: bg,
          borderColor: borderColor(variant, palette),
          borderWidth: variant === "secondary" || variant === "outline" ? 1 : 0,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
          minHeight: minTouchTarget,
        },
        fullWidth && { alignSelf: "stretch" },
        style,
      ]}
    >
      {variant === "gold" ? (
        <LinearGradient
          colors={[palette.goldSoft, palette.saffron]}
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
      return "transparent";
    case "ghost":
      return "transparent";
    case "danger":
      return palette.ruby;
    case "gold":
      return "transparent";
    case "outline":
      return "transparent";
  }
}

function borderColor(variant: ButtonVariant, palette: ReturnType<typeof useTheme>["palette"]) {
  if (variant === "secondary" || variant === "outline") return palette.borderStrong;
  return "transparent";
}

function textColorFor(variant: ButtonVariant, palette: ReturnType<typeof useTheme>["palette"]) {
  switch (variant) {
    case "primary":
      return palette.inverse;
    case "danger":
    case "gold":
      return palette.inverse;
    case "secondary":
    case "outline":
      return palette.text;
    case "ghost":
      return palette.temple;
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.md,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
