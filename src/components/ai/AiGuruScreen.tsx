import { useRouter } from "expo-router";
import React from "react";

import { AgentChat } from "@/components/ai/AgentChat";
import { Screen } from "@/components/ui/Screen";

export default function AiGuruScreen() {
  const router = useRouter();

  return (
    <Screen
      title="AI Guru"
      subtitle="Vedic guidance grounded in your chart"
      eyebrow="VEDIC INTELLIGENCE"
      showBack
      scroll={false}
      padded={false}
      edges={["top", "left", "right", "bottom"]}
    >
      <AgentChat
        agent="ASTROLOGER_GURU"
        identity={{
          title: "AI Guru",
          tagline: "Your chart-aware Vedic guide",
          assistantLabel: "AI GURU",
          welcomeTitle: "Ask your AI Guru",
          welcomeBody:
            "Get grounded guidance from your saved birth chart, dasha, and transits. No fabricated planetary positions, no false predictions.",
          suggestions: [
            "Summarize my birth chart in simple language",
            "What are the strongest yogas in my chart?",
            "What does my current dasha mean for career?",
            "How do my current transits affect relationships?",
          ],
          reportLabel: "Chart report",
          onOpenReport: () => router.push("/(app)/insights" as never),
        }}
      />
    </Screen>
  );
}
