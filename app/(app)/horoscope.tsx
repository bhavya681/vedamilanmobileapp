import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ErrorState, LoadingState, InlineNotice } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useGochar, useHoroscope } from "@/hooks/useAstrology";
import { DISCLAIMER } from "@/lib/constants";
import { titleCase } from "@/lib/format";
import { spacing } from "@/theme/tokens";

export default function HoroscopeScreen() {
  const router = useRouter();
  const kundli = useHoroscope(true);
  const gochar = useGochar();

  const busy = kundli.isLoading || gochar.isLoading;

  return (
    <Screen title="Daily sky" subtitle="Your chart, read against today's transits" showBack>
      {busy ? (
        <LoadingState variant="detail" />
      ) : kundli.error && !kundli.payload ? (
        <ErrorState error={kundli.error} onRetry={kundli.generate} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Natal anchors" subtitle="What today's sky is read against" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: spacing.md }}>
              {[
                ["Lagna", kundli.payload?.horoscope.lagnaSign],
                ["Moon", kundli.payload?.horoscope.moonSign],
                ["Sun", kundli.payload?.horoscope.sunSign],
                ["Dasha", kundli.payload?.dasha?.currentMaha ?? undefined],
              ].map(([label, value]) => (
                <View key={label} style={{ width: "50%" }}>
                  <Text variant="micro" tone="faint">
                    {label?.toUpperCase()}
                  </Text>
                  <Text variant="body">{value ? titleCase(String(value)) : "—"}</Text>
                </View>
              ))}
            </View>
          </Card>

          <Card>
            <SectionHeader title="Today's transits" subtitle={gochar.data?.timezoneNote} />
            {gochar.isError ? (
              <Text variant="small" tone="ruby">
                Transits are unavailable right now.
              </Text>
            ) : (
              <View style={{ gap: spacing.sm }}>
                {(gochar.data?.highlights ?? []).map((highlight) => (
                  <View key={highlight} style={{ flexDirection: "row", gap: spacing.sm }}>
                    <Text variant="small" tone="gold">
                      •
                    </Text>
                    <Text variant="small" tone="muted" style={{ flex: 1 }}>
                      {highlight}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <Button
              label="Open gochar"
              variant="secondary"
              size="sm"
              onPress={() => router.push("/(app)/gochar")}
              style={{ marginTop: spacing.md }}
            />
          </Card>

          <InlineNotice body={DISCLAIMER} />
        </View>
      )}
    </Screen>
  );
}
