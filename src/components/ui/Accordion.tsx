import { ChevronDown } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { Text } from "./Text";

export function Accordion({
  title,
  subtitle,
  children,
  defaultOpen = false,
  badge,
  tone = "default",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
  tone?: "default" | "warning" | "positive";
}) {
  const { palette } = useTheme();
  const [open, setOpen] = useState(defaultOpen);
  const accent = tone === "warning" ? palette.amber : tone === "positive" ? palette.emerald : palette.text;

  return (
    <View style={[styles.wrap, { borderColor: palette.border }]}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={title}
        style={styles.header}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Text variant="label" style={{ color: accent, flexShrink: 1 }}>
              {title}
            </Text>
            {badge ? (
              <Text variant="micro" tone="faint">
                {badge}
              </Text>
            ) : null}
          </View>
          {subtitle ? (
            <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <ChevronDown
          size={18}
          color={palette.textMuted}
          style={{ transform: [{ rotate: open ? "180deg" : "0deg" }] }}
        />
      </Pressable>
      {open ? <View style={{ paddingBottom: spacing.lg, gap: spacing.sm }}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingBottom: spacing.sm,
    minHeight: 36,
  },
});
