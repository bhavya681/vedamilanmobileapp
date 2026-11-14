import React from "react";
import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "./Text";

type Props = {
  score: number;
  max?: number;
  size?: number;
  label?: string;
  thickness?: number;
};

export function ScoreRing({ score, max = 36, size = 96, label, thickness = 8 }: Props) {
  const { palette } = useTheme();
  const safeMax = max > 0 ? max : 1;
  const ratio = Math.max(0, Math.min(1, score / safeMax));
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = ratio >= 0.75 ? palette.emerald : ratio >= 0.5 ? palette.gold : palette.ruby;

  return (
    <View
      style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}
      accessibilityLabel={`${label ?? "Score"}: ${score} out of ${max}`}
    >
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={palette.border}
          strokeWidth={thickness}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text variant="titleLg" weight="bold" style={{ color }}>
        {Math.round(score * 10) / 10}
      </Text>
      <Text variant="micro" tone="faint">
        / {max}
      </Text>
      {label ? (
        <Text variant="micro" tone="muted" style={{ marginTop: 2 }}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}
