import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { spacing } from "@/theme/tokens";

const MODULES = [
  { key: "shadbala", title: "Shadbala", blurb: "Six-fold planetary strength with a clear ranking." },
  { key: "jaimini", title: "Jaimini", blurb: "Chara karakas, arudha padas and Jaimini yogas." },
  { key: "bnn", title: "Bhrigu Nandi Nadi", blurb: "Nadi-style promise reading for relationships." },
  { key: "marriage-intelligence", title: "Marriage intelligence", blurb: "A structured read of marriage promise and timing." },
  { key: "spiritual-journey", title: "Spiritual journey", blurb: "Moksha house, ketu themes and inner growth." },
  { key: "past-life-deeds", title: "Past-life deeds", blurb: "Karmic patterns indicated in the birth chart." },
  { key: "marriage-precautions", title: "Marriage precautions", blurb: "What to watch and how to prepare well." },
  { key: "calendar", title: "Life calendar", blurb: "Significant dates and dasha windows ahead." },
] as const;

export default function AdvancedScreen() {
  const router = useRouter();
  return (
    <Screen title="Advanced reports" subtitle="Deeper Vedic analysis, generated on our server" showBack>
      <View style={{ gap: spacing.md }}>
        {MODULES.map((module) => (
          <Card key={module.key} onPress={() => router.push(`/(app)/advanced/${module.key}` as never)} style={{ gap: 3 }}>
            <Text variant="title">{module.title}</Text>
            <Text variant="small" tone="muted">
              {module.blurb}
            </Text>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
