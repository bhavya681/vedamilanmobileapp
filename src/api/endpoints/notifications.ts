import { request } from "@/api/client/http";
import type { NotificationItem } from "@/api/types/models";

export const notificationsApi = {
  list: () => request<{ notifications: NotificationItem[]; unread: number }>("/notifications"),

  markRead: (input: { notificationId?: string; markAll?: boolean }) =>
    request<unknown>("/notifications", { method: "PATCH", body: input }),
};
