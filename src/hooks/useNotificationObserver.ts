import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";
import type * as ExpoNotifications from "expo-notifications";

import { configureNotifications, targetFromNotificationData } from "@/lib/notifications";

export function useNotificationObserver(enabled: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled || Platform.OS === "web") return;
    let subscription: ExpoNotifications.EventSubscription | null = null;
    let cancelled = false;

    const route = (data: Record<string, unknown> | undefined) => {
      const target = targetFromNotificationData(data);
      try {
        if (target.params) router.push({ pathname: target.path as never, params: target.params });
        else router.push(target.path as never);
      } catch {
        router.push("/(app)/notifications" as never);
      }
    };

    void (async () => {
      const Notifications = await configureNotifications();
      if (!Notifications || cancelled) return;
      try {
        const last = await Notifications.getLastNotificationResponseAsync();
        const data = last?.notification.request.content.data as Record<string, unknown> | undefined;
        if (data) route(data);
      } catch {
        // ignore
      }
      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        route(response.notification.request.content.data as Record<string, unknown> | undefined);
      });
    })();

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [enabled, router]);
}
