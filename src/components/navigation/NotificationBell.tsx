import { useRouter } from "expo-router";
import { Bell } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

import { useNotifications } from "@/hooks/useNotifications";
import { useTheme } from "@/theme/ThemeProvider";

export function NotificationBell() {
  const router = useRouter();
  const { palette } = useTheme();
  const { data } = useNotifications();
  const unread = data?.unread ?? 0;

  return (
    <Pressable
      onPress={() => router.push("/(app)/notifications")}
      accessibilityRole="button"
      accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
      hitSlop={10}
      style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center" }}
    >
      <Bell size={21} color={palette.text} />
      {unread > 0 ? (
        <View
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            minWidth: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: palette.ruby,
            borderWidth: 1,
            borderColor: palette.canvas,
          }}
        />
      ) : null}
    </Pressable>
  );
}
