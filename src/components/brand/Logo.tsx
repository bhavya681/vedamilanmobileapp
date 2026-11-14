import React from "react";
import { View } from "react-native";
import Svg, { Circle, G, Line, Path } from "react-native-svg";

import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "@/components/ui/Text";

export function LogoMark({ size = 72 }: { size?: number }) {
  const { palette } = useTheme();
  const rays = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityLabel="VedaMilan emblem">
      <Circle cx={50} cy={50} r={46} stroke={palette.goldSoft} strokeWidth={1} fill="none" opacity={0.55} />
      <Circle cx={50} cy={50} r={38} stroke={palette.gold} strokeWidth={1.4} fill="none" />
      <G opacity={0.8}>
        {rays.map((angle) => (
          <Line
            key={angle}
            x1={50 + Math.cos((angle * Math.PI) / 180) * 30}
            y1={50 + Math.sin((angle * Math.PI) / 180) * 30}
            x2={50 + Math.cos((angle * Math.PI) / 180) * 35}
            y2={50 + Math.sin((angle * Math.PI) / 180) * 35}
            stroke={palette.goldSoft}
            strokeWidth={1.6}
            strokeLinecap="round"
          />
        ))}
      </G>
      <Circle cx={50} cy={50} r={26} stroke={palette.saffron} strokeWidth={0.8} fill="none" opacity={0.7} />
      <Path
        d="M50 30 C58 40 62 46 62 53 C62 62 56 68 50 70 C44 68 38 62 38 53 C38 46 42 40 50 30 Z"
        fill={`${palette.goldSoft}22`}
        stroke={palette.goldSoft}
        strokeWidth={1.2}
      />
      <Circle cx={50} cy={50} r={4.5} fill={palette.goldSoft} />
    </Svg>
  );
}

export function Wordmark({
  size = "md",
  align = "center",
}: {
  size?: "sm" | "md" | "lg";
  align?: "center" | "left";
}) {
  const titleSize = size === "lg" ? "hero" : size === "md" ? "display" : "heading";
  return (
    <View style={{ alignItems: align === "center" ? "center" : "flex-start" }}>
      <Text variant={titleSize} tone="gold" style={{ letterSpacing: size === "sm" ? 1 : 2 }}>
        VedaMilan
      </Text>
      <Text variant="micro" tone="muted" style={{ letterSpacing: 3.5, marginTop: 2 }}>
        AI · VEDIC MATRIMONY
      </Text>
    </View>
  );
}
