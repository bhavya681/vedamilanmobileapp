import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppearanceSync } from "@/components/appearance/AppearanceSync";
import { ToastProvider } from "@/components/feedback/ToastProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { queryClient } from "./queryClient";
import { SessionProvider } from "./SessionProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <SessionProvider>
              <AppearanceSync />
              <ToastProvider>{children}</ToastProvider>
            </SessionProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
