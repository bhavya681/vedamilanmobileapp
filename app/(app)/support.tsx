import * as Linking from "expo-linking";
import React from "react";
import { View } from "react-native";

import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { spacing } from "@/theme/tokens";

const FAQ = [
  {
    title: "How accurate is my kundli?",
    body: "Your chart is calculated on our server from the birth date, time, coordinates, and ayanamsha you provide. Accuracy depends on the exact birth time; even a few minutes can shift the lagna and house cusps.",
  },
  {
    title: "Why does compatibility vary between profiles?",
    body: "We combine Ashtakoota, manglik balance, and dashas from both charts. Preferences such as manglik tolerance and minimum score also affect which matches are surfaced.",
  },
  {
    title: "How do consultations work?",
    body: "Choose an astrologer, pick a slot, and complete payment. You'll receive a confirmation and can reschedule within the policy shown on the booking.",
  },
  {
    title: "Can I change my birth details?",
    body: "Yes. Go to Settings → Birth details. Saving new details regenerates your chart and refreshes astrology across the app.",
  },
  {
    title: "Is my data private?",
    body: "Your exact birth details are used for calculations and are never shown publicly. You control what appears on your profile under Settings → Privacy.",
  },
];

export default function SupportScreen() {
  return (
    <Screen title="Help & support" subtitle="Answers to common questions" showBack>
      <View style={{ gap: spacing.lg }}>
        <Card>
          <SectionHeader title="Frequently asked" />
          {FAQ.map((item) => (
            <Accordion key={item.title} title={item.title}>
              <Text variant="small" tone="muted">
                {item.body}
              </Text>
            </Accordion>
          ))}
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Still need help?" subtitle="Our team replies within one business day" />
          <Button
            label="Email support"
            variant="gold"
            onPress={() => Linking.openURL("mailto:support@vedamilan.ai?subject=VedaMilan%20mobile%20app")}
          />
          <Text variant="caption" tone="faint" align="center">
            support@vedamilan.ai
          </Text>
        </Card>
      </View>
    </Screen>
  );
}
