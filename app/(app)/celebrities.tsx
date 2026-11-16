import React from "react";
import { View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useCelebrities } from "@/hooks/useAstrology";
import { formatDate } from "@/lib/format";
import { spacing } from "@/theme/tokens";
import type { Celebration } from "@/api/types/models";

function personImage(person: Celebration): string | null | undefined {
  return person.imageUrl ?? person.photo ?? person.image ?? (typeof person.url === "string" ? person.url : null);
}

export default function CelebritiesScreen() {
  const query = useCelebrities();
  const raw = query.data;
  const celebrities: Celebration[] = Array.isArray(raw) ? raw : (raw?.celebrities ?? []);

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
              <Card key={person.id} style={{ flexDirection: "row", gap: spacing.md, alignItems: "flex-start" }}>
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
    </Screen>
  );
}
