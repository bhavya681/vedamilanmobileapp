import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { View } from "react-native";

import { wisdomApi } from "@/api/endpoints/wisdom";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import type { WisdomBundle } from "@/api/types/models";
import { spacing } from "@/theme/tokens";

export default function WisdomScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<string | null>(null);
  const query = useQuery({ queryKey: ["wisdom"], queryFn: () => wisdomApi.getLibrary() });
  const bundle = (query.data ?? {}) as WisdomBundle;
  const categories = bundle.categories ?? [];
  const guides = (bundle.guides ?? []).filter((guide) => {
    if (!category) return true;
    const selected = categories.find((item) => item.id === category);
    return guide.category === category || (selected ? guide.category === selected.name : false);
  });

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
            {categories.length ? (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                <Chip label="All" selected={!category} onPress={() => setCategory(null)} />
                {categories.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.name}
                    selected={category === item.id}
                    onPress={() => setCategory(item.id)}
                  />
                ))}
              </View>
            ) : null}
            {guides.map((guide) => (
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
            {!guides.length ? (
              <Text variant="caption" tone="faint">
                {category ? "No guides in this theme yet." : "No guides available right now."}
              </Text>
            ) : null}
          </Card>

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
