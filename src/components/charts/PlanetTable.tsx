import React from "react";
import { StyleSheet, View } from "react-native";

import { Text } from "@/components/ui/Text";
import { GRAHA_LABELS, SIGNS } from "@/lib/constants";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import type { ChartPlanetGlyph } from "./types";

export function PlanetTable({ planets }: { planets: ChartPlanetGlyph[] }) {
  const { palette } = useTheme();
  const rows = [...planets].sort((a, b) => (a.house ?? 0) - (b.house ?? 0));

  return (
    <View>
      <View style={[styles.row, styles.headerRow, { borderBottomColor: palette.border }]}>
        <Text variant="micro" tone="faint" style={{ flex: 1.3 }}>
          PLANET
        </Text>
        <Text variant="micro" tone="faint" style={{ flex: 1.2 }}>
          SIGN
        </Text>
        <Text variant="micro" tone="faint" style={{ flex: 0.7, textAlign: "center" }}>
          HOUSE
        </Text>
        <Text variant="micro" tone="faint" style={{ flex: 1, textAlign: "right" }}>
          DEGREE
        </Text>
      </View>
      {rows.map((p, idx) => (
        <View
          key={`${p.planet}-${idx}`}
          style={[
            styles.row,
            { borderBottomColor: palette.border, borderBottomWidth: idx === rows.length - 1 ? 0 : StyleSheet.hairlineWidth },
          ]}
        >
          <View style={{ flex: 1.3 }}>
            <Text variant="small" weight="semibold">
              {GRAHA_LABELS[p.planet] ?? p.planet}
            </Text>
            <Text variant="micro" tone="faint">
              {p.planet}
              {p.dignity ? ` · ${p.dignity}` : ""}
            </Text>
          </View>
          <Text variant="small" style={{ flex: 1.2 }} numberOfLines={1}>
            {p.signId !== undefined ? (SIGNS[p.signId] ?? "—") : "—"}
          </Text>
          <Text variant="small" style={{ flex: 0.7, textAlign: "center" }}>
            {p.house ?? "—"}
          </Text>
          <Text
            variant="small"
            style={{ flex: 1, textAlign: "right", color: p.isRetrograde ? palette.ruby : palette.text }}
          >
            {p.degree}
            {p.isRetrograde ? " ℞" : ""}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.sm + 2,
    gap: spacing.xs,
  },
  headerRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingBottom: spacing.xs,
  },
});
