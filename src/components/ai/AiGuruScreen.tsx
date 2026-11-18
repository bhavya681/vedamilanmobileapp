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
          tagline: "Chart-aware Vedic guidance",
          monogram: "AG",
          assistantLabel: "AI GURU",
          welcomeTitle: "Ask your AI Guru",
          welcomeBody:
            "Clear, chart-grounded answers about your dasha, yogas, transits, and life themes.",
          suggestions: ["Summarize my birth chart", "What does my dasha indicate?"],
          reportLabel: "Report",
          onOpenReport: () => router.push("/(app)/insights" as never),
        }}
      />
    </Screen>
  );
}
