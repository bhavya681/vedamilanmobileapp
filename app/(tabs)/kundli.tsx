import { useRouter } from "expo-router";
import { ArrowUpRight, Calendar, Clock, MapPin } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { EmptyState, ErrorState, LoadingState, InlineNotice } from "@/components/ui/ScreenState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { ChartCard } from "@/components/charts/ChartCard";
import { DashaAccordion } from "@/components/charts/DashaTimeline";
import { DoshaList, YogaList } from "@/components/charts/YogaList";
import { PlanetTable } from "@/components/charts/PlanetTable";
import { chartPlanets } from "@/components/charts/types";
import { useHoroscope, useVedicExtras } from "@/hooks/useAstrology";
import { useProfileBundle } from "@/hooks/useProfile";
import { useTheme } from "@/theme/ThemeProvider";
import { DISCLAIMER, HOUSE_THEMES, SIGNS } from "@/lib/constants";
import { formatDate, formatDashaBalance, formatTimeOfDay, titleCase } from "@/lib/format";
import { spacing } from "@/theme/tokens";

const SECTIONS = ["Chart", "Dashas", "Yogas", "Doshas", "Vargas"] as const;
type Section = (typeof SECTIONS)[number];

function lordLabel(lord: { lord?: string; planet?: string } | string | null | undefined) {
  if (!lord) return "—";
  if (typeof lord === "string") return lord;
  return lord.lord ?? lord.planet ?? "—";
}

