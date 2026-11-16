import { useLocalSearchParams } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, MessageCircle, Sparkles } from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { errorMessage } from "@/api/client/errors";
import { aiApi, type VedaAgentKey } from "@/api/endpoints/ai";
import { queryKeys } from "@/api/queryKeys";
import type { AiReply } from "@/api/types/models";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageBubble, type ChatBubbleMessage } from "@/components/chat/MessageBubble";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/feedback/ToastProvider";
import { AI_AGENTS } from "@/lib/constants";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

const SUGGESTIONS: Record<string, string[]> = {
  VIRTUAL_ASTROLOGER: [
    "What does my Moon sign say about how I love?",
    "Which period is best for marriage in my chart?",
    "How can I work with my Manglik placement?",
  ],
  ASTROLOGER_GURU: [
    "What are the strongest themes in my birth chart?",
    "Which planets influence my career and purpose most?",
    "What should I focus on during my current dasha?",
  ],
  HOROSCOPE: [
    "Explain my lagna, Moon, and Sun signs in simple terms.",
    "What do my current planetary transits suggest?",
    "Which areas of life are highlighted for me now?",
  ],
  COMPATIBILITY: [
    "What makes a partner compatible with my chart?",
    "How should I interpret guna milan beyond the score?",
    "What strengths should I look for in a relationship?",
  ],
  MARRIAGE_TIMING: [
    "What periods look favorable for marriage in my chart?",
    "Which factors affect my marriage timing most?",
    "How can I prepare for the right timing?",
  ],
  MARRIAGE_GURU: [
    "Am I ready for marriage right now?",
    "What should I look for in a partner?",
    "How do I balance career and marriage?",
  ],
  RELATIONSHIP_COACH: [
    "How can I communicate better with my partner?",
    "Why do the same conflicts keep returning?",
    "How do I build trust after a setback?",
  ],
  PROFILE_ANALYSIS: [
    "How can I improve my profile to get better matches?",
    "What details should I highlight about myself?",
    "Is anything important missing from my profile?",
  ],
  SEARCH: [
    "Help me refine what I should look for in a match.",
    "Which preferences matter most for long-term fit?",
    "How can I balance preferences and compatibility?",
  ],
  RECOMMENDATION: [
    "Why might certain matches be recommended to me?",
    "How should I compare two recommended profiles?",
    "What should I consider before connecting?",
  ],
  REPORT: [
    "Help me understand my compatibility report.",
    "What should I focus on in my astrology reports?",
    "Explain the key strengths and cautions in my chart.",
  ],
  WISDOM_GUIDE: [
    "Help me reflect on patience.",
    "What does my chart suggest about purpose?",
    "Give me a grounding practice for today.",
  ],
  SUPPORT: [
    "How do I complete my profile and birth details?",
    "Where can I find my matches and messages?",
    "How do billing or consultations work in VedaMilan?",
  ],
};

function GuruAvatar({ title, selected, size = 44 }: { title: string; selected?: boolean; size?: number }) {
  const { palette } = useTheme();
  const initial = title.trim().charAt(0).toUpperCase() || "G";
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: selected ? palette.gold : `${palette.gold}1F`,
        borderWidth: 1,
        borderColor: selected ? palette.gold : `${palette.gold}55`,
      }}
    >
      <Text variant={size > 40 ? "label" : "caption"} style={{ color: selected ? palette.onGold : palette.gold }}>
        {initial}
      </Text>
    </View>
  );
}

