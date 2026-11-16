import { usePathname, useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Compass, Home, MessageCircle, Orbit, User } from "lucide-react-native";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

const TABS = [
  { name: "index", label: "Home", icon: Home, href: "/(tabs)" as const },
  { name: "discover", label: "Matches", icon: Compass, href: "/(tabs)/discover" as const },
  { name: "kundli", label: "Kundli", icon: Orbit, href: "/(tabs)/kundli" as const },
  { name: "chats", label: "Chat", icon: MessageCircle, href: "/(tabs)/chats" as const },
  { name: "profile", label: "Profile", icon: User, href: "/(tabs)/profile" as const },
] as const;

export function AppTabBar() {
  const { palette } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();

  const active = (() => {
    if (pathname === "/" || pathname === "/index" || pathname.startsWith("/(tabs)") && !pathname.includes("/discover") && !pathname.includes("/kundli") && !pathname.includes("/chats") && !pathname.includes("/profile")) return "index";
    if (pathname.includes("/discover")) return "discover";
    if (pathname.includes("/kundli")) return "kundli";
    if (pathname.includes("/chats") || pathname.includes("/chat")) return "chats";
    if (pathname.includes("/profile")) return "profile";
    return "index";
  })();

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
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const focused = active === tab.name;
        return (
          <Pressable
            key={tab.name}
            onPress={() => {
              if (Platform.OS !== "web") void Haptics.selectionAsync().catch(() => undefined);
              router.navigate(tab.href);
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={tab.label}
            style={({ pressed }) => [styles.item, pressed && { opacity: 0.7 }]}
          >
            <View style={[styles.iconWrap, focused && { backgroundColor: palette.tabActive }]}>
              <Icon
                size={focused ? 21 : 20}
                color={focused ? palette.gold : palette.textFaint}
                strokeWidth={focused ? 2.2 : 1.7}
              />
            </View>
            <Text
              variant="micro"
              weight={focused ? "semibold" : "medium"}
              style={{ color: focused ? palette.gold : palette.textFaint, marginTop: 3, letterSpacing: 0.2 }}
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
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center", minHeight: 48, paddingVertical: 2 },
  iconWrap: { width: 40, height: 28, borderRadius: radii.pill, alignItems: "center", justifyContent: "center" },
});
