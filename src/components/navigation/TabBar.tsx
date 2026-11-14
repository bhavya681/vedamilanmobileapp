import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import * as Haptics from "expo-haptics";
import { Compass, Heart, Home, Sparkles, User } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

const ICONS = {
  index: Home,
  discover: Compass,
  kundli: Heart,
  ai: Sparkles,
  profile: User,
} as const;

const LABELS = {
  index: "Home",
  discover: "Discover",
  kundli: "Kundli",
  ai: "Guide",
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
        const isCenter = name === "ai";

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
            {isCenter ? (
              <View
                style={[
                  styles.center,
                  {
                    backgroundColor: focused ? palette.gold : palette.temple,
                    shadowColor: palette.gold,
                  },
                ]}
              >
                <Icon size={20} color={focused ? palette.onAccent : palette.inverse} />
              </View>
            ) : (
              <Icon size={21} color={focused ? palette.gold : palette.textFaint} strokeWidth={focused ? 2.4 : 1.8} />
            )}
            <Text
              variant="micro"
              weight={focused ? "semibold" : "medium"}
              style={{ color: focused ? palette.gold : palette.textFaint, marginTop: 3 }}
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
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  center: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -18,
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
