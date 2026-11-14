import { request } from "@/api/client/http";
import type { AiConversation, AiReply } from "@/api/types/models";

export type VedaAgentKey =
  | "ASTROLOGER_GURU"
  | "HOROSCOPE"
  | "COMPATIBILITY"
  | "MARRIAGE_TIMING"
  | "MARRIAGE_GURU"
  | "RELATIONSHIP_COACH"
  | "PROFILE_ANALYSIS"
  | "SEARCH"
  | "RECOMMENDATION"
  | "NOTIFICATION"
  | "REPORT"
  | "SUPPORT"
  | "WISDOM_GUIDE"
  | "VIRTUAL_ASTROLOGER";

export const aiApi = {
  listConversations: (agent?: VedaAgentKey) =>
    request<{ conversations: AiConversation[] }>("/ai/chat", { query: { agent } }),

  chat: (input: {
    agent: VedaAgentKey;
    message: string;
    conversationId?: string;
    candidateUserId?: string;
  }) =>
    request<AiReply>("/ai/chat", {
      method: "POST",
      body: { ...input, ui: false },
      timeoutMs: 60_000,
    }),

  insights: () => request<Record<string, unknown>>("/ai/insights", { timeoutMs: 45_000 }),

  marriageGuru: () => request<Record<string, unknown>>("/ai/marriage-guru", { timeoutMs: 45_000 }),

  productGuide: (message: string) =>
    request<{ answer: string }>("/ai/guide", { method: "POST", body: { message }, anonymous: true }),
};
