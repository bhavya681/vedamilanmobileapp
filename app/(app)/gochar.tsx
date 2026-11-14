import React from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState, InlineNotice } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { ChartCard } from "@/components/charts/ChartCard";
import { PlanetTable } from "@/components/charts/PlanetTable";
import { useGochar } from "@/hooks/useAstrology";
import { formatDateTime, titleCase } from "@/lib/format";
import { spacing } from "@/theme/tokens";

export default function GocharScreen() {
  const gochar = useGochar();

  return (
    <Screen title="Gochar" subtitle="Current planetary transits over your chart">
      {gochar.isLoading ? (
        <LoadingState variant="detail" />
      ) : gochar.isError ? (
        <ErrorState error={gochar.error} onRetry={() => gochar.refetch()} />
      ) : !gochar.data ? (
        <EmptyState title="No transit data" body="Generate your kundli first to read transits." />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <Card style={{ gap: spacing.md }}>
            <Text variant="micro" tone="faint">
              AS OF {formatDateTime(gochar.data.asOf)} · {gochar.data.timezoneNote}
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.lg }}>
              <View style={{ flex: 1 }}>
                <Text variant="micro" tone="faint">
                  TRANSIT ASCENDANT
                </Text>
                <Text variant="title">{titleCase(gochar.data.transitAscendant ?? "—")}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="micro" tone="faint">
                  NATAL LAGNA
                </Text>
                <Text variant="title">{titleCase(gochar.data.natalLagna ?? "—")}</Text>
              </View>
            </View>
          </Card>

          {(gochar.data.highlights ?? []).length ? (
            <Card>
              <SectionHeader title="Transit highlights" subtitle="Read from your natal Lagna" />
              <View style={{ gap: spacing.sm }}>
                {(gochar.data.highlights ?? []).map((highlight) => (
                  <View key={highlight} style={{ flexDirection: "row", gap: spacing.sm }}>
                    <Text variant="small" tone="gold">
                      •
                    </Text>
                    <Text variant="small" tone="muted" style={{ flex: 1 }}>
                      {highlight}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          ) : null}

          {gochar.data.chartNorth ? (
            <ChartCard chart={gochar.data.chartNorth} title="Transit chart" caption="Current sky · whole sign" />
          ) : null}

          {gochar.data.planets?.length ? (
            <Card>
              <SectionHeader title="Transit positions" subtitle="Sidereal" />
              <PlanetTable
                planets={gochar.data.planets.map((planet) => ({
                  planet: planet.planet,
                  abbr: planet.planet.slice(0, 2),
                  label: planet.planet,
                  degree: planet.degree !== undefined ? `${planet.degree.toFixed(1)}°` : "—",
                  degreeValue: planet.degree ?? 0,
                  dignity: planet.dignity,
                  isRetrograde: planet.isRetrograde,
                  house: planet.house,
                }))}
              />
            </Card>
          ) : null}

          <InlineNotice
            body="Transits describe the current sky relative to your birth chart. They are a lens for reflection, not an instruction to act."
          />
        </View>
      )}
    </Screen>
  );
}
