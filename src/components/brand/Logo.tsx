import React, { useId } from "react";
import { View } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Stop } from "react-native-svg";

import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

const RAY_COUNT = 24;

export function LogoMark({ size = 72 }: { size?: number }) {
  const { palette } = useTheme();
  const gradientId = `vm-gold-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const glowId = `vm-glow-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" accessibilityLabel="VedaMilan emblem">
      <Defs>
        <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={palette.goldSoft} />
          <Stop offset="0.55" stopColor={palette.gold} />
          <Stop offset="1" stopColor={palette.saffron} />
        </LinearGradient>
        <LinearGradient id={glowId} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={palette.goldSoft} stopOpacity={0.22} />
          <Stop offset="1" stopColor={palette.goldSoft} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <Circle cx={60} cy={60} r={58} fill={`url(#${glowId})`} />
      <Circle cx={60} cy={60} r={55} stroke={palette.goldSoft} strokeWidth={0.7} fill="none" opacity={0.38} />
      <Circle cx={60} cy={60} r={47} stroke={`url(#${gradientId})`} strokeWidth={1.5} fill="none" />

      <G opacity={0.72}>
        {Array.from({ length: RAY_COUNT }, (_, index) => {
          const angle = (index * 360) / RAY_COUNT;
          const rad = (angle * Math.PI) / 180;
          const inner = index % 2 === 0 ? 39 : 41;
          return (
            <Line
              key={angle}
              x1={60 + Math.cos(rad) * inner}
              y1={60 + Math.sin(rad) * inner}
              x2={60 + Math.cos(rad) * 44.5}
              y2={60 + Math.sin(rad) * 44.5}
              stroke={palette.goldSoft}
              strokeWidth={index % 2 === 0 ? 1.2 : 0.7}
              strokeLinecap="round"
            />
          );
        })}
      </G>

      <Circle cx={60} cy={60} r={34} stroke={palette.goldSoft} strokeWidth={0.8} fill="none" opacity={0.45} />

      <Path
        d="M60 48 C69 58 75 68 75 78 C75 89 68.5 96 60 100 C51.5 96 45 89 45 78 C45 68 51 58 60 48 Z"
        fill={`url(#${gradientId})`}
        opacity={0.16}
      />
      <Path
        d="M60 48 C69 58 75 68 75 78 C75 89 68.5 96 60 100 C51.5 96 45 89 45 78 C45 68 51 58 60 48 Z"
        stroke={`url(#${gradientId})`}
        strokeWidth={1.4}
        fill="none"
      />
      <Path
        d="M45 72 C37 67 31.5 59 30.5 50 C39 53.5 46.5 60.5 51 68.5"
        stroke={palette.goldSoft}
        strokeWidth={1.1}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M75 72 C83 67 88.5 59 89.5 50 C81 53.5 73.5 60.5 69 68.5"
        stroke={palette.goldSoft}
        strokeWidth={1.1}
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M60 100 C55 92 48 88 40 87 C45 94 52 99 60 103 C68 99 75 94 80 87 C72 88 65 92 60 100 Z"
        fill={`url(#${gradientId})`}
        opacity={0.28}
      />

      <Path
        d="M52 30 C60 22 73 26 76 38 C68 34 61 34 55 38 C53 35 52 32 52 30 Z"
        fill={`url(#${gradientId})`}
        opacity={0.9}
      />
      <Circle cx={83} cy={35} r={2.1} fill={palette.goldSoft} />
      <Circle cx={34} cy={41} r={1.3} fill={palette.goldSoft} opacity={0.7} />
      <Circle cx={60} cy={76} r={3.2} fill={`url(#${gradientId})`} />
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
  const { palette } = useTheme();
  const variant = size === "lg" ? "hero" : size === "md" ? "display" : "heading";
  const letterSpacing = size === "sm" ? 0.8 : 1.4;

  return (
    <View style={{ alignItems: align === "center" ? "center" : "flex-start" }}>
      <View style={{ flexDirection: "row", alignItems: "baseline" }}>
        <Text variant={variant} style={{ color: palette.text, letterSpacing }}>
          Veda
        </Text>
        <Text variant={variant} tone="gold" style={{ letterSpacing }}>
          Milan
        </Text>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          marginTop: spacing.xs,
        }}
      >
        <View style={{ height: 1, width: 18, backgroundColor: `${palette.goldSoft}66` }} />
        <Text variant="micro" tone="muted" style={{ letterSpacing: 3 }}>
          AI · VEDIC MATRIMONY
        </Text>
        <View style={{ height: 1, width: 18, backgroundColor: `${palette.goldSoft}66` }} />
      </View>
    </View>
  );
}

export function LogoLockup({ size = 76, align = "center" }: { size?: number; align?: "center" | "left" }) {
  return (
    <View
      style={{
        alignItems: align === "center" ? "center" : "flex-start",
        gap: spacing.md,
      }}
    >
      <LogoMark size={size} />
      <Wordmark size={size >= 80 ? "lg" : "md"} align={align} />
    </View>
  );
}
