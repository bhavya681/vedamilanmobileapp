import { Check } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { Text } from "./Text";

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  size?: "sm" | "md";
  tone?: "neutral" | "gold" | "emerald" | "ruby";
};

export function Chip({ label, selected, onPress, size = "md", tone = "neutral" }: Props) {
  const { palette } = useTheme();
  const accent =
    tone === "gold" ? palette.gold : tone === "emerald" ? palette.emerald : tone === "ruby" ? palette.ruby : palette.temple;

  const content = (
    <>
      {selected && onPress ? (
        <Check size={13} color={accent} style={{ marginRight: 4 }} />
      ) : null}
      <Text
        variant="caption"
        weight="semibold"
        style={{ color: selected ? accent : palette.textMuted }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </>
  );

  const style = [
    styles.chip,
    {
      paddingHorizontal: size === "sm" ? spacing.sm + 2 : spacing.md,
      paddingVertical: size === "sm" ? 5 : 7,
      borderColor: selected ? accent : palette.border,
      backgroundColor: selected ? `${accent}14` : palette.raised,
    },
  ];

  if (!onPress) return <Pressable style={style} accessible accessibilityLabel={label}>{content}</Pressable>;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [style, pressed && { opacity: 0.75 }]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
