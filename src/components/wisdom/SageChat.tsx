import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import {
  BookmarkPlus,
  Check,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";

import { errorMessage } from "@/api/client/errors";
import { aiApi } from "@/api/endpoints/ai";
import { wisdomApi } from "@/api/endpoints/wisdom";
import { queryKeys } from "@/api/queryKeys";
import type { AiConversation } from "@/api/types/models";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageBubble, type ChatBubbleMessage } from "@/components/chat/MessageBubble";
import { useToast } from "@/components/feedback/ToastProvider";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Text } from "@/components/ui/Text";
import { timeAgo } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

export type SageChatIdentity = {
  title: string;
  tagline: string;
  assistantLabel: string;
  welcomeBody?: string;
  suggestions: string[];
  disclaimer?: string;
};

export type SageChatProps = {
  identity: SageChatIdentity;
  council?: boolean;
  guideId?: string;
  guideName?: string;
  category?: string;
  guideIds: string[];
  need?: string;
};

export function SageChat({
  identity,
  council = false,
  guideId,
  guideName,
  category = "wisdom",
  guideIds,
  need,
}: SageChatProps) {
  const { palette } = useTheme();
  const toast = useToast();
  const queryClient = useQueryClient();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [failedText, setFailedText] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const conversations = useQuery({
    queryKey: queryKeys.ai.conversations("WISDOM_GUIDE"),
    queryFn: () => aiApi.listConversations("WISDOM_GUIDE"),
    staleTime: 60_000,
  });

  const history = useMemo(() => {
    const all = conversations.data?.conversations ?? [];
    return all.filter((item: AiConversation) => {
      const ref = item.contextRefs as Record<string, unknown> | null | undefined;
      if (council) return ref?.mode === "council" || ref?.council === true;
      return Boolean(guideId && ref?.guideId === guideId);
    });
  }, [conversations.data?.conversations, council, guideId]);

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

  const reply = useMutation({
    mutationFn: (text: string) => {
      if (council) {
        return wisdomApi.council({ message: text, guideIds, need });
      }
      if (!guideId) {
        throw new Error("Choose a sage before starting the conversation.");
      }
      return wisdomApi.chat({
        guideId,
        message: text,
        conversationId,
        includeLifeContext: true,
      });
    },
    onSuccess: (result) => {
      setConversationId(result.conversationId ?? conversationId);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          role: "assistant",
          content: result.answer ?? result.reply ?? result.message ?? "The sages had no reply. Please try again.",
          sources: result.sources,
          createdAt: new Date().toISOString(),
        },
      ]);
      setFailedText(null);
      void queryClient.invalidateQueries({ queryKey: queryKeys.ai.conversations("WISDOM_GUIDE") });
    },
    onError: (error, text) => {
      setFailedText(text);
      toast.show(errorMessage(error), "error");
    },
  });

  const send = (text: string, retry = false) => {
    const trimmed = text.trim();
    if (!trimmed || reply.isPending) return;
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
    reply.mutate(trimmed);
  };

  const startNew = () => {
    setMessages([]);
    setConversationId(undefined);
    setFailedText(null);
  };

  const openConversation = (item: AiConversation) => {
    setConversationId(item.id || undefined);
    setMessages(messagesFromConversation(item));
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

  const saveToJournal = async (message: ChatBubbleMessage) => {
    const index = messages.findIndex((item) => item.id === message.id);
    let question: string | undefined;
    for (let i = index - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "user") {
        question = messages[i]?.content;
        break;
      }
    }
    try {
      await wisdomApi.journal.create({
        guideId: council ? undefined : guideId,
        guideName: council ? "Council of Sages" : guideName,
        category,
        question,
        insight: message.content,
      });
      setSavedIds((prev) => [...prev, message.id]);
      void queryClient.invalidateQueries({ queryKey: queryKeys.wisdom.journal });
      toast.show("Saved to your Wisdom Journal.", "success");
    } catch (error) {
      toast.show(errorMessage(error), "error");
    }
  };

  const speak = (message: ChatBubbleMessage) => {
    if (speakingId === message.id) {
      Speech.stop();
      setSpeakingId(null);
      return;
    }
    Speech.stop();
    setSpeakingId(message.id);
    Speech.speak(message.content, {
      language: "en",
      onDone: () => setSpeakingId(null),
      onError: () => setSpeakingId(null),
      onStopped: () => setSpeakingId(null),
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages.length, reply.isPending]);

  useEffect(
    () => () => {
      void Speech.stop();
    },
    [],
  );

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
                WISDOM DIALOGUE
              </Text>
              <Text variant="title">{identity.title}</Text>
              <Text variant="small" tone="muted">
                {identity.welcomeBody ??
                  "Ask in your own words. Guidance stays within the sage’s documented teachings and never fabricates scripture."}
              </Text>
            </Card>

            <View style={{ gap: spacing.sm }}>
              <Text variant="micro" tone="faint">
                QUESTIONS TO BEGIN
              </Text>
              {identity.suggestions.map((suggestion) => (
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

            {history.length ? (
              <View style={{ gap: spacing.sm }}>
                <Text variant="micro" tone="faint">
                  RECENT CONVERSATIONS
                </Text>
                {history.map((item) => (
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
                ))}
              </View>
            ) : conversations.isLoading ? (
              <LoadingState variant="list" />
            ) : conversations.isError ? (
              <ErrorState error={conversations.error} onRetry={() => conversations.refetch()} />
            ) : null}
          </View>
        ) : (
          messages.map((message) => (
            <View key={message.id}>
              <MessageBubble
                message={message}
                disclaimer={identity.disclaimer}
                assistantLabel={identity.assistantLabel}
                onCopy={message.role === "assistant" ? () => void copy(message) : undefined}
                copied={copiedId === message.id}
              />
              {message.role === "assistant" ? (
                <View style={{ flexDirection: "row", gap: spacing.lg, marginLeft: 4, marginTop: -2 }}>
                  <Pressable
                    onPress={() => void saveToJournal(message)}
                    accessibilityRole="button"
                    accessibilityLabel="Save response to journal"
                    hitSlop={6}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  >
                    {savedIds.includes(message.id) ? (
                      <Check size={13} color={palette.gold} />
                    ) : (
                      <BookmarkPlus size={13} color={palette.textMuted} />
                    )}
                    <Text variant="micro" tone={savedIds.includes(message.id) ? "gold" : "faint"}>
                      {savedIds.includes(message.id) ? "Saved" : "Save"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => speak(message)}
                    accessibilityRole="button"
                    accessibilityLabel={speakingId === message.id ? "Stop reading aloud" : "Read response aloud"}
                    hitSlop={6}
                    style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
                  >
                    {speakingId === message.id ? (
                      <VolumeX size={13} color={palette.gold} />
                    ) : (
                      <Volume2 size={13} color={palette.textMuted} />
                    )}
                    <Text variant="micro" tone={speakingId === message.id ? "gold" : "faint"}>
                      {speakingId === message.id ? "Stop" : "Listen"}
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </View>
          ))
        )}

        {reply.isPending ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm }}>
            <ActivityIndicator size="small" color={palette.gold} />
            <Text variant="caption" tone="muted">
              Considering your question…
            </Text>
          </View>
        ) : null}

        {failedText ? (
          <Card tone="outlined" style={{ gap: spacing.sm }}>
            <Text variant="small" tone="ruby">
              That question could not be delivered.
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

      <ChatComposer onSend={send} sending={reply.isPending} placeholder={`Ask ${identity.title}…`} />
      <Text
        variant="micro"
        tone="faint"
        align="center"
        style={{ paddingVertical: 6, paddingHorizontal: spacing.lg }}
      >
        {identity.disclaimer ??
          "Sage guidance is philosophical and scriptural context, not a prediction or professional advice."}
      </Text>
    </KeyboardAvoidingView>
  );
}
