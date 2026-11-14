import React from "react";
import { View } from "react-native";

import { ReportView } from "@/components/ReportView";
import { InlineNotice } from "@/components/ui/ScreenState";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { DISCLAIMER } from "@/lib/constants";
import { spacing } from "@/theme/tokens";

export function ReportScreen({
  title,
  subtitle,
  query,
  disclaimer = DISCLAIMER,
}: {
  title: string;
  subtitle?: string;
  query: {
    data: unknown;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
    refetch: () => void;
  };
  disclaimer?: string;
}) {
  return (
    <Screen title={title} subtitle={subtitle}>
      {query.isLoading ? (
        <LoadingState variant="detail" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={query.refetch} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <ReportView data={query.data} />
          {disclaimer ? <InlineNotice body={disclaimer} /> : null}
          <Text variant="micro" tone="faint" align="center">
            Generated from your birth chart by the VedaMilan engine.
          </Text>
        </View>
      )}
    </Screen>
  );
}
