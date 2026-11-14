import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";

import { aiApi } from "@/api/endpoints/ai";
import { Button } from "@/components/ui/Button";
import { ErrorState, LoadingState, InlineNotice } from "@/components/ui/ScreenState";
import { ReportView } from "@/components/ReportView";
import { Screen } from "@/components/ui/Screen";
import { DISCLAIMER } from "@/lib/constants";
import { spacing } from "@/theme/tokens";

export default function MarriageGuruScreen() {
  const router = useRouter();
  const query = useQuery({ queryKey: ["ai", "marriage-guru"], queryFn: () => aiApi.marriageGuru() });

  return (
    <Screen title="Marriage Guru" subtitle="Readiness, partner fit, and timing" showBack>
      {query.isLoading ? (
        <LoadingState variant="detail" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <ReportView data={query.data} />
          <Button
            label="Ask the Marriage Guru"
            variant="gold"
            onPress={() => router.push({ pathname: "/(tabs)/ai", params: { agent: "MARRIAGE_GURU" } })}
          />
          <InlineNotice body={DISCLAIMER} />
        </View>
      )}
    </Screen>
  );
}
