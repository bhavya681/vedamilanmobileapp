export const NOTIFICATION_PATHS = {
  notifications: "/(app)/notifications",
  chat: "/(app)/chat/[id]",
  chats: "/(tabs)/chats",
  visitors: "/(app)/visitors",
  likes: "/(app)/likes",
  match: "/(app)/match/[id]",
  discover: "/(tabs)/discover",
  connections: "/(app)/connections",
  billing: "/(app)/billing",
  kundli: "/(tabs)/kundli",
  wisdom: "/(app)/wisdom",
  journal: "/(app)/journal",
} as const;

export type NotificationPath = (typeof NOTIFICATION_PATHS)[keyof typeof NOTIFICATION_PATHS];

export type NotificationTarget = {
  path: NotificationPath;
  params?: Record<string, string>;
};

type NotificationData = Record<string, unknown>;

function str(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isNotificationPath(value: string): value is NotificationPath {
  return Object.values<string>(NOTIFICATION_PATHS).includes(value);
}

function fromWebHref(href: string): NotificationTarget | undefined {
  const [path, query = ""] = href.split("?");
  const params = Object.fromEntries(new URLSearchParams(query));
  if (path === "/dashboard/matches/profile") {
    const id = params.id;
    return id ? { path: NOTIFICATION_PATHS.match, params: { id } } : { path: NOTIFICATION_PATHS.discover };
  }
  if (path === "/dashboard/your-connection") {
    return params.partner
      ? { path: NOTIFICATION_PATHS.connections, params: { partner: params.partner } }
      : { path: NOTIFICATION_PATHS.connections };
  }
  if (path === "/dashboard/matches" || path === "/dashboard/recommendations") {
    return { path: NOTIFICATION_PATHS.discover };
  }
  if (path === "/dashboard/kundli" || path === "/dashboard/horoscope") {
    return { path: NOTIFICATION_PATHS.kundli };
  }
  if (path === "/dashboard/messages" || path === "/dashboard/chats") {
    return params.chatId
      ? { path: NOTIFICATION_PATHS.chat, params: { id: params.chatId } }
      : { path: NOTIFICATION_PATHS.chats };
  }
  if (path === "/dashboard/billing") return { path: NOTIFICATION_PATHS.billing };
  if (path === "/dashboard/wisdom") return { path: NOTIFICATION_PATHS.wisdom };
  return undefined;
}

const PATH_BY_NAME: Record<string, NotificationPath> = {
  notifications: NOTIFICATION_PATHS.notifications,
  chat: NOTIFICATION_PATHS.chat,
  chats: NOTIFICATION_PATHS.chats,
  visitors: NOTIFICATION_PATHS.visitors,
  likes: NOTIFICATION_PATHS.likes,
  match: NOTIFICATION_PATHS.match,
  matches: NOTIFICATION_PATHS.discover,
  discover: NOTIFICATION_PATHS.discover,
  recommendations: NOTIFICATION_PATHS.discover,
  connections: NOTIFICATION_PATHS.connections,
  billing: NOTIFICATION_PATHS.billing,
  kundli: NOTIFICATION_PATHS.kundli,
  horoscope: NOTIFICATION_PATHS.kundli,
  wisdom: NOTIFICATION_PATHS.wisdom,
  journal: NOTIFICATION_PATHS.journal,
};

function fromScreenName(screen: string): NotificationTarget | undefined {
  const name = screen.replace(/^\/+/, "").replace(/^\((app|tabs)\)\//, "");
  const path = PATH_BY_NAME[name];
  return path ? { path } : undefined;
}

export function targetFromNotificationData(data: NotificationData | undefined | null): NotificationTarget {
  const fallback: NotificationTarget = { path: NOTIFICATION_PATHS.notifications };
  if (!data) return fallback;

  const deepLink = str(data.url) ?? str(data.link) ?? str(data.deepLink);
  if (deepLink?.startsWith("/")) {
    const web = fromWebHref(deepLink);
    if (web) return web;
    const [path, query = ""] = deepLink.split("?");
    if (path && isNotificationPath(path)) {
      const params = Object.fromEntries(new URLSearchParams(query));
      return Object.keys(params).length ? { path, params } : { path };
    }
    if (path) {
      const alias = fromScreenName(path);
      if (alias) return alias;
    }
  }

  const href = str(data.href);
  if (href?.startsWith("/")) {
    const web = fromWebHref(href);
    if (web) return web;
  }

  const type = (str(data.type) ?? "").toUpperCase();
  const otherUserId = str(data.otherUserId);
  const chatId = str(data.chatId);

  if (type.includes("MESSAGE") || type === "CHAT") {
    return chatId
      ? { path: NOTIFICATION_PATHS.chat, params: { id: chatId } }
      : { path: NOTIFICATION_PATHS.chats };
  }
  if (type.includes("VISITOR") || type === "PROFILE_VIEW") return { path: NOTIFICATION_PATHS.visitors };
  if (type.includes("LIKE") || type.includes("INTEREST")) {
    return otherUserId
      ? { path: NOTIFICATION_PATHS.match, params: { id: otherUserId } }
      : { path: NOTIFICATION_PATHS.likes };
  }
  if (type.includes("CONNECTION") || type.includes("JOURNEY")) {
    return { path: NOTIFICATION_PATHS.connections, params: otherUserId ? { partner: otherUserId } : undefined };
  }
  if (type.includes("MATCH") || type.includes("RECOMMEND")) {
    return otherUserId
      ? { path: NOTIFICATION_PATHS.match, params: { id: otherUserId } }
      : { path: NOTIFICATION_PATHS.discover };
  }
  if (type.includes("BILLING") || type.includes("PREMIUM") || type.includes("PAYMENT")) {
    return { path: NOTIFICATION_PATHS.billing };
  }
  if (type.includes("KUNDLI") || type.includes("HOROSCOPE")) return { path: NOTIFICATION_PATHS.kundli };
  if (type.includes("WISDOM") || type.includes("JOURNAL")) return { path: NOTIFICATION_PATHS.wisdom };

  const screen = str(data.screen);
  if (screen) {
    const target = fromScreenName(screen);
    if (target) return target;
  }

  if (otherUserId) return { path: NOTIFICATION_PATHS.match, params: { id: otherUserId } };
  return fallback;
}
