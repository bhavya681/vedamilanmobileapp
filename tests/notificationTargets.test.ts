import { describe, expect, it } from "vitest";

import { NOTIFICATION_PATHS, targetFromNotificationData } from "@/lib/notificationTargets";

describe("notification deep links", () => {
  it("falls back to the notification inbox for empty or unknown payloads", () => {
    expect(targetFromNotificationData(undefined).path).toBe(NOTIFICATION_PATHS.notifications);
    expect(targetFromNotificationData({ type: "UNKNOWN_EVENT" }).path).toBe(NOTIFICATION_PATHS.notifications);
  });

  it("maps backend web hrefs to existing mobile routes", () => {
    expect(targetFromNotificationData({ href: "/dashboard/matches/profile?id=user_42" })).toEqual({
      path: NOTIFICATION_PATHS.match,
      params: { id: "user_42" },
    });
    expect(targetFromNotificationData({ href: "/dashboard/your-connection?partner=user_9" })).toEqual({
      path: NOTIFICATION_PATHS.connections,
      params: { partner: "user_9" },
    });
  });

  it("never emits a route that does not exist", () => {
    expect(targetFromNotificationData({ url: "/(app)/discover" }).path).toBe(NOTIFICATION_PATHS.discover);
    expect(targetFromNotificationData({ url: "/(app)/kundli" }).path).toBe(NOTIFICATION_PATHS.kundli);
    expect(targetFromNotificationData({ screen: "totally-made-up-screen" }).path).toBe(
      NOTIFICATION_PATHS.notifications,
    );
  });

  it("uses the related user when a type implies a profile", () => {
    expect(targetFromNotificationData({ type: "MUTUAL_INTEREST", otherUserId: "u7" })).toEqual({
      path: NOTIFICATION_PATHS.match,
      params: { id: "u7" },
    });
    expect(targetFromNotificationData({ type: "VISITOR_VIEW" }).path).toBe(NOTIFICATION_PATHS.visitors);
    expect(targetFromNotificationData({ type: "CHAT_MESSAGE", chatId: "c1" })).toEqual({
      path: NOTIFICATION_PATHS.chat,
      params: { id: "c1" },
    });
  });

  it("preserves params from explicit mobile deep links", () => {
    expect(targetFromNotificationData({ deepLink: "/(app)/chat/[id]?id=c33" })).toEqual({
      path: NOTIFICATION_PATHS.chat,
      params: { id: "c33" },
    });
  });
});
