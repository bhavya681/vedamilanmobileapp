import { Tabs } from "expo-router";
import React from "react";

import { AuthGate } from "@/components/auth/AuthGate";
import { TabBar } from "@/components/navigation/TabBar";
import { useTheme } from "@/theme/ThemeProvider";

export default function TabsLayout() {
  const { palette } = useTheme();
  return (
    <AuthGate>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{
          headerShown: false,
          animation: "fade",
          sceneStyle: { backgroundColor: palette.canvas },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="discover" options={{ title: "Matches" }} />
        <Tabs.Screen name="kundli" options={{ title: "Kundli" }} />
        <Tabs.Screen name="chats" options={{ title: "Chat" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
        <Tabs.Screen name="ai" options={{ href: null }} />
      </Tabs>
    </AuthGate>
  );
}
