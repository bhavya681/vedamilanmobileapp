import * as Linking from "expo-linking";
import React, { useState } from "react";
import { View } from "react-native";

import { errorMessage } from "@/api/client/errors";
import { useToast } from "@/components/feedback/ToastProvider";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useContactSupport, useSystemHealth } from "@/hooks/useSupport";
import { useSession } from "@/providers/SessionProvider";
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
  const toast = useToast();
  const { user } = useSession();
  const contact = useContactSupport();
  const health = useSystemHealth();
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const name = nameDraft ?? user?.user.name ?? "";
  const email = emailDraft ?? user?.user.email ?? "";

  const submit = async () => {
    if (name.trim().length < 2) {
      toast.show("Please enter your name.", "error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      toast.show("Please enter a valid email address.", "error");
      return;
    }
    if (message.trim().length < 10) {
      toast.show("Please describe your question in at least 10 characters.", "error");
      return;
    }
    try {
      const result = await contact.mutateAsync({
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      });
      toast.show(
        result.delivered
          ? "Message sent. Our team replies within one business day."
          : "Message received. If email delivery is delayed, use the support address below.",
        "success",
      );
      setMessage("");
    } catch (error) {
      toast.show(errorMessage(error), "error");
    }
  };

  return (
    <Screen title="Help & support" subtitle="Answers and a direct line to our team" showBack>
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
          <SectionHeader title="Contact support" subtitle="Send us a message without leaving the app" />
          <Input label="Your name" value={name} onChangeText={setNameDraft} autoComplete="name" maxLength={80} />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmailDraft}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            maxLength={254}
          />
          <Input
            label="How can we help?"
            value={message}
            onChangeText={setMessage}
            placeholder="Tell us what happened, and include your registered email if relevant."
            multiline
            maxLength={4000}
            style={{ minHeight: 120, textAlignVertical: "top" }}
          />
          <Button
            label="Send message"
            variant="gold"
            loading={contact.isPending}
            onPress={() => void submit()}
          />
          <Text variant="caption" tone="faint" align="center">
            {health.isSuccess
              ? health.data.status === "ok"
                ? "Support services are operational."
                : "Some services are degraded; email may be faster."
              : "Your message is sent through VedaMilan's secure support channel."}
          </Text>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Prefer email?" subtitle="Our team replies within one business day" />
          <Button
            label="Email support"
            variant="secondary"
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
