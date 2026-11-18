import { Paperclip, SendHorizontal } from "lucide-react-native";
import React, { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import * as Haptics from "expo-haptics";

import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

export function ChatComposer({
  onSend,
  sending,
  placeholder = "Type a message…",
  disabled,
  onChangeText,
  onAttach,
  attaching,
  disclaimer = "Guidance is reflective, not predictive certainty.",
}: {
  onSend: (message: string) => void;
  sending?: boolean;
  placeholder?: string;
  disabled?: boolean;
  onChangeText?: (text: string) => void;
  onAttach?: () => void;
  attaching?: boolean;
  disclaimer?: string | null;
}) {
  const { palette } = useTheme();
  const [text, setText] = useState("");
  const canSend = text.trim().length > 0 && !sending && !disabled;

  const send = () => {
    if (!canSend) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    onSend(text.trim());
    setText("");
  };

  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.sm }}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: palette.raised,
            borderColor: palette.border,
          },
        ]}
      >
        {onAttach ? (
          <Pressable
            onPress={onAttach}
            disabled={disabled || attaching}
            accessibilityRole="button"
            accessibilityLabel="Attach an image"
            accessibilityState={{ disabled: disabled || attaching }}
            hitSlop={6}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: palette.sunken,
            }}
          >
            <Paperclip size={17} color={palette.textMuted} />
          </Pressable>
        ) : null}
        <TextInput
          value={text}
          onChangeText={(next) => {
            setText(next);
            onChangeText?.(next);
          }}
          placeholder={placeholder}
          placeholderTextColor={palette.textFaint}
          multiline
          maxLength={4000}
          accessibilityLabel="Message"
          style={{
            flex: 1,
            color: palette.text,
            fontSize: 15,
            maxHeight: 120,
            paddingTop: 10,
            paddingBottom: 10,
          }}
        />
        <Pressable
          onPress={send}
          disabled={!canSend}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          accessibilityState={{ disabled: !canSend }}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: canSend ? palette.gold : palette.sunken,
          }}
        >
          {sending ? (
            <ActivityIndicator size="small" color={palette.textMuted} />
          ) : (
            <SendHorizontal size={17} color={canSend ? palette.onAccent : palette.textFaint} />
          )}
        </Pressable>
      </View>
      {disclaimer ? (
        <Text variant="micro" tone="faint" align="center" style={{ marginTop: 4 }}>
          {disclaimer}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    minHeight: 48,
  },
});
