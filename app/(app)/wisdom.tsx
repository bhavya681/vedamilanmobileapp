import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";

import { wisdomApi } from "@/api/endpoints/wisdom";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import type { WisdomBundle } from "@/api/types/models";
import { spacing } from "@/theme/tokens";

export default function WisdomScreen() {
  const router = useRouter();
  const query = useQuery({ queryKey: ["wisdom"], queryFn: () => wisdomApi.getLibrary() });
  const bundle = (query.data ?? {}) as WisdomBundle;

  return (
    <Screen title="Wisdom" subtitle="Timeless guidance for modern relationships" showBack>
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          {bundle.daily?.title || bundle.daily?.body ? (
            <Card style={{ gap: spacing.sm }}>
              <Text variant="micro" tone="gold">
                TODAY'S WISDOM
              </Text>
              {bundle.daily.title ? <Text variant="title">{bundle.daily.title}</Text> : null}
              {bundle.daily.body ? (
                <Text variant="body" tone="muted">
                  {bundle.daily.body}
                </Text>
              ) : null}
            </Card>
          ) : null}

          <Card style={{ gap: spacing.sm }}>
            <SectionHeader title="Guides" subtitle="Choose a voice to explore" />
            {(bundle.guides ?? []).map((guide) => (
              <Card
                key={guide.id}
                onPress={() => router.push(`/(app)/wisdom/${guide.id}`)}
                style={{ backgroundColor: "transparent", borderWidth: 0, paddingHorizontal: 0, paddingVertical: spacing.sm }}
              >
                <Text variant="body">{guide.name}</Text>
                <Text variant="caption" tone="faint">
                  {[guide.category, guide.summary].filter(Boolean).join(" · ")}
                </Text>
              </Card>
            ))}
            {!(bundle.guides ?? []).length ? (
              <Text variant="caption" tone="faint">
                No guides available right now.
              </Text>
            ) : null}
          </Card>

          {(bundle.categories ?? []).length ? (
            <Card style={{ gap: spacing.sm }}>
              <SectionHeader title="Explore by theme" />
              {(bundle.categories ?? []).map((category) => (
                <Text key={category.id} variant="small" tone="muted">
                  {category.name}
                </Text>
              ))}
            </Card>
          ) : null}

          {bundle.disclaimer ? (
            <Text variant="caption" tone="faint">
              {bundle.disclaimer}
            </Text>
          ) : null}
        </View>
      )}
    </Screen>
  );
}
