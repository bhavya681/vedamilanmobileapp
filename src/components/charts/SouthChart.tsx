import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Rect } from "react-native-svg";

import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "@/components/ui/Text";
import type { SouthChartData } from "./types";

const GRID: (number | null)[] = [
  11, 0, 1, 2,
  10, null, null, 3,
  9, null, null, 4,
  8, 7, 6, 5,
];

const CELL_ORDER = GRID.map((signId, idx) => ({ signId, row: Math.floor(idx / 4), col: idx % 4 }));

export function SouthChart({ data, size }: { data: SouthChartData; size: number }) {
  const { palette } = useTheme();
  const cell = size / 4;

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="image"
      accessibilityLabel={`${data.style === "EAST" ? "East" : "South"} Indian birth chart. ${data.lagnaLabel}.`}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={StyleSheet.absoluteFill}>
        <Rect x={0} y={0} width={size} height={size} fill={palette.chartFill} stroke={palette.chartLine} strokeWidth={1.2} />
        {[1, 2, 3].map((i) => (
          <React.Fragment key={i}>
            <Line x1={0} y1={cell * i} x2={size} y2={cell * i} stroke={palette.chartLine} strokeWidth={0.7} opacity={0.7} />
            <Line x1={cell * i} y1={0} x2={cell * i} y2={size} stroke={palette.chartLine} strokeWidth={0.7} opacity={0.7} />
          </React.Fragment>
        ))}
      </Svg>
      {CELL_ORDER.filter((c) => c.signId !== null).map(({ signId, row, col }) => {
        const sign = data.signs.find((s) => s.signId === signId);
        if (!sign) return null;
        const isLagna = sign.house === 1;
        return (
          <View
            key={`${row}-${col}`}
            style={{
              position: "absolute",
              left: col * cell,
              top: row * cell,
              width: cell,
              height: cell,
              padding: 3,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              variant="micro"
              weight={isLagna ? "bold" : "medium"}
              tone={isLagna ? "gold" : "faint"}
              numberOfLines={1}
            >
              {sign.sign.slice(0, 3)}
              {isLagna ? " · Asc" : ""}
            </Text>
            {sign.planets.slice(0, 3).map((p) => (
              <Text
                key={`${p.planet}-${p.degree}`}
                variant="micro"
                weight="semibold"
                tone={p.isRetrograde ? "ruby" : "default"}
                numberOfLines={1}
              >
                {p.abbr} {p.degree}
              </Text>
            ))}
          </View>
        );
      })}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: cell,
          top: cell,
          width: cell * 2,
          height: cell * 2,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text variant="caption" tone="gold" weight="semibold">
          Rashi
        </Text>
        <Text variant="micro" tone="muted">
          {data.lagnaLabel}
        </Text>
      </View>
    </View>
  );
}
