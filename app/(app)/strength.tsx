import React, { useState } from "react";
import { View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { ReportView } from "@/components/ReportView";
import { Screen } from "@/components/ui/Screen";
import { InlineNotice } from "@/components/ui/ScreenState";
import { useAstrologyModule } from "@/hooks/useAstrology";
import { DISCLAIMER } from "@/lib/constants";

const TABS = [
  { key: "shadbala", label: "Shadbala" },
  { key: "planet-strength", label: "Planet strength" },
] as const;

export default function StrengthScreen() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("shadbala");
  const query = useAstrologyModule(tab);

  return (
    <Screen title="Planetary strength" subtitle="Shadbala and graha bala from your chart">
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => (
          <Chip key={t.key} label={t.label} selected={tab === t.key} onPress={() => setTab(t.key)} />
        ))}
      </View>
      {query.isLoading ? (
        <LoadingState variant="detail" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <View style={{ gap: 16 }}>
          <ReportView data={query.data} />
          <InlineNotice body={DISCLAIMER} />
        </View>
      )}
    </Screen>
  );
}
