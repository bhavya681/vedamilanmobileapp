import { request, uploadRequest } from "@/api/client/http";
import type { ChatMessage, ChatSummary, MessagesResponse } from "@/api/types/models";

export type TranslateResult = {
  originalText: string;
  translatedText: string | null;
  targetLocale: string;
  provider?: string | null;
  label?: string;
};

function normalizeMessages(input: MessagesResponse | ChatMessage[]): {
  messages: ChatMessage[];
  total?: number;
  page?: number;
  hasMore?: boolean;
} {
  if (Array.isArray(input)) return { messages: input };
  const messages = input.items ?? input.data ?? input.results ?? [];
  return {
    messages,
    total: input.total,
    page: input.page,
    hasMore: input.hasMore ?? (input.totalPages ? (input.page ?? 1) < input.totalPages : undefined),
  };
}

export const chatApi = {
  listChats: () => request<{ chats: ChatSummary[] }>("/chats"),

  openChat: (otherUserId: string) =>
    request<{ chat: { id?: string; _id?: string } }>("/chats", {
      method: "POST",
      body: { otherUserId },
    }),

  listMessages: async (chatId: string, page = 1, limit = 50) => {
    const result = await request<MessagesResponse>(`/chats/${encodeURIComponent(chatId)}/messages`, {
      query: { page, limit },
    });
    return normalizeMessages(result);
  },

  sendMessage: (
    chatId: string,
    input: {
      body?: string;
      type?: "TEXT" | "IMAGE" | "VOICE";
      mediaUrl?: string;
      mediaPublicId?: string;
      durationSec?: number;
      clientMessageId?: string;
    },
  ) =>
    request<{ message: ChatMessage }>(`/chats/${encodeURIComponent(chatId)}/messages`, {
      method: "POST",
      body: input,
    }),

  setTyping: (chatId: string, isTyping: boolean) =>
    request<{ ok: true }>(`/chats/${encodeURIComponent(chatId)}/typing`, {
      method: "POST",
      body: { isTyping },
    }),

  iceBreakers: (otherUserId: string) =>
    request<{ replies: string[] }>("/chats/ice-breakers", { query: { otherUserId } }),

  translate: (input: { text: string; targetLocale: string; sourceLocale?: string }) =>
    request<TranslateResult>("/chat/translate", { method: "POST", body: input }),

  uploadMedia: async (file: { uri: string; name: string; type: string }, kind: "image" | "voice") => {
    const form = new FormData();
    form.append("kind", kind);
    form.append("file", file as unknown as Blob);
    return uploadRequest<{ url?: string; secureUrl?: string; publicId?: string }>(
      "/chats/media",
      form,
    );
  },
};
