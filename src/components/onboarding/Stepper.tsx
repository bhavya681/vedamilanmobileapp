import React from "react";
import { View } from "react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { Text } from "@/components/ui/Text";
import { spacing } from "@/theme/tokens";

export function Stepper({
  steps,
  current,
}: {
  steps: string[];
  current: number;
}) {
  const { palette } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: "row", gap: 6 }}>
        {steps.map((step, idx) => (
          <View
            key={step}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: idx <= current ? palette.gold : palette.border,
            }}
          />
        ))}
      </View>
      <Text variant="micro" tone="muted">
        STEP {current + 1} OF {steps.length} · {steps[current]?.toUpperCase()}
      </Text>
    </View>
  );
}
