import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";

import { matchmakingApi, type LikeItem } from "@/api/endpoints/matchmaking";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { formatDate, titleCase } from "@/lib/format";
import { spacing } from "@/theme/tokens";

type Side = "received" | "sent";

function likeUserId(item: LikeItem, side: Side) {
  return side === "received"
    ? item.fromUserId ?? item.toUserId ?? item.id
    : item.toUserId ?? item.fromUserId ?? item.id;
}

function likeKey(item: LikeItem, index: number) {
  return String(item._id ?? item.id ?? likeUserId(item, "received") ?? index);
}

export default function LikesScreen() {
  const router = useRouter();
  const query = useQuery({ queryKey: ["likes"], queryFn: () => matchmakingApi.listLikes() });
  const data = query.data;
  const received = Array.isArray(data) ? data : data?.received ?? data?.items ?? [];
  const sent = Array.isArray(data) ? [] : data?.sent ?? [];

  const section = (title: string, items: LikeItem[], side: Side) => (
    <View style={{ gap: spacing.md }}>
      <SectionHeader title={title} subtitle={`${items.length}`} />
      {items.length === 0 ? (
        <Text variant="caption" tone="faint">
          Nothing here yet.
        </Text>
      ) : (
        items.map((item, index) => {
          const userId = likeUserId(item, side);
          const meta = [
            item.type ? titleCase(String(item.type).replace(/_/g, " ")) : null,
            item.city,
            item.createdAt ? formatDate(String(item.createdAt)) : null,
          ]
            .filter(Boolean)
            .join(" · ");
          return (
            <Card
              key={likeKey(item, index)}
              onPress={userId ? () => router.push(`/(app)/match/${userId}`) : undefined}
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}
            >
              <Avatar
                uri={typeof item.photo === "string" ? item.photo : null}
                name={typeof item.name === "string" ? item.name : "Member"}
                size={44}
                ring
              />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="body">{typeof item.name === "string" ? item.name : "Member"}</Text>
                <Text variant="caption" tone="faint">
                  {meta || "Like"}
                </Text>
                {item.mutual ? (
                  <Text variant="micro" tone="gold">
                    Mutual interest
                  </Text>
                ) : null}
              </View>
            </Card>
          );
        })
      )}
    </View>
  );

  return (
    <Screen title="Likes" subtitle="Interests you've sent and received" showBack>
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : received.length === 0 && sent.length === 0 ? (
        <EmptyState title="No likes yet" body="Complete your profile and photos to attract more interests." />
      ) : (
        <View style={{ gap: spacing.lg }}>
          {section("Liked you", received, "received")}
          {section("You liked", sent, "sent")}
        </View>
      )}
    </Screen>
  );
}
