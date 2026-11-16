import { useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, View } from "react-native";

import { chatApi } from "@/api/endpoints/chat";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { MessageBubble, type ChatBubbleMessage } from "@/components/chat/MessageBubble";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/feedback/ToastProvider";
import { useSession } from "@/providers/SessionProvider";
import { spacing } from "@/theme/tokens";

export default function ChatScreen() {
  const { id, other, name } = useLocalSearchParams<{ id?: string; other?: string; name?: string }>();
  const toast = useToast();
  const qc = useQueryClient();
  const { user } = useSession();
  const router = useRouter();
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [sending, setSending] = useState(false);

  const query = useQuery({
    queryKey: ["chat-messages", id],
    queryFn: () => chatApi.listMessages(id as string),
    enabled: Boolean(id),
    refetchInterval: 5_000,
  });

  const send = useMutation({
    mutationFn: (body: string) =>
      chatApi.sendMessage(id as string, { body, type: "TEXT", clientMessageId: `${Date.now()}` }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["chat-messages", id] });
      void qc.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  const messages = query.data?.messages ?? [];
  const bubbles: ChatBubbleMessage[] = messages
    .filter((message) => message.type !== "SYSTEM" || message.body)
    .map((message, index) => ({
      id: message.id ?? message._id ?? `${index}`,
      role: message.senderId === user?.user.id ? "user" : "assistant",
      content: message.body ?? (message.mediaUrl ? "[Attachment]" : ""),
      createdAt: message.createdAt,
    }));

  const handleSend = async (text: string) => {
    setSending(true);
    try {
      await send.mutateAsync(text);
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    } catch {
      toast.show("Message could not be sent. Try again.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen
      title={typeof name === "string" && name ? name : "Chat"}
      subtitle="Private conversation"
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
              <View style={{ paddingVertical: spacing.xxl, alignItems: "center", gap: 6 }}>
                <Text variant="body" tone="muted">
                  Start the conversation
                </Text>
                <Text variant="caption" tone="faint" align="center">
                  A thoughtful hello goes a long way.
                </Text>
              </View>
            ) : (
              bubbles.map((bubble) => <MessageBubble key={bubble.id} message={bubble} />)
            )}
          </ScrollView>
        )}
        <ChatComposer onSend={handleSend} sending={sending} disabled={!id} />
        {typeof other === "string" && other ? (
          <Text
            variant="micro"
            tone="faint"
            align="center"
            style={{ paddingVertical: 6 }}
            onPress={() => router.push(`/(app)/match/${other}`)}
          >
            View profile
          </Text>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}
