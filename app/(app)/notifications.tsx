import { useRouter, type Href } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

import { errorMessage } from "@/api/client/errors";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/feedback/ToastProvider";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useMarkNotificationsRead, useNotifications } from "@/hooks/useNotifications";
import { targetFromNotificationData } from "@/lib/notificationTargets";
import { timeAgo, titleCase } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

export default function NotificationsScreen() {
  const { palette } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const list = useNotifications();
  const markRead = useMarkNotificationsRead();

  const notifications = list.data?.notifications ?? [];
  const unread = list.data?.unread ?? 0;

  const open = (item: (typeof notifications)[number], id: string, read: boolean) => {
    if (!read) {
      markRead.mutate(
        { notificationId: id },
        { onError: (error) => toast.show(errorMessage(error), "error") },
      );
    }
    const target = targetFromNotificationData(item.data ?? undefined);
    router.push({ pathname: target.path, params: target.params } as Href);
  };

  return (
    <Screen
      title="Notifications"
      showBack
      scroll
      refreshing={list.isRefetching}
      onRefresh={() => list.refetch()}
      right={
        unread > 0 ? (
          <Pressable
            onPress={() =>
              markRead.mutate(
                { markAll: true },
                { onError: (error) => toast.show(errorMessage(error), "error") },
              )
            }
            accessibilityRole="button"
            accessibilityLabel="Mark all notifications as read"
            hitSlop={8}
          >
            <Text variant="caption" tone="gold">
              Mark all read
            </Text>
          </Pressable>
        ) : null
      }
    >
      {list.isLoading ? (
        <LoadingState variant="list" />
      ) : list.isError ? (
        <ErrorState error={list.error} onRetry={() => list.refetch()} />
      ) : notifications.length === 0 ? (
        <EmptyState title="Nothing new yet" body="Interests, matches, messages and guidance will appear here." />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {notifications.map((item, index) => {
            const id = item.id ?? item._id ?? String(index);
            const read = item.read ?? item.isRead ?? Boolean(item.readAt);
            return (
              <Card
                key={id}
                onPress={() => open(item, id, read)}
                accessibilityLabel={`Open notification: ${item.title ?? titleCase(item.type ?? "Update")}`}
                style={{
                  gap: 3,
                  borderColor: read ? palette.border : `${palette.goldSoft}66`,
                  backgroundColor: read ? palette.raised : `${palette.goldSoft}0D`,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
                  <Text variant="label" style={{ flex: 1 }}>
                    {item.title ?? titleCase(item.type ?? "Update")}
                  </Text>
                  <Text variant="micro" tone="faint">
                    {timeAgo(item.createdAt)}
                  </Text>
                </View>
                <Text variant="small" tone="muted">
                  {item.body ?? item.message ?? ""}
                </Text>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
