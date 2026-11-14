export const queryKeys = {
  profile: {
    bundle: ["profile", "bundle"] as const,
    birthDetails: ["profile", "birth-details"] as const,
    preferences: ["profile", "preferences"] as const,
  },
  billing: {
    summary: ["billing", "summary"] as const,
  },
  notifications: {
    list: ["notifications", "list"] as const,
  },
  horoscope: {
    bundle: (year?: number) => ["horoscope", "bundle", year ?? "now"] as const,
    extras: ["horoscope", "extras"] as const,
  },
  panchanga: (date?: string) => ["panchanga", date ?? "today"] as const,
  numerology: ["numerology"] as const,
  astrology: {
    root: ["astrology"] as const,
    module: (module: string, params?: Record<string, unknown>) =>
      ["astrology", module, params ?? {}] as const,
  },
  compatibility: {
    list: ["compatibility", "list"] as const,
    detail: (id: string) => ["compatibility", "detail", id] as const,
  },
  matchmaking: {
    search: (params: Record<string, unknown>) => ["matchmaking", "search", params] as const,
    likes: (type: string) => ["matchmaking", "likes", type] as const,
    visitors: ["matchmaking", "visitors"] as const,
    profile: (id: string) => ["matchmaking", "profile", id] as const,
  },
  chats: {
    list: ["chats", "list"] as const,
    messages: (chatId: string) => ["chats", "messages", chatId] as const,
    iceBreakers: (id: string) => ["chats", "ice-breakers", id] as const,
  },
  ai: {
    conversations: (agent?: string) => ["ai", "conversations", agent ?? "all"] as const,
    insights: ["ai", "insights"] as const,
    marriageGuru: ["ai", "marriage-guru"] as const,
  },
  wisdom: {
    library: (guideId?: string) => ["wisdom", "library", guideId ?? "all"] as const,
    journal: ["wisdom", "journal"] as const,
    thinkific: ["wisdom", "thinkific"] as const,
  },
  consultation: {
    astrologers: ["consultation", "astrologers"] as const,
    astrologer: (id: string) => ["consultation", "astrologer", id] as const,
  },
};
