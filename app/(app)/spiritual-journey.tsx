import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Compass, Sparkles } from "lucide-react-native";
import React, { useState } from "react";
import { View } from "react-native";

import { astrologyApi } from "@/api/endpoints/astrology";
import { queryKeys } from "@/api/queryKeys";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { ErrorState, InlineNotice, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { ReportView } from "@/components/ReportView";
import { DISCLAIMER } from "@/lib/constants";
import { spacing } from "@/theme/tokens";

type Section = "journey" | "deeds";

export default function SpiritualJourneyScreen() {
  const router = useRouter();
  const [section, setSection] = useState<Section>("journey");
  const journey = useQuery({
    queryKey: queryKeys.astrology.module("spiritual-journey"),
    queryFn: () => astrologyApi.getSpiritualJourney(),
  });
  const deeds = useQuery({
    queryKey: queryKeys.astrology.module("past-life-deeds"),
    queryFn: () => astrologyApi.getPastLifeDeeds(),
  });
  const active = section === "journey" ? journey : deeds;

  return (
    <Screen
      title="Spiritual Journey"
      subtitle="Your Vedic path & karmic themes"
      eyebrow="SOUL-LEVEL REFLECTION"
      showBack
      refreshing={active.isFetching}
      onRefresh={() => active.refetch()}
    >
      <View style={{ gap: spacing.lg }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip
            label="Spiritual Journey"
            selected={section === "journey"}
            onPress={() => setSection("journey")}
          />
          <Chip label="Past Life Deeds" selected={section === "deeds"} onPress={() => setSection("deeds")} />
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: spacing.sm,
            padding: spacing.md,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: "rgba(212,175,55,0.28)",
            backgroundColor: "rgba(212,175,55,0.07)",
          }}
        >
          {section === "journey" ? <Compass size={17} color="#D4AF37" /> : <Sparkles size={17} color="#D4AF37" />}
          <Button
            label="Discuss this with the sages"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: "/(app)/ask-the-sages",
                params: { need: section === "journey" ? "spiritual path" : "karmic themes" },
              } as never)
            }
            style={{ flex: 1 }}
          />
        </View>

        {active.isLoading ? (
          <LoadingState variant="detail" />
        ) : active.isError ? (
          <ErrorState error={active.error} onRetry={() => active.refetch()} />
        ) : (
          <ReportView data={active.data ?? {}} />
        )}

        <InlineNotice body={DISCLAIMER} />
      </View>
    </Screen>
  );
}
