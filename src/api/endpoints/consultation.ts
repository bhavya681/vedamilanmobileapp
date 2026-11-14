import { request } from "@/api/client/http";

export type Astrologer = {
  id: string;
  name: string;
  title?: string;
  bio?: string;
  specialties?: string[];
  languages?: string[];
  experienceYears?: number;
  photo?: string | null;
  [key: string]: unknown;
};

export type ConsultationReply = {
  reply?: string;
  message?: string;
  conversationId?: string;
  disclaimer?: string;
  [key: string]: unknown;
};

export const consultationApi = {
  listAstrologers: () =>
    request<{ astrologers: Astrologer[]; disclaimer?: string }>("/consultation/astrologers"),

  getAstrologer: (astrologerId: string) =>
    request<{ astrologer: Astrologer; disclaimer?: string }>("/consultation/astrologers", {
      query: { astrologerId },
    }),

  chat: (input: {
    astrologerId: string;
    message: string;
    conversationId?: string;
    language?: "en" | "hi" | "mr" | "es" | "auto";
  }) =>
    request<ConsultationReply>("/consultation/chat", {
      method: "POST",
      body: input,
      timeoutMs: 60_000,
    }),

  voiceQuota: () => request<Record<string, unknown>>("/consultation/voice/session"),
};
