import React from "react";
import { View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useCelebrities } from "@/hooks/useAstrology";
import { spacing } from "@/theme/tokens";
import type { Celebration } from "@/api/types/models";

export default function CelebritiesScreen() {
  const query = useCelebrities();
  const raw = query.data;
  const celebrities: Celebration[] = Array.isArray(raw)
    ? raw
    : (raw?.celebrities ?? []);

  return (
    <Screen title="Celebrity charts" subtitle="Study the sky behind familiar names">
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : celebrities.length === 0 ? (
        <EmptyState title="No celebrity charts available" body="This collection is being prepared." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {celebrities.map((person) => (
            <Card key={person.id} style={{ flexDirection: "row", gap: spacing.md, alignItems: "center" }}>
              <Avatar uri={person.photo} name={person.name} size={48} ring />
              <View style={{ flex: 1 }}>
                <Text variant="label">{person.name}</Text>
                <Text variant="caption" tone="muted">
                  {[person.category, person.sunSign ? `Sun ${person.sunSign}` : null, person.moonSign ? `Moon ${person.moonSign}` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
