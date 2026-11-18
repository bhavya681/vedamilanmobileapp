import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ErrorState, InlineNotice, LoadingState } from "@/components/ui/ScreenState";
import { ReportView } from "@/components/ReportView";
import { Screen } from "@/components/ui/Screen";
import { useMarriageTiming } from "@/hooks/useAstrology";
import { DISCLAIMER } from "@/lib/constants";
import { spacing } from "@/theme/tokens";

export default function MarriageTimingScreen() {
  const router = useRouter();
  const query = useMarriageTiming(true);

  return (
    <Screen title="Marriage timing" subtitle="Windows indicated by your chart and dashas" showBack>
      {query.isLoading ? (
        <LoadingState variant="detail" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <ReportView data={query.data} />
          <InlineNotice body={DISCLAIMER} />
          <Button
            label="Discuss with Marriage Guru"
            variant="gold"
            onPress={() => router.push("/(app)/marriage-guru")}
          />
        </View>
      )}
    </Screen>
  );
}
