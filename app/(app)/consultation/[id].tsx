import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { consultationApi } from "@/api/endpoints/consultation";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageBubble, type ChatBubbleMessage } from "@/components/chat/MessageBubble";
import { ErrorState, LoadingState, InlineNotice } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/feedback/ToastProvider";
import { spacing } from "@/theme/tokens";

export default function ConsultationChatScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const toast = useToast();
  const info = useQuery({
    queryKey: ["consultation-astrologer", id],
    queryFn: () => consultationApi.getAstrologer(id as string),
    enabled: Boolean(id),
  });
  const astrologer = info.data?.astrologer;

  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);

  const send = async (text: string) => {
    setSending(true);
    const userMessage: ChatBubbleMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    try {
      const reply = await consultationApi.chat({
        astrologerId: id as string,
        message: text,
        conversationId,
        language: "auto",
      });
      if (reply.conversationId) setConversationId(reply.conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: reply.reply ?? reply.message ?? "…",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch {
      toast.show("The astrologer is unavailable right now.", "error");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen title={astrologer?.name ?? "Consultation"} subtitle={astrologer?.title} showBack>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        {info.isLoading ? (
          <LoadingState variant="detail" />
        ) : info.isError ? (
          <ErrorState error={info.error} onRetry={() => info.refetch()} />
        ) : (
          <>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: spacing.md }}>
              {messages.length === 0 ? (
                <View style={{ paddingVertical: spacing.xxl, gap: spacing.sm, alignItems: "center" }}>
                  <Text variant="body" tone="muted" align="center">
                    {astrologer?.bio ?? "Share what's on your mind to begin."}
                  </Text>
                </View>
              ) : (
                messages.map((message) => <MessageBubble key={message.id} message={message} />)
              )}
            </ScrollView>
            <InlineNotice body={info.data?.disclaimer ?? "Guidance only. For urgent matters, contact local support services."} />
            <ChatComposer onSend={send} sending={sending} placeholder={`Ask ${astrologer?.name ?? "the astrologer"}…`} />
          </>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
