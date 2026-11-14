import { Platform } from "react-native";

export type NotificationTarget = {
  path: string;
  params?: Record<string, string>;
};

type NotificationData = Record<string, unknown>;

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export function targetFromNotificationData(data: NotificationData | undefined): NotificationTarget {
  if (!data) return { path: "/(app)/notifications" };

  const url = str(data.url) ?? str(data.link) ?? str(data.deepLink);
  if (url?.startsWith("/")) {
    const [path, query] = url.split("?");
    return {
      path: path ?? "/(app)/notifications",
      params: query ? Object.fromEntries(new URLSearchParams(query)) : undefined,
    };
  }

  const type = (str(data.type) ?? "").toUpperCase();
  if (type.includes("MESSAGE") || type === "CHAT") {
    const chatId = str(data.chatId);
    if (chatId) return { path: "/(app)/chat/[id]", params: { id: chatId } };
    return { path: "/(app)/chats" };
  }
  if (type.includes("VISITOR") || type === "PROFILE_VIEW") return { path: "/(app)/visitors" };
  if (type.includes("LIKE") || type.includes("INTEREST")) return { path: "/(app)/likes" };
  if (type.includes("MATCH")) return { path: "/(app)/discover" };
  if (type.includes("BILLING") || type.includes("PREMIUM") || type.includes("PAYMENT")) {
    return { path: "/(app)/billing" };
  }
  if (type.includes("KUNDLI") || type.includes("HOROSCOPE")) return { path: "/(app)/kundli" };
  if (type.includes("WISDOM")) return { path: "/(app)/wisdom" };

  const screen = str(data.screen);
  if (screen) return { path: `/(app)/${screen.replace(/^\/+/, "")}` };

  return { path: "/(app)/notifications" };
}

export async function configureNotifications(): Promise<typeof import("expo-notifications") | null> {
  if (Platform.OS === "web") return null;
  try {
    const Notifications = await import("expo-notifications");
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: false,
        shouldSetBadge: true,
      }),
    });
    return Notifications;
  } catch {
    return null;
  }
}
