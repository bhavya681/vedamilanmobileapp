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
import { spacing } from "@/theme/tokens";

export default function ShortlistScreen() {
  const router = useRouter();
  const query = useQuery({ queryKey: ["shortlist"], queryFn: () => matchmakingApi.listShortlist() });
  const items = query.data?.shortlist ?? [];

  return (
    <Screen title="Shortlist" subtitle="Profiles you saved for later" showBack>
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="Your shortlist is empty" body="Save interesting profiles from Discover to compare them here." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {items.map((item, index) => (
            <Card
              key={item.id ?? item.targetUserId ?? index}
              onPress={item.targetUserId ? () => router.push(`/(app)/match/${item.targetUserId}`) : undefined}
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}
            >
              <Avatar uri={typeof item.photo === "string" ? item.photo : null} name={typeof item.name === "string" ? item.name : "Member"} size={44} ring />
              <View style={{ flex: 1 }}>
                <Text variant="body">{typeof item.name === "string" ? item.name : "Member"}</Text>
                {item.note ? (
                  <Text variant="caption" tone="faint">
                    {item.note}
                  </Text>
                ) : null}
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
