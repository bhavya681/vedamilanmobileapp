import { useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";

import { aiApi } from "@/api/endpoints/ai";
import { ErrorState, LoadingState, InlineNotice } from "@/components/ui/ScreenState";
import { ReportView } from "@/components/ReportView";
import { Screen } from "@/components/ui/Screen";
import { DISCLAIMER } from "@/lib/constants";
import { spacing } from "@/theme/tokens";

export default function InsightsScreen() {
  const query = useQuery({ queryKey: ["ai", "insights"], queryFn: () => aiApi.insights() });

  return (
    <Screen title="Insights" subtitle="Personal readings generated from your chart" showBack>
      {query.isLoading ? (
        <LoadingState variant="detail" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <ReportView data={query.data} />
          <InlineNotice body={DISCLAIMER} />
        </View>
      )}
    </Screen>
  );
}
