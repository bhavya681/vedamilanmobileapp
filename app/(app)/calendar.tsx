import React from "react";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { ReportView } from "@/components/ReportView";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useAstrologyModule } from "@/hooks/useAstrology";

export default function CalendarScreen() {
  const query = useAstrologyModule("calendar", true);

  return (
    <Screen title="Life calendar" subtitle="Significant periods ahead" showBack>
      {query.isLoading ? (
        <LoadingState variant="detail" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <ReportView data={query.data} />
      )}
      <Card>
        <Text variant="caption" tone="faint">
          Dates are dasha-based guidance windows, not fixed events. Use them for reflection and
          planning, alongside your own judgement.
        </Text>
      </Card>
    </Screen>
  );
}
