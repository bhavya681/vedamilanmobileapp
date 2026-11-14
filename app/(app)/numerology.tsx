import React from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { ReportView } from "@/components/ReportView";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useNumerology } from "@/hooks/useAstrology";
import { spacing } from "@/theme/tokens";

export default function NumerologyScreen() {
  const numerology = useNumerology(true);
  const { numberCards, hasDob, ...rest } = numerology.data ?? { hasDob: true };

  return (
    <Screen title="Numerology" subtitle="Numbers derived from your birth date">
      {numerology.isLoading ? (
        <LoadingState variant="detail" />
      ) : numerology.isError ? (
        <ErrorState error={numerology.error} onRetry={() => numerology.refetch()} />
      ) : !hasDob ? (
        <EmptyState title="Birth date needed" body="Add your date of birth to calculate your core numbers." />
      ) : (
        <View style={{ gap: spacing.lg }}>
          {numberCards?.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
              {numberCards.map((card) => (
                <Card key={`${card.number}`} style={{ width: "47.5%", alignItems: "center", gap: 3 }}>
                  <Text variant="display" tone="gold">
                    {card.number}
                  </Text>
                  <Text variant="label">{card.planet}</Text>
                  <Text variant="micro" tone="muted" align="center">
                    {card.keyword}
                  </Text>
                  <Text variant="caption" tone="faint" align="center">
                    {card.coreEnergy}
                  </Text>
                </Card>
              ))}
            </View>
          ) : null}
          {Object.keys(rest).length ? <ReportView data={rest} /> : null}
          <Text variant="caption" tone="faint">
            Numerology is offered as a complementary lens alongside your Vedic chart.
          </Text>
        </View>
      )}
    </Screen>
  );
}
