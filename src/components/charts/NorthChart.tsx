import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Line, Polygon } from "react-native-svg";

import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "@/components/ui/Text";
import type { NorthChartData } from "./types";

const SIZE = 300;

const POLYGONS: Record<number, string> = {
  1: "150,0 225,75 150,150 75,75",
  2: "0,0 150,0 75,75",
  3: "0,0 75,75 0,150",
  4: "0,150 75,75 150,150 75,225",
  5: "0,150 75,225 0,300",
  6: "0,300 75,225 150,300",
  7: "150,300 75,225 150,150 225,225",
  8: "150,300 225,225 300,300",
  9: "300,300 225,225 300,150",
  10: "300,150 225,225 150,150 225,75",
  11: "300,150 225,75 300,0",
  12: "300,0 225,75 150,0",
};

const ANCHORS: Record<number, { left: number; top: number }> = {
  1: { left: 50, top: 23 },
  2: { left: 24, top: 10 },
  3: { left: 9, top: 28 },
  4: { left: 24, top: 50 },
  5: { left: 9, top: 73 },
  6: { left: 24, top: 90 },
  7: { left: 50, top: 77 },
  8: { left: 76, top: 90 },
  9: { left: 91, top: 73 },
  10: { left: 76, top: 50 },
  11: { left: 91, top: 28 },
  12: { left: 76, top: 10 },
};

export function NorthChart({ data, size }: { data: NorthChartData; size: number }) {
  const { palette } = useTheme();

  return (
    <View
      style={{ width: size, height: size }}
      accessibilityRole="image"
      accessibilityLabel={`North Indian birth chart. ${data.lagnaLabel}.`}
    >
      <Svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`} style={StyleSheet.absoluteFill}>
        <Polygon points="0,0 300,0 300,300 0,300" fill={palette.chartFill} stroke={palette.chartLine} strokeWidth={1.4} />
        {Object.entries(POLYGONS).map(([house, points]) => (
          <Polygon
            key={house}
            points={points}
            fill="transparent"
            stroke={palette.chartLine}
            strokeWidth={0.8}
            opacity={0.75}
          />
        ))}
        <Line x1={0} y1={0} x2={300} y2={300} stroke={palette.chartLine} strokeWidth={0.8} opacity={0} />
      </Svg>
      {Object.entries(ANCHORS).map(([house, anchor]) => {
        const planets = data.houses[house] ?? [];
        const houseNo = Number(house);
        return (
          <View
            key={house}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: `${anchor.left}%`,
              top: `${anchor.top}%`,
              transform: [{ translateX: -30 }, { translateY: -18 }],
              width: 60,
              alignItems: "center",
            }}
          >
            <Text variant="micro" tone="faint" style={{ opacity: 0.8 }}>
              {houseNo}
            </Text>
            {planets.slice(0, 4).map((p) => (
              <Text
                key={`${p.planet}-${p.degree}`}
                variant="micro"
                weight="semibold"
                tone={p.isRetrograde ? "ruby" : "default"}
                numberOfLines={1}
                style={{ textAlign: "center" }}
              >
                {p.abbr} {p.degree}
              </Text>
            ))}
          </View>
        );
      })}
      <View style={{ position: "absolute", right: 4, bottom: 4 }}>
        <Text variant="micro" tone="gold">
          {data.lagnaLabel}
        </Text>
      </View>
    </View>
  );
}
