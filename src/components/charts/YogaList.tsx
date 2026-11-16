import React from "react";
import { View } from "react-native";

import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/ScreenState";
import { Text } from "@/components/ui/Text";
import { spacing } from "@/theme/tokens";
import { titleCase } from "@/lib/format";
import type { DoshaItem, YogaInsightDetail, YogaItem } from "@/api/types/models";

function insightText(insight?: string | YogaInsightDetail) {
  if (!insight) return null;
  if (typeof insight === "string") return insight;
  return insight.meaning ?? insight.watchFor ?? insight.activationNow ?? insight.engineNote ?? null;
}

function doshaInsightText(insight: DoshaItem["insight"]): string | null {
  if (!insight) return null;
  if (typeof insight === "string") return insight;
  if (typeof insight === "object") {
    const record = insight as YogaInsightDetail & {
      statusLabel?: string;
      meaning?: string;
      watchFor?: string;
      activationNow?: string;
      engineNote?: string;
    };
    return (
      record.meaning ??
      record.watchFor ??
      record.activationNow ??
      record.statusLabel ??
      record.engineNote ??
      null
    );
  }
  return null;
}

export function YogaList({ yogas, emptyLabel }: { yogas: YogaItem[]; emptyLabel: string }) {
  if (!yogas.length) {
    return <EmptyState title={emptyLabel} body="This placement is not prominent in your chart." />;
  }
  return (
    <View>
      {yogas.map((yoga, index) => (
        <Accordion
          key={`${yoga.code}-${index}`}
          title={yoga.name}
          subtitle={yoga.category ? titleCase(yoga.category) : undefined}
          badge={typeof yoga.strength === "number" ? `Strength ${Math.round(yoga.strength)}` : undefined}
          defaultOpen={index === 0}
        >
          <Text variant="small" tone="muted">
            {yoga.description}
          </Text>
          {insightText(yoga.insight) ? (
            <Text variant="small" tone="gold">
              {insightText(yoga.insight)}
            </Text>
          ) : null}
        </Accordion>
      ))}
    </View>
  );
}

export function DoshaList({ doshas }: { doshas: DoshaItem[] }) {
  if (!doshas.length) {
    return <EmptyState title="No significant doshas found" body="Your chart does not show major dosha patterns." />;
  }
  return (
    <View style={{ gap: spacing.md }}>
      {doshas.map((dosha, index) => (
        <View key={`${dosha.code}-${index}`} style={{ gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Text variant="label">{dosha.name}</Text>
            <Badge
              label={dosha.present ? (dosha.severity ? titleCase(dosha.severity) : "Present") : "Not present"}
              tone={dosha.present ? "ruby" : "emerald"}
              size="sm"
            />
          </View>
          {dosha.notes ? (
            <Text variant="small" tone="muted">
              {dosha.notes}
            </Text>
          ) : null}
          {doshaInsightText(dosha.insight) ? (
            <Text variant="caption" tone="gold">
              {doshaInsightText(dosha.insight)}
            </Text>
          ) : null}
        </View>
      ))}
    </View>
  );
}
