import { Image } from "expo-image";
import React from "react";
import { Pressable, View } from "react-native";

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
  translated?: string;
  mediaUrl?: string;
};

export function MessageBubble({
  message,
  disclaimer,
  assistantLabel = "AI GURU",
  onLongPress,
}: {
  message: ChatBubbleMessage;
  disclaimer?: string;
  assistantLabel?: string;
  onLongPress?: () => void;
}) {
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

  const bubble = (
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
      {message.mediaUrl ? (
        <Image
          source={message.mediaUrl}
          style={{
            width: 240,
            height: 180,
            borderRadius: radii.lg,
            marginBottom: message.content ? spacing.sm : 0,
            backgroundColor: palette.sunken,
          }}
          contentFit="cover"
          accessibilityLabel="Shared image"
        />
      ) : null}
      {message.content ? (
        isUser ? (
          <Text variant="small" style={{ color: textColor, lineHeight: 22 }} selectable>
            {message.content}
          </Text>
        ) : (
          <MarkdownText content={message.content} color={textColor} />
        )
      ) : null}
      {message.translated ? (
        <View style={{ marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: `${textColor}33` }}>
          <Text variant="micro" style={{ color: textColor, opacity: 0.7, letterSpacing: 0.8 }}>
            TRANSLATED
          </Text>
          <Text variant="small" style={{ color: textColor, lineHeight: 21, opacity: 0.92 }} selectable>
            {message.translated}
          </Text>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={{ alignItems: isUser ? "flex-end" : "flex-start", marginBottom: spacing.md }}>
      {!isUser ? (
        <Text variant="micro" tone="gold" style={{ marginBottom: 4, marginLeft: 4, letterSpacing: 0.8 }}>
          {assistantLabel}
        </Text>
      ) : null}
      {onLongPress ? (
        <Pressable onLongPress={onLongPress} accessibilityRole="button" accessibilityHint="Long press for message actions">
          {bubble}
        </Pressable>
      ) : (
        bubble
      )}
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
