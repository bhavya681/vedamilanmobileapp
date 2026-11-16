import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import * as Haptics from "expo-haptics";
import { Compass, Home, MessageCircle, Orbit, User } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

const TABS = [
  { name: "index", label: "Home", icon: Home },
  { name: "discover", label: "Matches", icon: Compass },
  { name: "kundli", label: "Kundli", icon: Orbit },
  { name: "chats", label: "Chat", icon: MessageCircle },
  { name: "profile", label: "Profile", icon: User },
] as const;

const VISIBLE = new Map(TABS.map((tab) => [tab.name, tab]));

export function TabBar({ state, emitter, navigateToTab }: BottomTabBarProps) {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: palette.tabBar,
          borderTopColor: palette.tabBorder,
          paddingBottom: Math.max(insets.bottom, spacing.sm),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = VISIBLE.get(route.name as (typeof TABS)[number]["name"]);
        if (!tab) return null;
        const Icon = tab.icon;
        const focused = state.index === index;

        return (
          <Pressable
            key={route.key}
            onPress={() => {
              if (Platform.OS !== "web") {
                void Haptics.selectionAsync().catch(() => undefined);
              }
              const event = emitter.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) navigateToTab(route.key);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
          >
            <View
              style={[
                styles.iconWrap,
                focused && { backgroundColor: palette.tabActive },
              ]}
            >
              <Icon
                size={focused ? 21 : 20}
                color={focused ? palette.gold : palette.textFaint}
                strokeWidth={focused ? 2.2 : 1.7}
              />
            </View>
            <Text
              variant="micro"
              weight={focused ? "semibold" : "medium"}
              style={{
                color: focused ? palette.gold : palette.textFaint,
                marginTop: 3,
                letterSpacing: 0.2,
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
    minHeight: 64,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: 2,
  },
  iconWrap: {
    width: 40,
    height: 28,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center",
  },
});
