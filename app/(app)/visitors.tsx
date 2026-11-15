import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";

import { matchmakingApi } from "@/api/endpoints/matchmaking";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { formatDateTime } from "@/lib/format";
import { spacing } from "@/theme/tokens";

export default function VisitorsScreen() {
  const router = useRouter();
  const query = useQuery({ queryKey: ["visitors"], queryFn: () => matchmakingApi.listVisitors() });
  const items = query.data?.visitors ?? [];

  return (
    <Screen title="Visitors" subtitle="Members who viewed your profile" showBack>
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="No visitors yet" body="Keep your profile fresh to get noticed." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {items.map((item, index) => {
            const userId = item.visitorUserId ?? item.userId;
            const visitedAt = item.lastVisitedAt ?? item.visitedAt;
            return (
              <Card
                key={userId ?? index}
                onPress={userId ? () => router.push(`/(app)/match/${userId}`) : undefined}
                style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}
              >
                <Avatar uri={typeof item.photo === "string" ? item.photo : null} name={typeof item.name === "string" ? item.name : "Member"} size={44} ring />
                <View style={{ flex: 1 }}>
                  <Text variant="body">{typeof item.name === "string" ? item.name : "Member"}</Text>
                  <Text variant="caption" tone="faint">
                    {visitedAt ? formatDateTime(String(visitedAt)) : ""}
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
