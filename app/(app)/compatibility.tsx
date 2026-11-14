import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";

import { compatibilityApi } from "@/api/endpoints/compatibility";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState, InlineNotice } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { DISCLAIMER } from "@/lib/constants";
import { titleCase } from "@/lib/format";
import { spacing } from "@/theme/tokens";
import type { CompatibilityReport } from "@/api/types/models";

function ReportView({ report }: { report: CompatibilityReport }) {
  const score = Math.round(report.overallScore ?? report.percentage ?? 0);
  return (
    <View style={{ gap: spacing.lg }}>
      <Card style={{ alignItems: "center", gap: spacing.sm }}>
        <ScoreRing score={score} max={100} size={110} label="Compatibility" />
        <Text variant="title">{score}% compatible</Text>
        <Text variant="caption" tone="muted">
          {report.totalGuna ?? 0}/{report.maxGuna ?? 36} guna
        </Text>
        {report.decisionReason ? (
          <Text variant="small" tone="muted" align="center">
            {report.decisionReason}
          </Text>
        ) : null}
      </Card>

      {report.gunaBreakdown?.length ? (
        <Card style={{ gap: spacing.sm }}>
          <SectionHeader title="Ashtakoota breakdown" />
          {report.gunaBreakdown.map((item) => {
            const pct = Math.round((item.score / Math.max(1, item.max)) * 100);
            return (
              <View key={item.koota} style={{ gap: 3 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="small">{titleCase(item.koota)}</Text>
                  <Text variant="caption" tone="gold">
                    {item.score}/{item.max}
                  </Text>
                </View>
                <View style={{ height: 6, borderRadius: 3, backgroundColor: "rgba(120,120,120,0.2)" }}>
                  <View style={{ height: 6, width: `${pct}%`, borderRadius: 3, backgroundColor: "#D4AF37" }} />
                </View>
                {item.note ? (
                  <Text variant="micro" tone="faint">
                    {item.note}
                  </Text>
                ) : null}
              </View>
            );
          })}
        </Card>
      ) : null}

      {report.strengths?.length || report.challenges?.length ? (
        <Card style={{ gap: spacing.md }}>
          {report.strengths?.length ? (
            <View style={{ gap: 4 }}>
              <Text variant="label" tone="muted">
                STRENGTHS
              </Text>
              {report.strengths.map((item) => (
                <Text key={item} variant="small" tone="muted">
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
          {report.challenges?.length ? (
            <View style={{ gap: 4 }}>
              <Text variant="label" tone="muted">
                CHALLENGES
              </Text>
              {report.challenges.map((item) => (
                <Text key={item} variant="small" tone="muted">
                  • {item}
                </Text>
              ))}
            </View>
          ) : null}
        </Card>
      ) : null}

      {report.advice ? (
        <Card>
          <SectionHeader title="Guidance" />
          <Text variant="body" tone="muted">
            {Array.isArray(report.advice) ? report.advice.join("\n\n") : report.advice}
          </Text>
        </Card>
      ) : null}
    </View>
  );
}

export default function CompatibilityScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ candidateUserId?: string }>();
  const candidateId = params.candidateUserId;

  const compare = useQuery({
    queryKey: ["compatibility", candidateId],
    queryFn: () => compatibilityApi.compare(candidateId as string),
    enabled: Boolean(candidateId),
  });
  const reports = useQuery({
    queryKey: ["compatibility", "list"],
    queryFn: () => compatibilityApi.listReports(),
    enabled: !candidateId,
  });

  if (candidateId) {
    return (
      <Screen title="Compatibility" showBack>
        {compare.isLoading ? (
          <LoadingState variant="detail" />
        ) : compare.isError ? (
          <ErrorState error={compare.error} onRetry={() => compare.refetch()} />
        ) : !compare.data ? (
          <ErrorState error={new Error("Compatibility report unavailable")} onRetry={() => compare.refetch()} />
        ) : (
          <View style={{ gap: spacing.lg }}>
            <ReportView report={compare.data} />
            <InlineNotice body={DISCLAIMER} />
          </View>
        )}
      </Screen>
    );
  }

  const list = reports.data?.reports ?? [];
  return (
    <Screen title="Compatibility" subtitle="Reports you have generated" showBack>
      {reports.isLoading ? (
        <LoadingState variant="list" />
      ) : reports.isError ? (
        <ErrorState error={reports.error} onRetry={() => reports.refetch()} />
      ) : list.length === 0 ? (
        <View style={{ gap: spacing.lg }}>
          <EmptyState
            title="No compatibility reports yet"
            body="Open a match and generate a full compatibility report."
          />
          <Button label="Browse matches" variant="gold" onPress={() => router.push("/(tabs)/discover")} />
        </View>
      ) : (
        <View style={{ gap: spacing.md }}>
          {list.map((report, index) => (
            <Card
              key={report.id ?? report.candidateUserId ?? index}
              onPress={
                report.candidateUserId
                  ? () => router.push(`/(app)/match/${report.candidateUserId}`)
                  : undefined
              }
              style={{ gap: 4 }}
            >
              <Text variant="body">{titleCase(report.candidateUserId ?? "Match")}</Text>
              <Text variant="caption" tone="muted">
                {Math.round(report.overallScore ?? report.percentage ?? 0)}% · {report.totalGuna ?? 0}/
                {report.maxGuna ?? 36} guna
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
