import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { wisdomApi, type WisdomGuideDetail } from "@/api/endpoints/wisdom";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageBubble, type ChatBubbleMessage } from "@/components/chat/MessageBubble";
import { Button } from "@/components/ui/Button";
import { ErrorState, InlineNotice, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/feedback/ToastProvider";
import { DISCLAIMER } from "@/lib/constants";
import { spacing } from "@/theme/tokens";

export default function WisdomGuideScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const toast = useToast();
  const query = useQuery({
    queryKey: ["wisdom", id],
    queryFn: () => wisdomApi.getLibrary({ guideId: id as string }),
    enabled: Boolean(id),
  });
  const detail = query.data as WisdomGuideDetail | undefined;
  const guide = detail?.guide as { name?: string; summary?: string } | undefined;

  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [sending, setSending] = useState(false);
  const [lastReply, setLastReply] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!lastReply) return null;
      return wisdomApi.journal.create({
        guideId: id,
        guideName: guide?.name,
        category: "reflection",
        insight: lastReply,
      });
    },
    onSuccess: () => toast.show("Saved to your journal.", "success"),
    onError: () => toast.show("Could not save this reflection.", "error"),
  });

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
      const reply = await wisdomApi.chat({
        guideId: id as string,
        message: text,
        conversationId,
        includeLifeContext: true,
      });
      if (reply.conversationId) setConversationId(reply.conversationId);
      const content = reply.reply ?? reply.message ?? "…";
      setLastReply(content);
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content, createdAt: new Date().toISOString() },
      ]);
    } catch {
      toast.show("The guide is unavailable right now.", "error");
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen title={guide?.name ?? "Wisdom guide"} subtitle={guide?.summary} showBack>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={90}>
        {query.isLoading ? (
          <LoadingState variant="detail" />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : (
          <>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: spacing.md, gap: spacing.sm }}>
              {messages.length === 0 ? (
                <View style={{ alignItems: "center", paddingVertical: spacing.xxl, gap: spacing.sm }}>
                  <Text variant="body" tone="muted" align="center">
                    Ask about love, marriage, purpose, or a situation on your mind.
                  </Text>
                  <Text variant="caption" tone="faint" align="center">
                    The guide responds from Vedic wisdom and your chart context.
                  </Text>
                </View>
              ) : (
                messages.map((message) => <MessageBubble key={message.id} message={message} disclaimer={DISCLAIMER} />)
              )}
            </ScrollView>
            {lastReply ? (
              <Button
                label="Save reflection to journal"
                variant="ghost"
                size="sm"
                loading={save.isPending}
                onPress={() => save.mutate()}
              />
            ) : null}
            <InlineNotice body={detail?.disclaimer ?? DISCLAIMER} />
            <ChatComposer onSend={send} sending={sending} placeholder="Ask the guide…" />
            <Button label="Open my journal" variant="ghost" size="sm" onPress={() => router.push("/(app)/journal")} />
          </>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}
