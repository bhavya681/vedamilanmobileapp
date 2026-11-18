import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { BookOpen, RotateCcw, Sparkles } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { errorMessage } from "@/api/client/errors";
import { aiApi, type VedaAgentKey } from "@/api/endpoints/ai";
import { queryKeys } from "@/api/queryKeys";
import type { AiConversation, AiReply } from "@/api/types/models";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageBubble, type ChatBubbleMessage } from "@/components/chat/MessageBubble";
import { useToast } from "@/components/feedback/ToastProvider";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Text } from "@/components/ui/Text";
import { timeAgo } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

export type AgentChatIdentity = {
  title: string;
  tagline: string;
  assistantLabel?: string;
  welcomeTitle?: string;
  welcomeBody?: string;
  suggestions?: string[];
  disclaimer?: string;
  reportLabel?: string;
  onOpenReport?: () => void;
};

export function AgentChat({ agent, identity }: { agent: VedaAgentKey; identity: AgentChatIdentity }) {
  const { palette } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [failedText, setFailedText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const conversations = useQuery({
    queryKey: queryKeys.ai.conversations(agent),
    queryFn: () => aiApi.listConversations(agent),
    staleTime: 60_000,
  });

  const messagesFromConversation = useCallback(
    (item: AiConversation): ChatBubbleMessage[] =>
      (item.messages ?? [])
        .filter((entry) => entry.role === "user" || entry.role === "assistant")
        .map((entry, index) => ({
          id: `${item.id || item._id || "conv"}-${index}`,
          role: entry.role as "user" | "assistant",
          content: (entry.content ?? entry.text ?? "").trim(),
          createdAt: entry.createdAt,
        }))
        .filter((entry) => entry.content.length > 0),
    [],
  );

  const openConversation = useCallback(
    (item: AiConversation) => {
      setConversationId(item.id || undefined);
      setMessages(messagesFromConversation(item));
      setFailedText(null);
    },
    [messagesFromConversation],
  );

  const chat = useMutation({
    mutationFn: (text: string) => aiApi.chat({ agent, message: text, conversationId }),
    onSuccess: (reply: AiReply) => {
      setConversationId(reply.conversationId ?? conversationId);
      const answer = reply.answer ?? reply.reply ?? reply.message ?? "";
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: "assistant",
          content: answer || "I could not form a reply. Please try again.",
          createdAt: new Date().toISOString(),
        },
      ]);
      setFailedText(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.ai.conversations(agent) });
    },
    onError: (error, text) => {
      setFailedText(text);
      toast.show(errorMessage(error), "error");
    },
  });

  const send = (text: string, retry = false) => {
    const trimmed = text.trim();
    if (!trimmed || chat.isPending) return;
    if (!retry) {
      setFailedText(null);
      setMessages((prev) => [
        ...prev,
        {
          id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: "user",
          content: trimmed,
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    chat.mutate(trimmed);
  };

  const startNew = () => {
    setMessages([]);
    setConversationId(undefined);
    setFailedText(null);
  };

  const copy = async (message: ChatBubbleMessage) => {
    try {
      await Clipboard.setStringAsync(message.content);
      setCopiedId(message.id);
      toast.show("Response copied.", "success");
      setTimeout(() => setCopiedId(null), 1600);
    } catch {
      toast.show("Could not copy this response.", "error");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages.length, chat.isPending]);

  const suggestions = identity.suggestions?.length
    ? identity.suggestions
    : [
        "What does my birth chart indicate about marriage?",
        "What are my marriage timing indicators?",
        "Explain my seventh house.",
      ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: spacing.sm,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderBottomWidth: 1,
          borderBottomColor: palette.border,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: radii.pill,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${palette.gold}1F`,
            borderWidth: 1,
            borderColor: `${palette.gold}55`,
          }}
        >
          <Sparkles size={17} color={palette.gold} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="label" numberOfLines={1}>
            {identity.title}
          </Text>
          <Text variant="micro" tone="gold" numberOfLines={1}>
            {identity.tagline}
          </Text>
        </View>
        {identity.onOpenReport ? (
          <Pressable
            onPress={identity.onOpenReport}
            accessibilityRole="button"
            accessibilityLabel={identity.reportLabel ?? "Open context"}
            hitSlop={8}
            style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: spacing.sm }}
          >
            <BookOpen size={14} color={palette.gold} />
            <Text variant="caption" tone="gold">
              {identity.reportLabel ?? "Context"}
            </Text>
          </Pressable>
        ) : null}
        {messages.length ? (
          <Pressable
            onPress={startNew}
            accessibilityRole="button"
            accessibilityLabel="Start new conversation"
            hitSlop={8}
          >
            <Text variant="caption" tone="gold">
              New
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.md }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <View style={{ gap: spacing.lg }}>
            <Card tone="gold" style={{ gap: spacing.sm }}>
              <Text variant="micro" tone="gold" style={{ letterSpacing: 1.6 }}>
                GUIDED CONVERSATION
              </Text>
              <Text variant="title">{identity.welcomeTitle ?? `Ask ${identity.title}`}</Text>
              <Text variant="small" tone="muted">
                {identity.welcomeBody ??
                  "Ask freely. Answers are grounded in your saved chart context and never invent planetary positions."}
              </Text>
            </Card>

            <View style={{ gap: spacing.sm }}>
              <Text variant="micro" tone="faint">
                SUGGESTED QUESTIONS
              </Text>
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => send(suggestion)}
                  accessibilityRole="button"
                  hitSlop={4}
                  style={{
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: radii.lg,
                    borderWidth: 1,
                    borderColor: palette.border,
                    backgroundColor: palette.raised,
                  }}
                >
                  <Text variant="small" tone="muted">
                    {suggestion}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text variant="micro" tone="faint">
                RECENT CONVERSATIONS
              </Text>
              {conversations.isLoading ? (
                <LoadingState variant="list" />
              ) : conversations.isError ? (
                <ErrorState error={conversations.error} onRetry={() => conversations.refetch()} />
              ) : conversations.data?.conversations?.length ? (
                conversations.data.conversations.map((item) => (
                  <Card
                    key={item.id}
                    onPress={() => openConversation(item)}
                    accessibilityLabel={`Continue ${item.title ?? "conversation"}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: spacing.md,
                    }}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text variant="body" weight="semibold" numberOfLines={1}>
                        {item.title || identity.title}
                      </Text>
                      <Text variant="caption" tone="faint">
                        {item.updatedAt ? timeAgo(item.updatedAt) : "Earlier"}
                      </Text>
                    </View>
                    <Text variant="caption" tone="gold">
                      Continue
                    </Text>
                  </Card>
                ))
              ) : (
                <Text variant="caption" tone="faint">
                  No previous conversations yet. Start with a question above.
                </Text>
              )}
            </View>
          </View>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              disclaimer={identity.disclaimer}
              assistantLabel={identity.assistantLabel ?? identity.title.toUpperCase()}
              onCopy={message.role === "assistant" ? () => void copy(message) : undefined}
              copied={copiedId === message.id}
            />
          ))
        )}

        {chat.isPending ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm }}>
            <ActivityIndicator size="small" color={palette.gold} />
            <Text variant="caption" tone="muted">
              Reading your chart…
            </Text>
          </View>
        ) : null}

        {failedText ? (
          <Card tone="outlined" style={{ gap: spacing.sm }}>
            <Text variant="small" tone="ruby">
              That message could not be delivered.
            </Text>
            <Pressable
              onPress={() => send(failedText, true)}
              accessibilityRole="button"
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <RotateCcw size={14} color={palette.gold} />
              <Text variant="small" tone="gold">
                Retry
              </Text>
            </Pressable>
          </Card>
        ) : null}
      </ScrollView>

      <ChatComposer onSend={send} sending={chat.isPending} placeholder={`Ask ${identity.title}…`} />
      <Text
        variant="micro"
        tone="faint"
        align="center"
        style={{ paddingVertical: 6, paddingHorizontal: spacing.lg }}
      >
        {identity.disclaimer ??
          "Vedic guidance is reflective, not a guarantee or a substitute for professional advice."}
      </Text>
    </KeyboardAvoidingView>
  );
}