export default function KundliScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const [section, setSection] = useState<Section>("Chart");
  const [varga, setVarga] = useState<string | null>(null);
  const bundle = useProfileBundle();
  const kundli = useHoroscope(true);
  const extras = useVedicExtras(Boolean(kundli.payload));
  const payload = kundli.payload;
  const horoscope = payload?.horoscope;
  const chart = horoscope?.chartNorth;

  if (!bundle.data?.birthDetails) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top"]}>
        <View style={{ padding: spacing.xl }}>
          <Text variant="display">Your kundli</Text>
          <EmptyState
            title="Birth details needed"
            body="Add your date, time and place of birth to cast your Vedic chart."
            actionLabel="Add birth details"
            onAction={() => router.push("/(app)/birth-details")}
          />
        </View>
      </SafeAreaView>
    );
  }

  const birth = bundle.data.birthDetails;
  const birthDateValue = birth.birthDate?.includes("T") ? birth.birthDate.split("T")[0] : birth.birthDate;
  const birthDateLabel = formatDate(birthDateValue, "d MMMM yyyy");
  const birthTimeLabel = birth.birthTimeUnknown ? "Time unknown" : formatTimeOfDay(birth.birthTime);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.giant }}>
        <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm, gap: spacing.md }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View style={{ flex: 1 }}>
              <Text variant="micro" tone="gold" style={{ letterSpacing: 1.6 }}>
                YOUR KUNDLI
              </Text>
              <Text variant="display" style={{ marginTop: 2 }}>Birth chart</Text>
            </View>
            <Pressable
              onPress={() => router.push("/(app)/birth-details")}
              accessibilityRole="button"
              accessibilityLabel="Edit birth details"
              style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 4 }}
            >
              <Text variant="caption" tone="gold">
                Edit
              </Text>
              <ArrowUpRight size={14} color={palette.gold} />
            </Pressable>
          </View>

          <Card tone="outlined" style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: spacing.sm }}>
              <MapPin size={16} color={palette.gold} style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text variant="micro" tone="faint">BIRTH PLACE</Text>
                <Text variant="body" weight="semibold">{birth.placeName || "—"}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: spacing.lg, flexWrap: "wrap" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Calendar size={15} color={palette.textMuted} />
                <View>
                  <Text variant="micro" tone="faint">DATE</Text>
                  <Text variant="small" weight="semibold">{birthDateLabel}</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Clock size={15} color={palette.textMuted} />
                <View>
                  <Text variant="micro" tone="faint">TIME</Text>
                  <Text variant="small" weight="semibold">{birthTimeLabel}</Text>
                </View>
              </View>
            </View>
          </Card>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm, paddingVertical: spacing.lg }}>
            {SECTIONS.map((s) => (
              <Chip key={s} label={s} selected={section === s} onPress={() => setSection(s)} />
            ))}
          </ScrollView>
        </View>

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
          {kundli.isLoading || !payload ? (
            kundli.error ? (
              <ErrorState error={kundli.error} onRetry={kundli.generate} title="Chart unavailable" />
            ) : (
              <LoadingState variant="detail" />
            )
          ) : (
            <>
              {section === "Chart" ? (
                <>
                  <Card style={{ gap: spacing.md }}>
                    <View style={{ flexDirection: "row", flexWrap: "wrap", rowGap: spacing.md }}>
                      {[
                        ["Lagna", horoscope?.lagnaSign],
                        ["Moon", horoscope?.moonSign],
                        ["Sun", horoscope?.sunSign],
                        ["Nakshatra", horoscope?.lagnaNakshatra],
                        ["Manglik", horoscope?.manglikStatus ? titleCase(horoscope.manglikStatus) : undefined],
                        ["Dasha", payload.dasha?.currentMaha ?? undefined],
                      ].map(([label, value]) => (
                        <View key={label} style={{ width: "33%" }}>
                          <Text variant="micro" tone="faint">
                            {label?.toUpperCase()}
                          </Text>
                          <Text variant="small" numberOfLines={2}>
                            {value ? titleCase(String(value)) : "—"}
                          </Text>
                        </View>
                      ))}
                    </View>
                    {payload.manglikNote ? (
                      <InlineNotice body={payload.manglikNote} />
                    ) : null}
                  </Card>

                  {chart ? (
                    <ChartCard
                      chart={chart}
                      title="Rashi chart · D1"
                      caption={payload.meta?.ayanamsha ? `${String(payload.meta.ayanamsha)} ayanamsha` : undefined}
                    />
                  ) : null}

                  <Card>
                    <SectionHeader title="Planetary positions" subtitle="Sidereal longitudes" />
                    <PlanetTable planets={chartPlanets(chart ?? { style: "NORTH", lagnaSignId: 0, lagnaDegree: 0, lagnaLabel: "", houses: {} })} />
                  </Card>

                  <Card>
                    <SectionHeader title="House themes" subtitle="Where each bhava directs your attention" />
                    <View style={{ gap: spacing.sm }}>
                      {(chart && "houses" in chart ? Object.keys(chart.houses) : Array.from({ length: 12 }, (_, i) => String(i + 1))).map((house) => {
                        const no = Number(house);
                        const lagnaSignId = chart && "lagnaSignId" in chart ? chart.lagnaSignId : 0;
                        const signIndex = (lagnaSignId + no - 1) % 12;
                        return (
                          <View key={house} style={styles.houseRow}>
                            <Text variant="caption" tone="gold" style={{ width: 26 }}>
                              {no}
                            </Text>
                            <View style={{ flex: 1 }}>
                              <Text variant="small">
                                House {no} · {SIGNS[signIndex] ?? "—"}
                              </Text>
                              <Text variant="micro" tone="faint">
                                {HOUSE_THEMES[no] ?? ""}
                              </Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  </Card>

                  <View style={{ flexDirection: "row", gap: spacing.md }}>
                    <Button label="Yogas" variant="secondary" fullWidth onPress={() => setSection("Yogas")} style={{ flex: 1 }} />
                    <Button label="Dashas" variant="secondary" fullWidth onPress={() => setSection("Dashas")} style={{ flex: 1 }} />
                  </View>
                </>
              ) : null}

              {section === "Dashas" ? (
                <>
                  <Card style={{ gap: spacing.xs }}>
                    <Text variant="micro" tone="faint">
                      CURRENT PERIOD
                    </Text>
                    <Text variant="heading">
                      {lordLabel(payload.dasha?.currentMaha)}
                      {lordLabel(payload.dasha?.currentAntar) ? ` / ${lordLabel(payload.dasha.currentAntar)}` : ""}
                    </Text>
                    <Text variant="caption" tone="muted">
                      Vimshottari dasha · balance at birth {formatDashaBalance(payload.dasha?.balanceAtBirth)}
                    </Text>
                  </Card>
                  <Card>
                    <SectionHeader title="Mahadasha timeline" subtitle="Tap a period to see antardashas" />
                    {payload.dasha?.periods?.length ? (
                      <DashaAccordion periods={payload.dasha.periods} />
                    ) : (
                      <EmptyState title="No dasha timeline yet" body="Regenerate your chart to rebuild the dasha sequence." actionLabel="Regenerate" onAction={kundli.generate} />
                    )}
                  </Card>
                </>
              ) : null}

              {section === "Yogas" ? (
                <Card>
                  <SectionHeader title="Yogas" subtitle="Planetary combinations in your chart" />
                  {extras.isLoading ? (
                    <LoadingState variant="list" />
                  ) : extras.isError ? (
                    <ErrorState error={extras.error} onRetry={() => extras.refetch()} />
                  ) : (
                    <YogaList
                      yogas={[...(extras.data?.rajaYogas ?? []), ...(extras.data?.yogas ?? []), ...(extras.data?.otherYogas ?? [])]}
                      emptyLabel="No prominent yogas"
                    />
                  )}
                </Card>
              ) : null}

              {section === "Doshas" ? (
                <Card>
                  <SectionHeader title="Doshas" subtitle="Challenging patterns and their context" />
                  {extras.isLoading ? (
                    <LoadingState variant="list" />
                  ) : extras.isError ? (
                    <ErrorState error={extras.error} onRetry={() => extras.refetch()} />
                  ) : extras.data ? (
                    <DoshaList doshas={extras.data.doshas ?? []} />
                  ) : (
                    <EmptyState title="No significant doshas found" body="Your chart does not show major dosha patterns." />
                  )}
                </Card>
              ) : null}

              {section === "Vargas" ? (
                <Card style={{ gap: spacing.md }}>
                  <SectionHeader title="Divisional charts" subtitle="Choose a varga to explore" />
                  {extras.isLoading ? (
                    <LoadingState variant="detail" />
                  ) : extras.isError ? (
                    <ErrorState error={extras.error} onRetry={() => extras.refetch()} />
                  ) : (
                    <>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                        {Object.keys(extras.data?.charts.vargas ?? {}).map((key) => (
                          <Chip
                            key={key}
                            label={key.toUpperCase()}
                            selected={(varga ?? Object.keys(extras.data?.charts.vargas ?? {})[0]) === key}
                            onPress={() => setVarga(key)}
                          />
                        ))}
                      </ScrollView>
                      {(() => {
                        const vargas = extras.data?.charts.vargas ?? {};
                        const keys = Object.keys(vargas);
                        const active = varga ?? keys[0];
                        const data = active ? vargas[active] : undefined;
                        return data ? (
                          <ChartCard chart={data} title={active ? `${active.toUpperCase()} chart` : "Varga chart"} />
                        ) : (
                          <EmptyState title="No divisional charts" body="Divisional charts appear once your birth chart is generated." />
                        );
                      })()}
                    </>
                  )}
                </Card>
              ) : null}
            </>
          )}

          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {[
              ["Strength", "/(app)/strength"],
              ["Gochar", "/(app)/gochar"],
              ["Advanced", "/(app)/advanced"],
              ["Lal Kitab", "/(app)/lal-kitab"],
            ].map(([label, href]) => (
              <Chip key={label} label={label ?? ""} onPress={() => router.push(href as never)} />
            ))}
          </View>

          <InlineNotice body={DISCLAIMER} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  houseRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "flex-start",
  },
});
