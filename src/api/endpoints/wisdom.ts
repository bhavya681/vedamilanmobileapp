import { request } from "@/api/client/http";
import type { WisdomBundle, WisdomGuide } from "@/api/types/models";

export type WisdomGuideDetail = {
  guide: WisdomGuide;
  disclaimer?: string;
};

export type WisdomChatReply = {
  conversationId?: string;
  guideId?: string;
  guideName?: string;
  answer?: string;
  reply?: string;
  message?: string;
  disclaimer?: string;
  model?: string;
  sources?: string[];
  messages?: { role: string; content?: string; createdAt?: string }[];
};

export type WisdomCouncilReply = {
  conversationId?: string;
  answer?: string;
  disclaimer?: string;
  model?: string;
  sources?: string[];
  messages?: { role: string; content?: string; createdAt?: string }[];
  guides?: { id?: string; name?: string; sources?: string[] }[];
};

export type WisdomJournalEntry = {
  _id?: string;
  id?: string;
  guideId?: string | null;
  guideName?: string;
  category?: string;
  question?: string;
  insight: string;
  reflection?: string;
  createdAt?: string;
};

export type VoiceSession = {
  sessionId?: string;
  session?: { id?: string; [key: string]: unknown };
  remainingSeconds?: number;
  dailyLimitSeconds?: number;
  privacyNotice?: string;
  [key: string]: unknown;
};

export const wisdomApi = {
  getLibrary: (query?: { guideId?: string; need?: string }) =>
    request<WisdomBundle | WisdomGuideDetail>("/wisdom", { query }),

  chat: (input: {
    guideId: string;
    message: string;
    conversationId?: string;
    topic?: string;
    includeLifeContext?: boolean;
  }) =>
    request<WisdomChatReply>("/wisdom", {
      method: "POST",
      body: input,
      timeoutMs: 60_000,
    }),

  council: (input: {
    message: string;
    guideIds: string[];
    need?: string;
  }) =>
    request<WisdomCouncilReply>("/wisdom", {
      method: "POST",
      body: { mode: "council", ...input },
      timeoutMs: 60_000,
    }),

  journal: {
    list: () => request<{ entries: WisdomJournalEntry[] }>("/wisdom/journal"),
    create: (input: {
      guideId?: string;
      guideName?: string;
      category: string;
      question?: string;
      insight: string;
      reflection?: string;
    }) => request<{ entry: WisdomJournalEntry }>("/wisdom/journal", { method: "POST", body: input }),
  },

  voice: {
    quota: () => request<VoiceSession>("/wisdom/voice/session"),
    start: (input: { guideId: string; language?: string }) =>
      request<VoiceSession>("/wisdom/voice/session", { method: "POST", body: input }),
    ttsUrl: "/wisdom/voice/tts",
  },
};

export const grahaKathaApi = {
  progress: () => request<{ progress: Record<string, unknown> }>("/graha-katha/progress"),
  update: (input: {
    exploreGrahaId?: string;
    completeChapter?: { grahaId: string; chapterId: string };
    toggleBookmark?: string;
    saveInsight?: string;
  }) => request<{ progress: Record<string, unknown> }>("/graha-katha/progress", { method: "PATCH", body: input }),
};
