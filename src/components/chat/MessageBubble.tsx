import React from "react";
import { View } from "react-native";

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
      <Text variant="micro" tone="faint" align="center" style={{ paddingHorizontal: spacing.xl }}>
        {message.content}
      </Text>
    );
  }

  return (
    <View style={{ alignItems: isUser ? "flex-end" : "flex-start", marginBottom: spacing.md }}>
      <View
        style={{
          maxWidth: "86%",
          backgroundColor: isUser ? palette.temple : palette.raised,
          borderColor: isUser ? "transparent" : palette.border,
          borderWidth: isUser ? 0 : 1,
          borderRadius: radii.xl,
          borderBottomRightRadius: isUser ? 4 : radii.xl,
          borderBottomLeftRadius: isUser ? radii.xl : 4,
          paddingHorizontal: spacing.md,
          paddingVertical: spacing.sm + 2,
          gap: 4,
        }}
      >
        <Text
          variant="small"
          style={{ color: isUser ? palette.onAccent : palette.text, lineHeight: 21 }}
          selectable
        >
          {message.content}
        </Text>
      </View>
      {!isUser && disclaimer && message.role === "assistant" ? (
        <Text variant="micro" tone="faint" style={{ maxWidth: "86%", marginTop: 4 }}>
          Vedic guidance · not a prediction
        </Text>
      ) : message.createdAt ? (
        <Text variant="micro" tone="faint" style={{ marginTop: 3 }}>
          {timeAgo(message.createdAt)}
        </Text>
      ) : null}
    </View>
  );
}
