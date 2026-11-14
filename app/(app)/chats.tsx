import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";

import { chatApi } from "@/api/endpoints/chat";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { timeAgo } from "@/lib/format";
import { spacing } from "@/theme/tokens";

export default function ChatsScreen() {
  const router = useRouter();
  const query = useQuery({ queryKey: ["chats"], queryFn: () => chatApi.listChats(), refetchInterval: 30_000 });
  const chats = query.data?.chats ?? [];

  return (
    <Screen title="Chats" subtitle="Conversations with your connections" showBack>
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : chats.length === 0 ? (
        <EmptyState title="No conversations yet" body="Once you connect with someone, your chat appears here." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {chats.map((chat) => (
            <Card
              key={chat.id}
              onPress={() =>
                router.push(
                  `/(app)/chat/${chat.id}?other=${encodeURIComponent(chat.otherUserId)}&name=${encodeURIComponent(chat.name)}`,
                )
              }
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}
            >
              <Avatar uri={chat.photo} name={chat.name} size={48} ring />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="body" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {chat.name}
                  </Text>
                  <Text variant="micro" tone="faint">
                    {chat.lastMessageAt ? timeAgo(chat.lastMessageAt) : ""}
                  </Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Text variant="caption" tone="muted" numberOfLines={1} style={{ flex: 1 }}>
                    {chat.preview || "Say hello"}
                  </Text>
                  {chat.unread > 0 ? (
                    <View style={{ minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", backgroundColor: "#D4AF37" }}>
                      <Text variant="micro" style={{ color: "#14110E" }}>
                        {chat.unread}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
