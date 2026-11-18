import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import React from "react";

import { wisdomApi, type WisdomGuideDetail } from "@/api/endpoints/wisdom";
import { queryKeys } from "@/api/queryKeys";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SageChat } from "@/components/wisdom/SageChat";

export default function RishiSageChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useQuery({
    queryKey: queryKeys.wisdom.library(id),
    queryFn: () => wisdomApi.getLibrary({ guideId: id }),
    enabled: Boolean(id),
  });
  const detail = query.data && "guide" in query.data ? (query.data as WisdomGuideDetail) : undefined;
  const guide = detail?.guide;

  if (query.isLoading) {
    return (
      <Screen title="Sage chat" showBack>
        <LoadingState variant="detail" />
      </Screen>
    );
  }

  if (query.isError || !guide) {
    return (
      <Screen title="Sage chat" showBack>
        <ErrorState
          error={query.error ?? new Error("This sage could not be found.")}
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const topics = guide.topics?.length
    ? guide.topics
    : guide.knownFor?.length
      ? guide.knownFor
      : ["dharma", "decision-making", "inner calm"];

  return (
    <Screen
      title={guide.displayName}
      subtitle={guide.sanskritName ?? guide.role ?? "Vedic guide"}
      eyebrow="WISDOM DIALOGUE"
      showBack
      scroll={false}
      padded={false}
      edges={["top", "left", "right", "bottom"]}
    >
      <SageChat
        identity={{
          title: guide.displayName,
          tagline: guide.domain ?? guide.role ?? "Vedic wisdom",
          assistantLabel: guide.displayName.toUpperCase(),
          welcomeBody: `Ask about ${topics.slice(0, 3).join(", ").toLowerCase()}. Replies stay within this sage’s documented teachings and sources.`,
          suggestions: topics.slice(0, 4).map((topic) => `What does ${guide.displayName} teach about ${topic.toLowerCase()}?`),
          disclaimer: detail?.disclaimer,
        }}
        guideId={guide.id}
        guideName={guide.displayName}
        category={guide.categoryIds?.[0] ?? "vedic-sages"}
        guideIds={[guide.id]}
      />
    </Screen>
  );
}