export default function ChatsTabScreen() {
  const { palette } = useTheme();
  const toast = useToast();
  const { agent: agentParam } = useLocalSearchParams<{ agent?: string }>();
  const initialAgent = AI_AGENTS.find((item) => item.key === agentParam) ?? null;
  const [agent, setAgent] = useState<(typeof AI_AGENTS)[number] | null>(initialAgent);
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const handledParamRef = useRef<string | undefined>(agentParam);

  useEffect(() => {
    if (!agentParam) {
      handledParamRef.current = undefined;
      return;
    }
    if (agentParam === handledParamRef.current) return;
    handledParamRef.current = agentParam;
    const found = AI_AGENTS.find((item) => item.key === agentParam);
    if (found) {
      setAgent(found);
      setMessages([]);
      setConversationId(undefined);
    }
  }, [agentParam]);

  useQuery({
    queryKey: queryKeys.ai.conversations(agent?.key),
    queryFn: () => aiApi.listConversations(agent?.key as VedaAgentKey | undefined),
    enabled: Boolean(agent),
  });

  const chat = useMutation({
    mutationFn: (message: string) =>
      aiApi.chat({
        agent: (agent?.key ?? "VIRTUAL_ASTROLOGER") as VedaAgentKey,
        message,
        conversationId,
      }),
    onSuccess: (reply: AiReply) => {
      setConversationId(reply.conversationId ?? conversationId);
      const answer = reply.answer ?? reply.reply ?? reply.message ?? "";
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: answer || "I could not form a reply. Please try again.",
        },
      ]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onError: (error) => toast.show(errorMessage(error), "error"),
  });

  const send = (text: string) => {
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", content: text }]);
    chat.mutate(text);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  if (!agent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right"]}>
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: palette.border }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <MessageCircle size={18} color={palette.gold} />
            <Text variant="micro" tone="gold" style={{ letterSpacing: 1.8 }}>
              AI GURU
            </Text>
          </View>
          <Text variant="titleLg" weight="semibold" style={{ marginTop: spacing.xs }}>
            Guru Chats
          </Text>
          <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
            Pick a guru and start chatting — chart-aware guidance in a conversation.
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.giant, gap: spacing.sm }}
          showsVerticalScrollIndicator={false}
        >
          {AI_AGENTS.map((item) => (
            <Card
              key={item.key}
              onPress={() => setAgent(item)}
              accessibilityLabel={`Chat with ${item.title}`}
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.md }}
            >
              <GuruAvatar title={item.title} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="body" weight="semibold">
                  {item.title}
                </Text>
                <Text variant="small" tone="muted" numberOfLines={2}>
                  {item.blurb}
                </Text>
              </View>
              <Sparkles size={16} color={palette.gold} />
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
            backgroundColor: palette.canvas,
          }}
        >
          <Pressable
            onPress={() => {
              setAgent(null);
              setMessages([]);
              setConversationId(undefined);
            }}
            accessibilityRole="button"
            accessibilityLabel="Back to guru chats"
            hitSlop={10}
            style={{
              width: 36,
              height: 36,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radii.pill,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.raised,
            }}
          >
            <ChevronLeft size={20} color={palette.text} />
          </Pressable>
          <GuruAvatar title={agent.title} selected />
          <View style={{ flex: 1 }}>
            <Text variant="label" numberOfLines={1}>
              {agent.title}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: palette.emerald }} />
              <Text variant="micro" tone="gold">
                AI Guru · online
              </Text>
            </View>
          </View>
          {messages.length ? (
            <Pressable
              onPress={() => {
                setMessages([]);
                setConversationId(undefined);
              }}
              accessibilityRole="button"
              accessibilityLabel="Start a new conversation"
            >
              <Text variant="caption" tone="gold">
                New
              </Text>
            </Pressable>
          ) : null}
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.lg }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          {messages.length === 0 ? (
            <View style={{ gap: spacing.lg }}>
              <View style={{ alignItems: "center", gap: spacing.sm, paddingVertical: spacing.md }}>
                <GuruAvatar title={agent.title} selected size={64} />
                <Text variant="title" style={{ textAlign: "center" }}>
                  {agent.title}
                </Text>
                <Text variant="small" tone="muted" style={{ textAlign: "center" }}>
                  {agent.blurb}
                </Text>
                <Text variant="micro" tone="faint" style={{ textAlign: "center" }}>
                  Chart-aware AI guidance · reflective, not a substitute for professional advice
                </Text>
              </View>
              <View style={{ gap: spacing.sm }}>
                <Text variant="micro" tone="faint">
                  SUGGESTED
                </Text>
                {(SUGGESTIONS[agent.key] ?? [
                  "Tell me about my chart.",
                  "What should I focus on now?",
                  "Give me guidance for my path.",
                ]).map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => send(suggestion)}
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
                    <Text variant="small">{suggestion}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} disclaimer="1" />
            ))
          )}
          {chat.isPending ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm }}>
              <ActivityIndicator size="small" color={palette.gold} />
              <Text variant="caption" tone="muted">
                {agent.title} is thinking…
              </Text>
            </View>
          ) : null}
          {chat.isError ? (
            <Text variant="caption" tone="ruby">
              {errorMessage(chat.error)}
            </Text>
          ) : null}
        </ScrollView>

        <ChatComposer onSend={send} sending={chat.isPending} placeholder={`Message ${agent.title}…`} />
        <View style={{ height: spacing.sm }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
