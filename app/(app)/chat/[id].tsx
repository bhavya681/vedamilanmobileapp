import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";

import type { ChatMessage } from "@/api/types/models";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageBubble, type ChatBubbleMessage } from "@/components/chat/MessageBubble";
import { useToast } from "@/components/feedback/ToastProvider";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import {
  useChatList,
  useChatMessages,
  useIceBreakers,
  useSendChatMessage,
  useTranslateMessage,
} from "@/hooks/useChat";
import { useChatRealtime, useTypingIndicator } from "@/hooks/useChatRealtime";
import { useSession } from "@/providers/SessionProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

function createClientMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function ChatScreen() {
  const { id, other, name } = useLocalSearchParams<{ id?: string; other?: string; name?: string }>();
  const toast = useToast();
  const { palette } = useTheme();
  const { user } = useSession();
  const router = useRouter();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [translations, setTranslations] = useState<Record<string, string>>({});

  const chatId = typeof id === "string" ? id : undefined;
  const realtime = useChatRealtime(chatId);
  const query = useChatMessages(chatId, !realtime.connected);
  const chats = useChatList(Boolean(chatId));
  const summary = chats.data?.find((chat) => chat.id === chatId);
  const otherUserId = typeof other === "string" && other ? other : summary?.otherUserId;
  const chatTitle = (typeof name === "string" && name) || summary?.name || "Chat";
  const iceBreakers = useIceBreakers(otherUserId);
  const send = useSendChatMessage(chatId);
  const translate = useTranslateMessage();
  const { notifyTyping, stopTyping } = useTypingIndicator(chatId);

  const messages = query.data?.messages ?? [];

  useEffect(() => {
    if (!query.data) return;
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: false }));
  }, [query.data]);

  const handleSend = async (text: string) => {
    stopTyping();
    try {
      await send.mutateAsync({
        body: text,
        clientMessageId: createClientMessageId(),
      });
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch {
      toast.show("Message could not be sent. Try again.", "error");
    }
  };

  const runTranslation = useCallback(
    async (message: ChatMessage, bubbleId: string, targetLocale: string) => {
      if (!message.body?.trim()) return;
      try {
        const result = await translate.mutateAsync({ text: message.body, targetLocale });
        if (result.available === false || !result.translatedText) {
          toast.show(result.message ?? "Translation is temporarily unavailable.", "info");
          return;
        }
        setTranslations((current) => ({ ...current, [bubbleId]: result.translatedText as string }));
      } catch {
        toast.show("Could not translate that message right now.", "error");
      }
    },
    [toast, translate],
  );

  const translateMessage = useCallback(
    (message: ChatMessage, bubbleId: string) => {
      if (!message.body?.trim()) return;
      Alert.alert("Translate message", "Translation never replaces the original.", [
        { text: "English", onPress: () => void runTranslation(message, bubbleId, "en") },
        { text: "हिन्दी", onPress: () => void runTranslation(message, bubbleId, "hi") },
        { text: "Cancel", style: "cancel" },
      ]);
    },
    [runTranslation],
  );

  const bubbles: (ChatBubbleMessage & { message: ChatMessage })[] = messages
    .filter((message) => message.type !== "SYSTEM" || message.body)
    .map((message, index) => {
      const bubbleId = message.id ?? message._id ?? message.clientMessageId ?? `${index}`;
      const isOwn = message.senderId === user?.user.id;
      return {
        id: bubbleId,
        role: isOwn ? "user" : "assistant",
        content: message.body ?? (message.mediaUrl ? "[Attachment]" : ""),
        createdAt: message.createdAt,
        translated: translations[bubbleId],
        message,
      };
    });

  return (
    <Screen
      title={chatTitle}
      subtitle={
        realtime.typing ? "typing…" : realtime.connected ? "Live · private conversation" : "Private conversation"
      }
      showBack
      scroll={false}
      padded={false}
      edges={["top", "left", "right", "bottom"]}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        {query.isLoading ? (
          <LoadingState variant="detail" />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.md }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {bubbles.length === 0 ? (
              <View style={{ paddingVertical: spacing.xxl, alignItems: "center", gap: spacing.sm }}>
                <Text variant="body" tone="muted">
                  Start the conversation
                </Text>
                <Text variant="caption" tone="faint" align="center">
                  A thoughtful hello goes a long way.
                </Text>
                {iceBreakers.data?.replies?.length ? (
                  <View style={{ width: "100%", gap: spacing.sm, marginTop: spacing.md }}>
                    <Text variant="micro" tone="faint">
                      SUGGESTED OPENERS
                    </Text>
                    {iceBreakers.data.replies.map((reply) => (
                      <Pressable
                        key={reply}
                        onPress={() => void handleSend(reply)}
                        accessibilityRole="button"
                        style={{
                          paddingVertical: spacing.sm,
                          paddingHorizontal: spacing.md,
                          borderWidth: 1,
                          borderColor: palette.border,
                          borderRadius: radii.lg,
                          backgroundColor: palette.raised,
                        }}
                      >
                        <Text variant="small">{reply}</Text>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </View>
            ) : (
              bubbles.map((bubble) => {
                const source = bubble.message;
                const canTranslate = source.senderId !== user?.user.id && Boolean(source.body?.trim());
                return (
                  <MessageBubble
                    key={bubble.id}
                    message={bubble}
                    assistantLabel={chatTitle.toUpperCase()}
                    onLongPress={canTranslate ? () => translateMessage(source, bubble.id) : undefined}
                  />
                );
              })
            )}
          </ScrollView>
        )}
        <ChatComposer
          onSend={handleSend}
          sending={send.isPending}
          disabled={!chatId}
          onChangeText={(text) => {
            if (text.trim()) notifyTyping();
            else stopTyping();
          }}
          placeholder={`Message ${chatTitle}…`}
        />
        {typeof otherUserId === "string" && otherUserId ? (
          <Text
            variant="micro"
            tone="faint"
            align="center"
            style={{ paddingVertical: 6 }}
            onPress={() => router.push(`/(app)/match/${otherUserId}`)}
          >
            View profile
          </Text>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
