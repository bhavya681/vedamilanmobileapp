import React from "react";
import { StyleSheet, View } from "react-native";

import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import { formatDate } from "@/lib/format";
import type { DashaPeriod } from "@/api/types/models";

function withIndices(periods: DashaPeriod[], depth = 0): { period: DashaPeriod; depth: number; key: string }[] {
  const out: { period: DashaPeriod; depth: number; key: string }[] = [];
  periods.forEach((period, index) => {
    const key = `${depth}-${index}-${period.lord ?? period.planet ?? ""}`;
    out.push({ period, depth, key });
    if (period.subPeriods?.length && depth < 2) {
      out.push(...withIndices(period.subPeriods, depth + 1));
    }
  });
  return out;
}

function isCurrent(period: DashaPeriod): boolean {
  const start = period.startDate ?? period.startsAt;
  const end = period.endDate ?? period.endsAt;
  if (!start || !end) return false;
  const now = Date.now();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return Number.isFinite(s) && Number.isFinite(e) && now >= s && now <= e;
}

export function DashaTimeline({ periods }: { periods: DashaPeriod[] }) {
  const { palette } = useTheme();
  const flat = withIndices(periods).slice(0, 60);

  return (
    <View style={{ gap: 0 }}>
      {flat.map(({ period, depth, key }, index) => {
        const active = isCurrent(period);
        const lord = period.lord ?? period.planet ?? "Period";
        const start = period.startDate ?? period.startsAt;
        const end = period.endDate ?? period.endsAt;

        if (depth > 0) {
          return (
            <View
              key={key}
              style={{
                marginLeft: spacing.lg * depth,
                paddingVertical: spacing.xs,
                flexDirection: "row",
                justifyContent: "space-between",
                borderLeftWidth: 1,
                borderLeftColor: active ? palette.gold : palette.border,
                paddingLeft: spacing.md,
              }}
            >
              <Text variant="caption" tone={active ? "gold" : "muted"}>
                {lord}
              </Text>
              <Text variant="micro" tone="faint">
                {formatDate(start)} – {formatDate(end)}
              </Text>
            </View>
          );
        }

        return (
          <View
            key={key}
            style={[
              styles.row,
              {
                borderColor: palette.border,
                borderWidth: active ? 1 : 0,
                borderLeftColor: active ? palette.gold : "transparent",
                backgroundColor: active ? `${palette.goldSoft}0F` : "transparent",
                marginBottom: index === flat.length - 1 ? 0 : spacing.sm,
              },
            ]}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Text variant="label">{lord}</Text>
                {active ? <Badge label="Current" tone="gold" size="sm" /> : null}
              </View>
              <Text variant="micro" tone="faint">
                {formatDate(start)} – {formatDate(end)}
              </Text>
            </View>
            {period.subPeriods?.length ? (
              <Text variant="micro" tone="muted">
                {period.subPeriods.length} antardashas
              </Text>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

export function DashaAccordion({ periods }: { periods: DashaPeriod[] }) {
  const mahas = periods.slice(0, 9);
  return (
    <View style={{ gap: 0 }}>
      {mahas.map((maha, index) => (
        <Accordion
          key={`${maha.lord ?? maha.planet ?? index}`}
          title={String(maha.lord ?? maha.planet ?? "Period")}
          subtitle={`${formatDate(maha.startDate ?? maha.startsAt)} – ${formatDate(maha.endDate ?? maha.endsAt)}`}
          badge={isCurrent(maha) ? "CURRENT" : undefined}
          defaultOpen={isCurrent(maha)}
        >
          {(maha.subPeriods ?? []).map((antar, i) => (
            <View
              key={`${antar.lord ?? antar.planet ?? i}`}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 4,
                paddingLeft: spacing.md,
              }}
            >
              <Text variant="small" tone={isCurrent(antar) ? "gold" : "muted"}>
                {antar.lord ?? antar.planet ?? "—"}
              </Text>
              <Text variant="micro" tone="faint">
                {formatDate(antar.startDate ?? antar.startsAt)} – {formatDate(antar.endDate ?? antar.endsAt)}
              </Text>
            </View>
          ))}
        </Accordion>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
  },
});
