import React, { forwardRef, useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

import { useTheme } from "@/theme/ThemeProvider";
import { fontSize, radii, spacing } from "@/theme/tokens";
import { fontFamily } from "@/theme/typography";
import { Text } from "./Text";

type Props = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string | null;
  required?: boolean;
  rightAccessory?: React.ReactNode;
  containerStyle?: object;
};

export const Input = forwardRef<React.ComponentRef<typeof TextInput>, Props>(function Input(
  { label, hint, error, required, secureTextEntry, rightAccessory, containerStyle, style, ...rest },
  ref,
) {
  const { palette } = useTheme();
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = Boolean(secureTextEntry);

  return (
    <View style={[{ gap: spacing.xs + 2 }, containerStyle]}>
      {label ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
          <Text variant="label" tone="muted">
            {label}
          </Text>
          {required ? (
            <Text variant="label" tone="ruby">
              *
            </Text>
          ) : null}
        </View>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: palette.raised,
            borderColor: error ? palette.ruby : focused ? palette.gold : palette.border,
            borderWidth: focused || error ? 1.5 : 1,
          },
        ]}
      >
        <TextInput
          ref={ref}
          {...rest}
          secureTextEntry={isPassword && !revealed}
          placeholderTextColor={palette.textFaint}
          selectionColor={palette.gold}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            {
              flex: 1,
              color: palette.text,
              fontFamily: fontFamily.body,
              fontSize: fontSize.bodyLg,
              paddingVertical: spacing.md,
              minHeight: 52,
            },
            style,
          ]}
          accessibilityLabel={label ?? rest.placeholder}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? "Hide password" : "Show password"}
            hitSlop={10}
            style={styles.accessory}
          >
            {revealed ? (
              <EyeOff size={18} color={palette.textMuted} />
            ) : (
              <Eye size={18} color={palette.textMuted} />
            )}
          </Pressable>
        ) : (
          rightAccessory
        )}
      </View>
      {error ? (
        <Text variant="caption" tone="ruby" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  accessory: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
