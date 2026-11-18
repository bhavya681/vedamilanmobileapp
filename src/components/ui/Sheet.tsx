import { X } from "lucide-react-native";
import React from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { Text } from "./Text";

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  dismissable = true,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  dismissable?: boolean;
}) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: palette.overlay }]}
          onPress={dismissable ? onClose : undefined}
          accessibilityLabel={dismissable ? "Close" : undefined}
          accessibilityRole={dismissable ? "button" : undefined}
        />
        <View
          style={{
            backgroundColor: palette.canvas,
            borderTopLeftRadius: radii.xxl,
            borderTopRightRadius: radii.xxl,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.md,
            paddingBottom: Math.max(insets.bottom, spacing.xl),
            maxHeight: "88%",
          }}
        >
          <View
            style={{
              alignSelf: "center",
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: palette.borderStrong,
              marginBottom: spacing.lg,
            }}
          />
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.lg }}>
            <View style={{ flex: 1 }}>
              {title ? <Text variant="title">{title}</Text> : null}
            </View>
            {dismissable ? (
              <Pressable
                onPress={onClose}
                accessibilityRole="button"
                accessibilityLabel="Close sheet"
                hitSlop={10}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: radii.pill,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: palette.raised,
                  borderWidth: 1,
                  borderColor: palette.border,
                }}
              >
                <X size={18} color={palette.textMuted} />
              </Pressable>
            ) : null}
          </View>
          {children}
        </View>
      </View>
    </Modal>
  );
}
