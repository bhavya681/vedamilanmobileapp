import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { chatApi } from "@/api/endpoints/chat";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { timeAgo } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

export default function ChatsTabScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const query = useQuery({ queryKey: ["chats"], queryFn: () => chatApi.listChats(), refetchInterval: 30_000 });
  const chats = query.data?.chats ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right"]}>
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.xxl }}>
        <SectionHeader title="Messages" subtitle="Conversations with your connections" />
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
                      <View style={{ minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, alignItems: "center", justifyContent: "center", backgroundColor: palette.gold }}>
                        <Text variant="micro" style={{ color: palette.onGold }}>
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
      </View>
    </SafeAreaView>
  );
}
