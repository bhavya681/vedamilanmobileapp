import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import { astrologyApi } from "@/api/endpoints/astrology";
import type { Celebration } from "@/api/types/models";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { BottomSheet } from "@/components/ui/Sheet";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { ReportView } from "@/components/ReportView";
import { useCelebrities } from "@/hooks/useAstrology";
import { formatDate } from "@/lib/format";
import { spacing } from "@/theme/tokens";

function personImage(person: Celebration): string | null | undefined {
  return person.imageUrl ?? person.photo ?? person.image ?? (typeof person.url === "string" ? person.url : null);
}

export default function CelebritiesScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const query = useCelebrities();
  const detail = useQuery({
    queryKey: ["astrology", "celebrity", selectedId],
    queryFn: () => astrologyApi.getCelebrities(selectedId ?? undefined),
    enabled: Boolean(selectedId),
    staleTime: 30 * 60_000,
  });
  const raw = query.data;
  const celebrities: Celebration[] = Array.isArray(raw) ? raw : (raw?.celebrities ?? []);
  const selected = celebrities.find((person) => person.id === selectedId);
  const payload = !Array.isArray(detail.data) ? detail.data?.selected : undefined;

  return (
    <Screen title="Celebrity charts" subtitle="Study the sky behind familiar names" showBack>
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : celebrities.length === 0 ? (
        <EmptyState title="No celebrity charts available" body="This collection is being prepared." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {celebrities.map((person) => {
            const image = personImage(person);
            const meta = [person.field, person.category, person.place].filter(Boolean).join(" · ");
            const signs = [
              person.sunSign ? `Sun ${person.sunSign}` : null,
              person.moonSign ? `Moon ${person.moonSign}` : null,
            ]
              .filter(Boolean)
              .join(" · ");
            const date = person.birthDate ? formatDate(person.birthDate, "d MMM yyyy") : null;
            return (
              <Card
                key={person.id}
                onPress={() => setSelectedId(person.id)}
                accessibilityLabel={`Open chart for ${person.name}`}
                style={{ flexDirection: "row", gap: spacing.md, alignItems: "flex-start" }}
              >
                <Avatar uri={image ?? undefined} name={person.name} size={56} ring />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="label" numberOfLines={1}>
                    {person.name}
                  </Text>
                  {meta ? (
                    <Text variant="caption" tone="muted" numberOfLines={2}>
                      {meta}
                    </Text>
                  ) : null}
                  {date ? (
                    <Text variant="caption" tone="faint">
                      {date}
                      {person.place ? ` · ${person.place}` : ""}
                    </Text>
                  ) : null}
                  {signs ? (
                    <Text variant="caption" tone="gold">
                      {signs}
                    </Text>
                  ) : null}
                  {person.timeAccuracy ? (
                    <View style={{ flexDirection: "row", marginTop: 2 }}>
                      <Badge
                        label={person.timeAccuracy === "unknown" ? "Time unknown" : `Time ${person.timeAccuracy}`}
                        tone={person.timeAccuracy === "unknown" ? "ruby" : "neutral"}
                        size="sm"
                      />
                    </View>
                  ) : null}
                  {person.note ? (
                    <Text variant="micro" tone="faint" numberOfLines={3}>
                      {person.note}
                    </Text>
                  ) : null}
                </View>
              </Card>
            );
          })}
        </View>
      )}

      <BottomSheet visible={Boolean(selectedId)} onClose={() => setSelectedId(null)} title={selected?.name ?? "Celebrity chart"}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.md }}>
          {detail.isLoading ? (
            <LoadingState variant="detail" />
          ) : detail.isError ? (
            <ErrorState error={detail.error} onRetry={() => detail.refetch()} />
          ) : payload ? (
            <View style={{ gap: spacing.md }}>
              <Text variant="caption" tone="muted">
                {[selected?.sunSign ? `Sun ${selected.sunSign}` : null, selected?.moonSign ? `Moon ${selected.moonSign}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </Text>
              <ReportView data={payload} />
            </View>
          ) : (
            <EmptyState title="Chart unavailable" body="This chart could not be loaded. Please try again." />
          )}
        </ScrollView>
      </BottomSheet>
    </Screen>
  );
}
