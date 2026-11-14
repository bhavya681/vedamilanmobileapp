import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronLeft, Sparkles } from "lucide-react-native";
import React, { useRef, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { errorMessage } from "@/api/client/errors";
import { aiApi, type VedaAgentKey } from "@/api/endpoints/ai";
import { queryKeys } from "@/api/queryKeys";
import type { AiReply } from "@/api/types/models";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { MessageBubble, type ChatBubbleMessage } from "@/components/chat/MessageBubble";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { useToast } from "@/components/feedback/ToastProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { AI_AGENTS } from "@/lib/constants";

const SUGGESTIONS: Record<string, string[]> = {
  VIRTUAL_ASTROLOGER: [
    "What does my Moon sign say about how I love?",
    "Which period is best for marriage in my chart?",
    "How can I work with my Manglik placement?",
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
  WISDOM_GUIDE: [
    "Help me reflect on patience.",
    "What does my chart suggest about purpose?",
    "Give me a grounding practice for today.",
  ],
};

export default function AiScreen() {
  const { palette } = useTheme();
  const toast = useToast();
  const [agent, setAgent] = useState<(typeof AI_AGENTS)[number] | null>(null);
  const [messages, setMessages] = useState<ChatBubbleMessage[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);

  const conversations = useQuery({
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
        { id: `a-${Date.now()}`, role: "assistant", content: answer || "I could not form a reply. Please try again." },
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
        <ScrollView contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.giant }} showsVerticalScrollIndicator={false}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Sparkles size={20} color={palette.gold} />
            <Text variant="micro" tone="gold" style={{ letterSpacing: 2 }}>
              VEDAMILAN GUIDE
            </Text>
          </View>
          <Text variant="display" style={{ marginTop: spacing.sm }}>
            Ask, reflect, understand
          </Text>
          <Text variant="body" tone="muted" style={{ marginTop: spacing.sm }}>
            Choose a guide. Each one reads only your own chart data and explains it in plain language.
          </Text>

          <View style={{ gap: spacing.md, marginTop: spacing.xl }}>
            {AI_AGENTS.map((item) => (
              <Card key={item.key} onPress={() => setAgent(item)} style={{ gap: 4 }}>
                <Text variant="title">{item.title}</Text>
                <Text variant="small" tone="muted">
                  {item.blurb}
                </Text>
              </Card>
            ))}
          </View>

          {conversations.data?.conversations.length ? (
            <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
              <Text variant="label" tone="muted">
                Recent conversations
              </Text>
              {conversations.data.conversations.slice(0, 5).map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => {
                    const found = AI_AGENTS.find((a) => a.key === c.agent) ?? AI_AGENTS[0];
                    setAgent(found ?? null);
                    setConversationId(c.id);
                  }}
                  style={{ paddingVertical: spacing.sm }}
                >
                  <Text variant="small" numberOfLines={1}>
                    {c.title ?? "Conversation"}
                  </Text>
                  <Text variant="micro" tone="faint">
                    {c.agent?.replace(/_/g, " ").toLowerCase()}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
            <Text variant="caption" tone="faint">
              For deeper chart analysis, explore the Kundli tab. For urgent personal or medical
              concerns, please seek a qualified professional.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }} keyboardVerticalOffset={0}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: palette.border }}>
          <Pressable
            onPress={() => {
              setAgent(null);
              setMessages([]);
              setConversationId(undefined);
            }}
            accessibilityRole="button"
            accessibilityLabel="Choose another guide"
            hitSlop={10}
            style={{ width: 32, height: 32, alignItems: "center", justifyContent: "center" }}
          >
            <ChevronLeft size={22} color={palette.text} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="label">{agent.title}</Text>
            <Text variant="micro" tone="faint">
              Vedic AI · your chart only
            </Text>
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
              <Card tone="gold" style={{ gap: spacing.sm }}>
                <Text variant="label">{agent.title}</Text>
                <Text variant="small" tone="muted">
                  {agent.blurb} Ask freely — I will stay anchored to your chart and explain my reasoning.
                </Text>
              </Card>
              <View style={{ gap: spacing.sm }}>
                <Text variant="micro" tone="faint">
                  SUGGESTED
                </Text>
                {(SUGGESTIONS[agent.key] ?? []).map((suggestion) => (
                  <Pressable
                    key={suggestion}
                    onPress={() => send(suggestion)}
                    accessibilityRole="button"
                    style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: palette.border }}
                  >
                    <Text variant="small" tone="muted">
                      {suggestion}
                    </Text>
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
                Reading your chart…
              </Text>
            </View>
          ) : null}
          {chat.isError ? (
            <Text variant="caption" tone="ruby">
              {errorMessage(chat.error)}
            </Text>
          ) : null}
        </ScrollView>

        <ChatComposer onSend={send} sending={chat.isPending} placeholder={`Ask ${agent.title}…`} />
        <View style={{ height: spacing.sm }} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
