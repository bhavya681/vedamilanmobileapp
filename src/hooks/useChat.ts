import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { PUSHER_ENABLED } from "@/api/client/config";
import { chatApi, type ChatMessagesPage, type TranslateResult } from "@/api/endpoints/chat";
import { queryKeys } from "@/api/queryKeys";
import type { ChatMessage } from "@/api/types/models";
import { useSession } from "@/providers/SessionProvider";

export function useChatList(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.chats.list,
    queryFn: async () => (await chatApi.listChats()).chats ?? [],
    enabled: enabled && isAuthenticated,
    staleTime: 15_000,
  });
}

export function useChatMessages(chatId?: string, poll = !PUSHER_ENABLED) {
  return useQuery({
    queryKey: queryKeys.chats.messages(chatId ?? ""),
    queryFn: () => chatApi.listMessages(chatId as string),
    enabled: Boolean(chatId),
    refetchInterval: poll ? 5_000 : false,
    refetchIntervalInBackground: false,
  });
}

function mergeMessage(page: ChatMessagesPage | undefined, message: ChatMessage): ChatMessagesPage {
  const messages = page?.messages ?? [];
  const key = message.id ?? message._id ?? message.clientMessageId;
  const next = key
    ? messages.filter(
        (item) =>
          (item.id ?? item._id ?? item.clientMessageId) !== key &&
          (!message.clientMessageId || item.clientMessageId !== message.clientMessageId),
      )
    : messages;
  return {
    ...(page ?? {}),
    messages: [...next, message].sort((a, b) => {
      const at = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
      return at - bt;
    }),
  };
}

export function useSendChatMessage(chatId?: string) {
  const qc = useQueryClient();
  const key = queryKeys.chats.messages(chatId ?? "");
  return useMutation({
    mutationFn: (input: {
      body?: string;
      type?: "TEXT" | "IMAGE" | "VOICE";
      mediaUrl?: string;
      mediaPublicId?: string;
      clientMessageId?: string;
    }) =>
      chatApi.sendMessage(chatId as string, {
        ...input,
        type: input.type ?? "TEXT",
      }),
    onSuccess: ({ message }) => {
      qc.setQueryData<ChatMessagesPage>(key, (current) => mergeMessage(current, message));
      void qc.invalidateQueries({ queryKey: queryKeys.chats.list });
    },
  });
}

export function useIceBreakers(otherUserId?: string) {
  return useQuery({
    queryKey: queryKeys.chats.iceBreakers(otherUserId ?? ""),
    queryFn: () => chatApi.iceBreakers(otherUserId as string),
    enabled: Boolean(otherUserId),
    staleTime: 10 * 60_000,
  });
}

export function useTranslateMessage() {
  return useMutation<TranslateResult, unknown, { text: string; targetLocale: string }>({
    mutationFn: (input) => chatApi.translate(input),
  });
}
