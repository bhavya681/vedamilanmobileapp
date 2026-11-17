import { useQueryClient } from "@tanstack/react-query";
import Pusher, { type Channel } from "pusher-js";
import { useEffect, useRef, useState } from "react";

import { PUSHER_CLUSTER, PUSHER_ENABLED, PUSHER_KEY } from "@/api/client/config";
import { chatApi, type ChatMessagesPage, type PusherAuthResult } from "@/api/endpoints/chat";
import { queryKeys } from "@/api/queryKeys";
import type { ChatMessage } from "@/api/types/models";
import { useSession } from "@/providers/SessionProvider";

type MessageEvent = {
  message?: ChatMessage;
  chatId?: string;
};

type TypingEvent = {
  chatId?: string;
  userId?: string;
  isTyping?: boolean;
};

function mergeIncoming(page: ChatMessagesPage | undefined, message: ChatMessage): ChatMessagesPage {
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

/**
 * Subscribes to the private chat channel when `EXPO_PUBLIC_PUSHER_KEY` is set.
 * Without a Pusher key the hook is inert and callers keep the safe polling
 * fallback in `useChatMessages`.
 */
export function useChatRealtime(chatId?: string) {
  const qc = useQueryClient();
  const { user } = useSession();
  const currentUserId = user?.user.id;
  const [typingUserIds, setTypingUserIds] = useState<string[]>([]);
  const [connectedChatId, setConnectedChatId] = useState<string | null>(null);
  const connected = Boolean(PUSHER_ENABLED && chatId && connectedChatId === chatId);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    if (!PUSHER_ENABLED || !chatId) return;

    const messagesKey = queryKeys.chats.messages(chatId);
    const channelName = `private-chat-${chatId}`;

    const client = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
      authorizer: (channel: Channel) => ({
        authorize: (socketId, callback) => {
          void chatApi
            .authorizePusher(socketId, channel.name)
            .then((auth: PusherAuthResult) => callback(null, auth))
            .catch((error: unknown) =>
              callback(error instanceof Error ? error : new Error("Channel authorization failed"), null),
            );
        },
      }),
    });

    const channel = client.subscribe(channelName);

    client.connection.bind("state_change", (states: { current?: string }) => {
      if (states.current === "disconnected" || states.current === "unavailable" || states.current === "failed") {
        setConnectedChatId(null);
      }
    });
    channel.bind("pusher:subscription_succeeded", () => setConnectedChatId(chatId));
    channel.bind("pusher:subscription_error", () => setConnectedChatId(null));

    channel.bind("message:new", (payload: MessageEvent) => {
      if (!payload?.message) return;
      qc.setQueryData<ChatMessagesPage>(messagesKey, (current) =>
        mergeIncoming(current, payload.message as ChatMessage),
      );
      void qc.invalidateQueries({ queryKey: queryKeys.chats.list });
    });

    channel.bind("typing", (payload: TypingEvent) => {
      if (!payload?.userId || payload.userId === currentUserId) return;
      const userId = payload.userId;
      if (timers.current[userId]) clearTimeout(timers.current[userId]);
      if (payload.isTyping) {
        setTypingUserIds((current) => (current.includes(userId) ? current : [...current, userId]));
        timers.current[userId] = setTimeout(() => {
          setTypingUserIds((current) => current.filter((id) => id !== userId));
          delete timers.current[userId];
        }, 4_000);
      } else {
        setTypingUserIds((current) => current.filter((id) => id !== userId));
      }
    });

    return () => {
      setConnectedChatId(null);
      setTypingUserIds([]);
      for (const timer of Object.values(timers.current)) clearTimeout(timer);
      timers.current = {};
      channel.unbind_all();
      channel.unsubscribe();
      client.disconnect();
    };
  }, [chatId, currentUserId, qc]);

  return {
    realtimeEnabled: PUSHER_ENABLED,
    connected,
    typing: typingUserIds.length > 0,
  };
}

export function useTypingIndicator(chatId?: string) {
  const lastSent = useRef(0);
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (stopTimer.current) clearTimeout(stopTimer.current);
      if (chatId) void chatApi.setTyping(chatId, false).catch(() => undefined);
    },
    [chatId],
  );

  const notifyTyping = () => {
    if (!chatId) return;
    const now = Date.now();
    if (now - lastSent.current > 1_500) {
      lastSent.current = now;
      void chatApi.setTyping(chatId, true).catch(() => undefined);
    }
    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => {
      lastSent.current = 0;
      void chatApi.setTyping(chatId, false).catch(() => undefined);
    }, 2_500);
  };

  const stopTyping = () => {
    if (!chatId) return;
    lastSent.current = 0;
    if (stopTimer.current) clearTimeout(stopTimer.current);
    void chatApi.setTyping(chatId, false).catch(() => undefined);
  };

  return { notifyTyping, stopTyping };
}
