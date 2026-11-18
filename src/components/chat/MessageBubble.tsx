import { Image } from "expo-image";
import { Check, Copy } from "lucide-react-native";
import React from "react";
import { Pressable, View } from "react-native";

import { MarkdownText } from "@/components/chat/MarkdownText";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { timeAgo } from "@/lib/format";

export type ChatBubbleMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: string;
  translated?: string;
  mediaUrl?: string | null;
  mediaType?: "IMAGE" | "VOICE";
  sources?: string[];
};

export function MessageBubble({
  message,
  disclaimer,
  assistantLabel = "AI GURU",
  onLongPress,
  onCopy,
  copied,
}: {
  message: ChatBubbleMessage;
  disclaimer?: string;
  assistantLabel?: string;
  onLongPress?: () => void;
  onCopy?: () => void;
  copied?: boolean;
}) {
  const { palette } = useTheme();
  const isUser = message.role === "user";
  const textColor = isUser ? palette.inverseSurface : palette.text;

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
      {!isUser && message.sources?.length ? (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
          {message.sources.map((source) => (
            <View
              key={source}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: radii.pill,
                backgroundColor: palette.raised,
                borderWidth: 1,
                borderColor: palette.border,
              }}
            >
              <Text variant="micro" tone="faint">
                {source}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
      {!isUser && onCopy ? (
        <Pressable
          onPress={onCopy}
          accessibilityRole="button"
          accessibilityLabel={copied ? "Response copied" : "Copy response"}
          hitSlop={6}
          style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2, marginLeft: 4 }}
        >
          {copied ? <Check size={12} color={palette.gold} /> : <Copy size={12} color={palette.textMuted} />}
          <Text variant="micro" tone={copied ? "gold" : "faint"}>
            {copied ? "Copied" : "Copy"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
