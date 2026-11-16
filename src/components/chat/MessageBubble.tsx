import React from "react";
import { View } from "react-native";

import { MarkdownText } from "@/components/chat/MarkdownText";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { timeAgo } from "@/lib/format";

export type ChatBubbleMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

export function MessageBubble({ message, disclaimer }: { message: ChatBubbleMessage; disclaimer?: string }) {
  const { palette } = useTheme();
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <Text variant="micro" tone="faint" align="center" style={{ paddingHorizontal: spacing.xl, marginVertical: spacing.xs }}>
        {message.content}
      </Text>
    );
  }

  const textColor = isUser ? palette.onAccent : palette.text;

  return (
    <View style={{ alignItems: isUser ? "flex-end" : "flex-start", marginBottom: spacing.md }}>
      {!isUser ? (
        <Text variant="micro" tone="gold" style={{ marginBottom: 4, marginLeft: 4, letterSpacing: 0.8 }}>
          AI GURU
        </Text>
      ) : null}
      <View
        style={{
          maxWidth: "88%",
          backgroundColor: isUser ? palette.temple : palette.raised,
          borderColor: isUser ? "transparent" : palette.border,
          borderWidth: isUser ? 0 : 1,
          borderRadius: radii.xl,
          borderBottomRightRadius: isUser ? 6 : radii.xl,
          borderBottomLeftRadius: isUser ? radii.xl : 6,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 4,
        }}
      >
        {isUser ? (
          <Text variant="small" style={{ color: textColor, lineHeight: 22 }} selectable>
            {message.content}
          </Text>
        ) : (
          <MarkdownText content={message.content} color={textColor} />
        )}
      </View>
      {!isUser && disclaimer && message.role === "assistant" ? (
        <Text variant="micro" tone="faint" style={{ maxWidth: "88%", marginTop: 4, marginLeft: 4 }}>
          Vedic guidance · reflective, not a prediction
        </Text>
      ) : message.createdAt ? (
        <Text variant="micro" tone="faint" style={{ marginTop: 3 }}>
          {timeAgo(message.createdAt)}
        </Text>
      ) : null}
    </View>
  );
}
