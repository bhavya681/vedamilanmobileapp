import React, { useState } from "react";
import { ScrollView, View } from "react-native";

import { Chip } from "@/components/ui/Chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { ChartCard } from "@/components/charts/ChartCard";
import { useVedicExtras } from "@/hooks/useAstrology";
import { spacing } from "@/theme/tokens";

const BASE_CHARTS = [
  { key: "d1North", label: "D1 Rashi" },
  { key: "moon", label: "Moon" },
  { key: "sun", label: "Sun" },
  { key: "navamsa", label: "D9 Navamsa" },
] as const;

export default function ChartsScreen() {
  const extras = useVedicExtras(true);
  const [selected, setSelected] = useState<string>("d1North");

  return (
    <Screen title="Charts" subtitle="Whole-sign and divisional charts" showBack>
      {extras.isLoading ? (
        <LoadingState variant="detail" />
      ) : extras.isError ? (
        <ErrorState error={extras.error} onRetry={() => extras.refetch()} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
            {BASE_CHARTS.map((chart) => (
              <Chip
                key={chart.key}
                label={chart.label}
                selected={selected === chart.key}
                onPress={() => setSelected(chart.key)}
              />
            ))}
            {Object.keys(extras.data?.charts.vargas ?? {}).map((key) => (
              <Chip
                key={key}
                label={key.toUpperCase()}
                selected={selected === key}
                onPress={() => setSelected(key)}
              />
            ))}
          </ScrollView>

          {(() => {
            const charts = extras.data?.charts;
            const chart =
              selected === "d1North"
                ? charts?.d1North
                : selected === "moon"
                  ? charts?.moon
                  : selected === "sun"
                    ? charts?.sun
                    : selected === "navamsa"
                      ? charts?.navamsa
                      : charts?.vargas?.[selected];
            if (!chart) {
              return <EmptyState title="Chart unavailable" body="This divisional chart has not been calculated for your profile." />;
            }
            return <ChartCard chart={chart} title={BASE_CHARTS.find((c) => c.key === selected)?.label ?? `${selected.toUpperCase()} chart`} />;
          })()}

          {extras.data?.charts.catalog?.length ? (
            <View style={{ gap: spacing.sm }}>
              <Text variant="label" tone="muted">
                Available vargas
              </Text>
              <Text variant="caption" tone="faint">
                {extras.data.charts.catalog.map((c) => c.code.toUpperCase()).join(" · ")}
              </Text>
            </View>
          ) : null}

          <Text variant="caption" tone="faint">
            Charts use whole-sign houses and the ayanamsha saved in your birth details. Change it in
            Birth details to recalculate.
          </Text>
        </View>
      )}
    </Screen>
  );
}
