import React from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { DashaAccordion, DashaTimeline } from "@/components/charts/DashaTimeline";
import { useHoroscope } from "@/hooks/useAstrology";
import type { DashaLord } from "@/api/types/models";
import { formatDashaBalance, formatDate } from "@/lib/format";
import { spacing } from "@/theme/tokens";

function lordLabel(lord: DashaLord | null | undefined) {
  if (!lord) return "—";
  if (typeof lord === "string") return lord;
  return lord.lord ?? lord.planet ?? "—";
}

export default function DashaScreen() {
  const kundli = useHoroscope(true);
  const dasha = kundli.payload?.dasha;
  const balance = dasha?.balanceAtBirth ? formatDashaBalance(dasha.balanceAtBirth) : null;

  return (
    <Screen title="Vimshottari dasha" subtitle="The planetary periods that shape your timeline" showBack>
      {kundli.isLoading ? (
        <LoadingState variant="detail" />
      ) : kundli.error && !dasha ? (
        <ErrorState error={kundli.error} onRetry={kundli.generate} />
      ) : !dasha ? (
        <EmptyState title="Dasha unavailable" body="Generate your kundli to build the dasha timeline." />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <Card style={{ gap: spacing.xs }}>
            <Text variant="micro" tone="faint">
              CURRENT MAHADASHA
            </Text>
            <Text variant="heading">{lordLabel(dasha.currentMaha)}</Text>
            <Text variant="caption" tone="muted">
              Antardasha · {lordLabel(dasha.currentAntar)}
            </Text>
            {balance ? (
              <Text variant="caption" tone="faint">
                Balance at birth: {balance}
              </Text>
            ) : null}
          </Card>

          <Card>
            <SectionHeader title="Periods" subtitle="Tap to expand antardashas" />
            {dasha.periods?.length ? <DashaAccordion periods={dasha.periods} /> : <Text variant="small" tone="muted">No periods available.</Text>}
          </Card>

          {dasha.periods?.length ? (
            <Card>
              <SectionHeader title="Antardasha sequence" subtitle="The current mahadasha in detail" />
              {(() => {
                const current = dasha.periods?.find((p) => {
                  const start = new Date(p.startDate ?? p.startsAt ?? 0).getTime();
                  const end = new Date(p.endDate ?? p.endsAt ?? 0).getTime();
                  return Date.now() >= start && Date.now() <= end;
                });
                const target = current ?? dasha.periods?.[0];
                if (!target) return null;
                return (
                  <>
                    <Text variant="caption" tone="muted" style={{ marginBottom: spacing.sm }}>
                      {target.lord ?? target.planet} · {formatDate(target.startDate ?? target.startsAt)} –{" "}
                      {formatDate(target.endDate ?? target.endsAt)}
                    </Text>
                    <DashaTimeline periods={target.subPeriods ?? []} />
                  </>
                );
              })()}
            </Card>
          ) : null}
        </View>
      )}
    </Screen>
  );
}
