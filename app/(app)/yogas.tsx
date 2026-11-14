import React, { useState } from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { DoshaList, YogaList } from "@/components/charts/YogaList";
import { useVedicExtras } from "@/hooks/useAstrology";

const TABS = ["All", "Raja", "Doshas"] as const;

export default function YogasScreen() {
  const extras = useVedicExtras(true);
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const all = [
    ...(extras.data?.rajaYogas ?? []),
    ...(extras.data?.yogas ?? []),
    ...(extras.data?.otherYogas ?? []),
  ];
  const raja = extras.data?.rajaYogas ?? [];

  return (
    <Screen title="Yogas & doshas" subtitle="Planetary combinations in your chart">
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => (
          <Chip key={t} label={t} selected={tab === t} onPress={() => setTab(t)} />
        ))}
      </View>

      {extras.isLoading ? (
        <LoadingState variant="list" />
      ) : extras.isError ? (
        <ErrorState error={extras.error} onRetry={() => extras.refetch()} />
      ) : (
        <Card>
          {tab === "Doshas" ? (
            <DoshaList doshas={extras.data?.doshas ?? []} />
          ) : tab === "Raja" ? (
            <YogaList yogas={raja} emptyLabel="No raja yogas found" />
          ) : (
            <YogaList yogas={all} emptyLabel="No prominent yogas found" />
          )}
        </Card>
      )}
    </Screen>
  );
}
