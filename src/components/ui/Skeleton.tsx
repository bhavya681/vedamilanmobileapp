import React, { useEffect, useRef } from "react";
import { AccessibilityInfo, Animated, Easing, StyleSheet, View, type ViewStyle } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

export function Skeleton({ style }: { style?: ViewStyle | ViewStyle[] }) {
  const { palette } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    let mounted = true;
    let loop: Animated.CompositeAnimation | null = null;
    void AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (!mounted || reduce) return;
        loop = Animated.loop(
          Animated.sequence([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 700,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0.45,
              duration: 700,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        );
        loop.start();
      });
    return () => {
      mounted = false;
      loop?.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { backgroundColor: palette.skeleton, borderRadius: radii.sm, opacity },
        style,
      ]}
    />
  );
}

export function SkeletonBlock({ lines = 3 }: { lines?: number }) {
  return (
    <View style={{ gap: spacing.sm }}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          style={{ height: 14, width: i === lines - 1 ? "62%" : "100%" } as ViewStyle}
        />
      ))}
    </View>
  );
}

export function SkeletonCard({ height = 96 }: { height?: number }) {
  return (
    <View style={styles.cardWrap}>
      <Skeleton style={{ height, borderRadius: radii.xl } as ViewStyle} />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { marginBottom: spacing.md },
});
