import React, { useState } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { NorthChart } from "./NorthChart";
import { SouthChart } from "./SouthChart";
import { chartPlanets, isNorthChart, type ChartData } from "./types";
import { PlanetTable } from "./PlanetTable";

export function ChartView({ data, size }: { data: ChartData; size: number }) {
  if (isNorthChart(data)) return <NorthChart data={data} size={size} />;
  return <SouthChart data={data} size={size} />;
}

export function ChartCard({
  chart,
  title = "Birth Chart",
  caption,
}: {
  chart: ChartData;
  title?: string;
  caption?: string;
}) {
  const { palette } = useTheme();
  const { width } = useWindowDimensions();
  const [style, setStyle] = useState<"chart" | "table">("chart");
  const size = Math.min(width - spacing.xl * 2 - spacing.lg * 2, 340);

  return (
    <Card padded={false}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text variant="title">{title}</Text>
          {caption ? (
            <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
              {caption}
            </Text>
          ) : null}
        </View>
        <View style={[styles.toggle, { borderColor: palette.border }]}>
          {(["chart", "table"] as const).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setStyle(mode)}
              accessibilityRole="button"
              accessibilityState={{ selected: style === mode }}
              style={[
                styles.toggleItem,
                style === mode && { backgroundColor: palette.sunken },
              ]}
            >
              <Text
                variant="micro"
                weight="semibold"
                style={{ color: style === mode ? palette.text : palette.textFaint }}
              >
                {mode === "chart" ? "CHART" : "TABLE"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={{ padding: spacing.lg }}>
        {style === "chart" ? (
          <View style={{ alignItems: "center" }}>
            <ChartView data={chart} size={size} />
          </View>
        ) : (
          <PlanetTable planets={chartPlanets(chart)} />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: 0,
  },
  toggle: {
    flexDirection: "row",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.sm,
    overflow: "hidden",
  },
  toggleItem: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 5,
  },
});
