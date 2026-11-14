import { request } from "@/api/client/http";
import type { WisdomBundle } from "@/api/types/models";

export type WisdomGuideDetail = {
  guide: Record<string, unknown>;
  disclaimer?: string;
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
    request<{ reply?: string; message?: string; conversationId?: string; disclaimer?: string }>(
      "/wisdom",
      { method: "POST", body: input, timeoutMs: 60_000 },
    ),

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
