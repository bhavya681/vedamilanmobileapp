import { Tabs } from "expo-router";
import React from "react";

import { AuthGate } from "@/components/auth/AuthGate";
import { TabBar } from "@/components/navigation/TabBar";

export default function TabsLayout() {
  return (
    <AuthGate>
      <Tabs
        tabBar={(props) => <TabBar {...props} />}
        screenOptions={{ headerShown: false, animation: "fade" }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="kundli" options={{ title: "Horoscope" }} />
        <Tabs.Screen name="discover" options={{ title: "Matches" }} />
        <Tabs.Screen name="chats" options={{ title: "Chat" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </AuthGate>
  );
}
