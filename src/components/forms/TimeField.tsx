import DateTimePicker, { type DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Clock } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { format } from "date-fns";

import { BottomSheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

type Props = {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  error?: string | null;
  hint?: string;
  required?: boolean;
};

export function TimeField({ label, value, onChange, error, hint, required }: Props) {
  const { palette, scheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Date>(value ?? new Date(2000, 0, 1, 12, 0));

  const handleEvent = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setOpen(false);
      if (event.type === "set" && date) onChange(date);
      return;
    }
    if (date) setDraft(date);
  };

  return (
    <View style={{ gap: spacing.xs + 2 }}>
      <View style={{ flexDirection: "row", gap: 2 }}>
        <Text variant="label" tone="muted">
          {label}
        </Text>
        {required ? (
          <Text variant="label" tone="ruby">
            *
          </Text>
        ) : null}
      </View>
      <Pressable
        onPress={() => {
          setDraft(value ?? new Date(2000, 0, 1, 12, 0));
          setOpen(true);
        }}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${value ? format(value, "h:mm a") : "not set"}`}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: 48,
          paddingHorizontal: spacing.md,
          borderRadius: 12,
          borderWidth: error ? 1.5 : 1,
          borderColor: error ? palette.ruby : palette.border,
          backgroundColor: palette.raised,
        }}
      >
        <Text variant="bodyLg" tone={value ? "default" : "faint"}>
          {value ? format(value, "h:mm a") : "Select time"}
        </Text>
        <Clock size={18} color={palette.textMuted} />
      </Pressable>
      {error ? (
        <Text variant="caption" tone="ruby">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption" tone="faint">
          {hint}
        </Text>
      ) : null}

      {open && Platform.OS === "android" ? (
        <DateTimePicker value={draft} mode="time" display="default" is24Hour={false} onChange={handleEvent} />
      ) : null}

      {Platform.OS === "ios" ? (
        <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
          <DateTimePicker
            value={draft}
            mode="time"
            display="spinner"
            themeVariant={scheme}
            onChange={handleEvent}
            style={{ alignSelf: "center" }}
          />
          <Button
            label="Done"
            variant="primary"
            fullWidth
            onPress={() => {
              onChange(draft);
              setOpen(false);
            }}
            style={{ marginTop: spacing.md }}
          />
        </BottomSheet>
      ) : null}
    </View>
  );
}
