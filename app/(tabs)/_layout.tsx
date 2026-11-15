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
        <Tabs.Screen name="discover" options={{ title: "Discover" }} />
        <Tabs.Screen name="kundli" options={{ title: "Kundli" }} />
        <Tabs.Screen name="ai" options={{ title: "AI Guide" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </AuthGate>
  );
}
