import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { ScrollView } from "react-native";

import { aiApi } from "@/api/endpoints/ai";
import { queryKeys } from "@/api/queryKeys";
import { AgentChat } from "@/components/ai/AgentChat";
import { InlineNotice } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { BottomSheet } from "@/components/ui/Sheet";
import { ReportView } from "@/components/ReportView";
import { DISCLAIMER } from "@/lib/constants";

const DEFAULT_SUGGESTIONS = [
  "When is the strongest window for marriage in my chart?",
  "What qualities should I look for in a partner?",
  "What do the seventh house and its lord indicate for me?",
  "How do my current dasha and transits affect marriage timing?",
];

export default function MarriageGuruScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const bundle = useQuery({ queryKey: queryKeys.ai.marriageGuru, queryFn: () => aiApi.marriageGuru() });
  const suggestions = bundle.data?.suggestedPrompts?.length
    ? bundle.data.suggestedPrompts.slice(0, 5)
    : DEFAULT_SUGGESTIONS;

  return (
    <Screen
      title="Marriage Guru"
      subtitle="Readiness, partner fit, and timing"
      eyebrow="VIVAHA VICHAR"
      showBack
      scroll={false}
      padded={false}
      edges={["top", "left", "right", "bottom"]}
    >
      <AgentChat
        agent="MARRIAGE_GURU"
        identity={{
          title: "Marriage Guru",
          tagline: "Vedic relationship & timing guide",
          assistantLabel: "MARRIAGE GURU",
          welcomeTitle: "Ask the Marriage Guru",
          welcomeBody:
            "Discuss readiness, partner tendencies, seventh-house indications, and marriage windows using your saved chart context.",
          suggestions,
          reportLabel: "Report",
          onOpenReport: () => setSheetOpen(true),
        }}
      />

      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} title="Marriage Guru report">
        <ScrollView style={{ maxHeight: 480 }} showsVerticalScrollIndicator={false}>
          <ReportView data={bundle.data ?? {}} />
          <InlineNotice body={DISCLAIMER} />
        </ScrollView>
      </BottomSheet>
    </Screen>
  );
}
