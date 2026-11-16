import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import * as Haptics from "expo-haptics";
import { Compass, Home, Heart, MessageCircle, User } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

const ICONS = {
  index: Home,
  kundli: Heart,
  discover: Compass,
  chats: MessageCircle,
  profile: User,
} as const;

const LABELS = {
  index: "Home",
  kundli: "Horoscope",
  discover: "Matches",
  chats: "Chat",
  profile: "Profile",
} as const;

type RouteName = keyof typeof ICONS;

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
        const name = route.name as RouteName;
        const Icon = ICONS[name] ?? Home;
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
            accessibilityLabel={LABELS[name] ?? name}
            style={styles.item}
          >
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Icon size={20} color={focused ? palette.gold : palette.textFaint} strokeWidth={focused ? 2.2 : 1.6} />
            </View>
            <Text
              variant="caption"
              weight={focused ? "semibold" : "medium"}
              style={{ color: focused ? palette.gold : palette.textFaint, marginTop: 4 }}
            >
              {LABELS[name] ?? name}
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
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    minHeight: 64,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    paddingVertical: spacing.xs,
  },
});
