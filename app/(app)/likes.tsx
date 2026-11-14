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
import { formatDate } from "@/lib/format";
import { spacing } from "@/theme/tokens";

export default function LikesScreen() {
  const router = useRouter();
  const query = useQuery({ queryKey: ["likes"], queryFn: () => matchmakingApi.listLikes() });
  const items = Array.isArray(query.data)
    ? query.data
    : (query.data?.items ?? query.data?.data ?? query.data?.results ?? []);

  return (
    <Screen title="Likes" subtitle="Members who liked you" showBack>
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : items.length === 0 ? (
        <EmptyState title="No likes yet" body="Complete your profile and photos to attract more interests." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {items.map((item, index) => {
            const userId = (item.toUserId ?? item.id) as string | undefined;
            return (
              <Card
                key={`${item.id ?? userId ?? index}`}
                onPress={userId ? () => router.push(`/(app)/match/${userId}`) : undefined}
                style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}
              >
                <Avatar uri={typeof item.photo === "string" ? item.photo : null} name={typeof item.name === "string" ? item.name : "Member"} size={44} ring />
                <View style={{ flex: 1 }}>
                  <Text variant="body">{typeof item.name === "string" ? item.name : "Member"}</Text>
                  <Text variant="caption" tone="faint">
                    {[typeof item.type === "string" ? item.type.replace("_", " ") : null, item.createdAt ? formatDate(String(item.createdAt)) : null]
                      .filter(Boolean)
                      .join(" · ")}
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
