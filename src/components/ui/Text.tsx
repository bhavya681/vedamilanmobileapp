import React from "react";
import { Text as RNText, type TextProps as RNTextProps } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { fontSize, fontWeight } from "@/theme/tokens";
import { fontFamily } from "@/theme/typography";

export type TextVariant =
  | "hero"
  | "display"
  | "heading"
  | "titleLg"
  | "title"
  | "bodyLg"
  | "body"
  | "small"
  | "caption"
  | "micro"
  | "label"
  | "serif"
  | "serifLg";

export type TextTone = "default" | "muted" | "faint" | "gold" | "saffron" | "emerald" | "ruby" | "onAccent" | "temple";

type Props = RNTextProps & {
  variant?: TextVariant;
  tone?: TextTone;
  weight?: keyof typeof fontWeight;
  align?: "left" | "center" | "right";
  maxFontSizeMultiplier?: number;
};

const variantStyles: Record<TextVariant, { size: number; family: string; weight: keyof typeof fontWeight; lineHeight: number }> = {
  hero: { size: fontSize.hero, family: fontFamily.display, weight: "semibold", lineHeight: 44 },
  display: { size: fontSize.display, family: fontFamily.display, weight: "semibold", lineHeight: 38 },
  heading: { size: fontSize.heading, family: fontFamily.bodySemibold, weight: "semibold", lineHeight: 32 },
  titleLg: { size: fontSize.titleLg, family: fontFamily.bodySemibold, weight: "semibold", lineHeight: 28 },
  title: { size: fontSize.title, family: fontFamily.bodySemibold, weight: "semibold", lineHeight: 24 },
  bodyLg: { size: fontSize.bodyLg, family: fontFamily.body, weight: "regular", lineHeight: 23 },
  body: { size: fontSize.body, family: fontFamily.body, weight: "regular", lineHeight: 21 },
  small: { size: fontSize.small, family: fontFamily.body, weight: "regular", lineHeight: 18 },
  caption: { size: fontSize.caption, family: fontFamily.body, weight: "medium", lineHeight: 16 },
  micro: { size: fontSize.micro, family: fontFamily.body, weight: "semibold", lineHeight: 14 },
  label: { size: fontSize.small, family: fontFamily.bodySemibold, weight: "semibold", lineHeight: 18 },
  serif: { size: fontSize.titleLg, family: fontFamily.display, weight: "medium", lineHeight: 28 },
  serifLg: { size: fontSize.heading + 6, family: fontFamily.display, weight: "semibold", lineHeight: 38 },
};

export function Text({
  variant = "body",
  tone = "default",
  weight,
  align,
  style,
  maxFontSizeMultiplier = 1.6,
  ...rest
}: Props) {
  const { palette } = useTheme();
  const v = variantStyles[variant];
  const color =
    tone === "muted"
      ? palette.textMuted
      : tone === "faint"
        ? palette.textFaint
        : tone === "gold"
          ? palette.gold
          : tone === "saffron"
            ? palette.saffron
            : tone === "emerald"
              ? palette.emerald
              : tone === "ruby"
                ? palette.ruby
                : tone === "temple"
                  ? palette.temple
                  : tone === "onAccent"
                    ? palette.onAccent
                    : palette.text;

  const font =
    weight === "bold"
      ? fontFamily.bodyBold
      : weight === "semibold"
        ? fontFamily.bodySemibold
        : weight === "medium"
          ? fontFamily.bodyMedium
          : v.family;

  return (
    <RNText
      {...rest}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[
        {
          fontSize: v.size,
          lineHeight: v.lineHeight,
          fontFamily: font,
          color,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}
