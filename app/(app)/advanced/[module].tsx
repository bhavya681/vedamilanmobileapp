import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

import { EmptyState, ErrorState, InlineNotice, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { ReportView } from "@/components/ReportView";
import { useAstrologyModule, type AstrologyModule } from "@/hooks/useAstrology";
import { DISCLAIMER } from "@/lib/constants";
import { titleCase } from "@/lib/format";
import { spacing } from "@/theme/tokens";

const MODULES: Record<string, { title: string; subtitle?: string }> = {
  shadbala: { title: "Shadbala", subtitle: "Planetary strength" },
  jaimini: { title: "Jaimini", subtitle: "Chara karakas and arudhas" },
  bnn: { title: "Bhrigu Nandi Nadi", subtitle: "Nadi promise reading" },
  "marriage-intelligence": { title: "Marriage intelligence" },
  "spiritual-journey": { title: "Spiritual journey" },
  "past-life-deeds": { title: "Past-life deeds" },
  "marriage-precautions": { title: "Marriage precautions" },
  calendar: { title: "Life calendar" },
};

export default function AdvancedModuleScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ module?: string }>();
  const key = params.module ?? "";
  const meta = MODULES[key];
  const valid = Boolean(meta) && ["shadbala", "jaimini", "bnn", "marriage-intelligence", "spiritual-journey", "past-life-deeds", "marriage-precautions", "calendar"].includes(key);
  const query = useAstrologyModule(key as AstrologyModule, valid);

  if (!valid || !meta) {
    return (
      <Screen title="Advanced report" showBack>
        <EmptyState
          title="Report not found"
          body="Choose a report from the advanced reports list."
          actionLabel="Browse advanced reports"
          onAction={() => router.replace("/(app)/advanced")}
        />
      </Screen>
    );
  }

  return (
    <Screen title={meta.title} subtitle={meta.subtitle ?? titleCase(key.replace(/-/g, " "))} showBack>
      {query.isLoading ? (
        <LoadingState variant="detail" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <ReportView data={query.data} />
          <InlineNotice body={DISCLAIMER} />
        </View>
      )}
    </Screen>
  );
}
