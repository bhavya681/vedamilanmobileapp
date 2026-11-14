import { useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";

import { wisdomApi } from "@/api/endpoints/wisdom";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { formatDate } from "@/lib/format";
import { spacing } from "@/theme/tokens";

export default function JournalScreen() {
  const query = useQuery({ queryKey: ["journal"], queryFn: () => wisdomApi.journal.list() });
  const entries = query.data?.entries ?? [];

  return (
    <Screen title="Journal" subtitle="Reflections you saved" showBack>
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : entries.length === 0 ? (
        <EmptyState title="Your journal is empty" body="Save insights from Wisdom guides and AI conversations to see them here." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {entries.map((entry, index) => (
            <Card key={entry.id ?? entry._id ?? index} style={{ gap: spacing.sm }}>
              <Text variant="micro" tone="gold">
                {[entry.guideName, entry.category].filter(Boolean).join(" · ").toUpperCase() || "REFLECTION"}
              </Text>
              {entry.question ? <Text variant="label">{entry.question}</Text> : null}
              <Text variant="body" tone="muted">
                {entry.insight}
              </Text>
              {entry.reflection ? (
                <Text variant="small" tone="faint">
                  {entry.reflection}
                </Text>
              ) : null}
              <Text variant="micro" tone="faint" align="right">
                {formatDate(entry.createdAt)}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
