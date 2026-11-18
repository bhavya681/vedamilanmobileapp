import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";

import { errorMessage } from "@/api/client/errors";
import { aiApi, type VedaAgentKey } from "@/api/endpoints/ai";
import { queryKeys } from "@/api/queryKeys";
import type { AiConversation, AiReply } from "@/api/types/models";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageBubble, type ChatBubbleMessage } from "@/components/chat/MessageBubble";
import { useToast } from "@/components/feedback/ToastProvider";
import { Text } from "@/components/ui/Text";
import { timeAgo } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

const FOOTNOTE = "Guidance is reflective, not predictive certainty.";

function monogramFor(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

export type AgentChatIdentity = {
  title: string;
  tagline: string;
  monogram?: string;
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
  const { width } = useWindowDimensions();
  const compact = width < 390;
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

  const recent = useMemo(
    () => conversations.data?.conversations?.slice(0, 3) ?? [],
    [conversations.data?.conversations],
  );

  const suggestions = useMemo(
    () =>
      (identity.suggestions?.length
        ? identity.suggestions
        : ["Explain my birth chart", "What does my current dasha mean?"]
      ).slice(0, 2),
    [identity.suggestions],
  );

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
    if (!messages.length) return;
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(timer);
  }, [messages.length, chat.isPending]);

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
          gap: compact ? spacing.xs : spacing.sm,
          paddingHorizontal: compact ? spacing.md : spacing.lg,
          paddingVertical: 10,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: palette.border,
        }}
      >
        <View
          style={{
            width: compact ? 30 : 34,
            height: compact ? 30 : 34,
            borderRadius: radii.md,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: `${palette.gold}1A`,
            borderWidth: 1,
            borderColor: `${palette.gold}4D`,
          }}
        >
          <Text variant="micro" tone="gold" weight="semibold">
            {identity.monogram ?? monogramFor(identity.title)}
          </Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="label" numberOfLines={1}>
            {identity.title}
          </Text>
          {compact ? null : (
            <Text variant="micro" tone="faint" numberOfLines={1}>
              {identity.tagline}
            </Text>
          )}
        </View>
        {identity.onOpenReport ? (
          <Pressable
            onPress={identity.onOpenReport}
            accessibilityRole="button"
            accessibilityLabel={identity.reportLabel ?? "Open context"}
            hitSlop={6}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: `${palette.gold}55`,
              backgroundColor: `${palette.gold}0F`,
            }}
          >
            <Text variant="micro" tone="gold" weight="semibold">
              {identity.reportLabel ?? "Report"}
            </Text>
          </Pressable>
        ) : null}
        {messages.length ? (
          <Pressable
            onPress={startNew}
            accessibilityRole="button"
            accessibilityLabel="Start new conversation"
            hitSlop={6}
            style={{ paddingHorizontal: 4, paddingVertical: 6 }}
          >
            <Text variant="micro" tone="faint">
              New
            </Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: compact ? spacing.md : spacing.lg,
          gap: compact ? spacing.md : spacing.lg,
          paddingBottom: spacing.sm,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {messages.length === 0 ? (
          <View style={{ gap: spacing.lg }}>
            <View
              style={{
                padding: compact ? spacing.md : spacing.lg,
                borderRadius: radii.xxl,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: palette.raised,
                gap: spacing.sm,
              }}
            >
              <Text variant="micro" tone="gold" style={{ letterSpacing: 1.4 }}>
                {identity.title.toUpperCase()}
              </Text>
              <Text variant={compact ? "title" : "heading"}>
                {identity.welcomeTitle ?? `Ask ${identity.title}`}
              </Text>
              <Text variant="small" tone="muted">
                {identity.welcomeBody ??
                  "Ask about your chart, dasha, yogas, or transits in plain language."}
              </Text>
            </View>

            <View style={{ gap: spacing.sm }}>
              <Text variant="micro" tone="faint">
                TRY ASKING
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {suggestions.map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => send(suggestion)}
                    accessibilityRole="button"
                    hitSlop={4}
                    style={{
                      maxWidth: compact ? "100%" : "48%",
                      flexShrink: 1,
                      paddingHorizontal: 12,
                      paddingVertical: 9,
                      borderRadius: radii.pill,
                      borderWidth: 1,
                      borderColor: palette.border,
                      backgroundColor: palette.sunken,
                    }}
                  >
                    <Text variant="caption" tone="muted" numberOfLines={2}>
                      {suggestion}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={{ gap: 4 }}>
              <Text variant="micro" tone="faint">
                RECENT
              </Text>
              {conversations.isLoading ? (
                <Text variant="caption" tone="faint">
                  Loading conversations…
                </Text>
              ) : conversations.isError ? (
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <Text variant="caption" tone="muted">
                    Could not load history.
                  </Text>
                  <Pressable onPress={() => conversations.refetch()} hitSlop={6} accessibilityRole="button">
                    <Text variant="caption" tone="gold">
                      Retry
                    </Text>
                  </Pressable>
                </View>
              ) : recent.length ? (
                recent.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openConversation(item)}
                    accessibilityRole="button"
                    accessibilityLabel={`Continue ${item.title ?? "conversation"}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: spacing.md,
                      paddingVertical: 10,
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: palette.border,
                    }}
                  >
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text variant="body" weight="semibold" numberOfLines={1}>
                        {item.title || identity.title}
                      </Text>
                      <Text variant="micro" tone="faint">
                        {item.updatedAt ? timeAgo(item.updatedAt) : "Earlier"}
                      </Text>
                    </View>
                    <Text variant="micro" tone="gold">
                      Open
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text variant="caption" tone="faint">
                  No conversations yet.
                </Text>
              )}
            </View>
          </View>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              assistantLabel={identity.assistantLabel ?? identity.title.toUpperCase()}
              onCopy={message.role === "assistant" ? () => void copy(message) : undefined}
              copied={copiedId === message.id}
            />
          ))
        )}

        {chat.isPending ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: 4 }}>
            <ActivityIndicator size="small" color={palette.gold} />
            <Text variant="caption" tone="muted">
              Thinking…
            </Text>
          </View>
        ) : null}

        {failedText ? (
          <View
            style={{
              padding: spacing.md,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: `${palette.ruby}66`,
              backgroundColor: `${palette.ruby}12`,
              gap: 6,
            }}
          >
            <Text variant="caption" tone="ruby">
              Couldn’t send that.
            </Text>
            <Pressable
              onPress={() => send(failedText, true)}
              accessibilityRole="button"
              style={{ alignSelf: "flex-start", paddingVertical: 2 }}
            >
              <Text variant="caption" tone="gold" weight="semibold">
                Retry
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <ChatComposer
        onSend={send}
        sending={chat.isPending}
        placeholder={compact ? "Ask anything…" : `Ask ${identity.title}…`}
        disclaimer={identity.disclaimer ?? FOOTNOTE}
      />
    </KeyboardAvoidingView>
  );
}
