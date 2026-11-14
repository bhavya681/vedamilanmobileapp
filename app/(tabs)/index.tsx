import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  CalendarDays,
  Calculator,
  ChevronRight,
  HeartHandshake,
  Mic,
  Sparkles,
  Search,
  Star,
  TrendingUp,
} from "lucide-react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useQuery } from "@tanstack/react-query";
import { matchmakingApi } from "@/api/endpoints/matchmaking";
import { queryKeys } from "@/api/queryKeys";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { MatchCard } from "@/components/match/MatchCard";
import { NotificationBell } from "@/components/navigation/NotificationBell";
import { useHoroscope, usePanchanga } from "@/hooks/useAstrology";
import { useProfileBundle } from "@/hooks/useProfile";
import { useSession } from "@/providers/SessionProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { DISCLAIMER } from "@/lib/constants";
import { formatDate, titleCase } from "@/lib/format";
import { radii, spacing } from "@/theme/tokens";

const EXPLORE = [
  { icon: HeartHandshake, label: "Compatibility", route: "/(app)/compatibility" as const },
  { icon: CalendarDays, label: "Panchanga", route: "/(app)/panchanga" as const },
  { icon: Calculator, label: "Numerology", route: "/(app)/numerology" as const },
  { icon: Search, label: "Search", route: "/(app)/search" as const },
  { icon: Sparkles, label: "Wisdom", route: "/(app)/wisdom" as const },
  { icon: TrendingUp, label: "Life calendar", route: "/(app)/calendar" as const },
  { icon: Mic, label: "Consult", route: "/(app)/consultations" as const },
  { icon: Star, label: "Celebrities", route: "/(app)/celebrities" as const },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const { palette, scheme } = useTheme();
  const { user } = useSession();
  const bundle = useProfileBundle();
  const birth = bundle.data?.birthDetails ?? null;
  const kundli = useHoroscope(true);
  const panchanga = usePanchanga(birth);
  const recommendations = useQuery({
    queryKey: ["recommendations", "home"] as const,
    queryFn: () => matchmakingApi.recommendations(),
    staleTime: 5 * 60_000,
    retry: 0,
  });

  const profile = bundle.data?.profile;
  const photo = profile?.photos?.find((p) => p.isPrimary)?.secureUrl ?? profile?.photos?.[0]?.secureUrl;
  const recs = (recommendations.data?.recommendations ?? recommendations.data?.items ?? []).slice(0, 6);
  const horoscope = kundli.payload?.horoscope;
  const dasha = kundli.payload?.dasha;
  const meta = kundli.payload?.meta;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.giant }}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 }}>
            <Avatar uri={photo} name={user?.user.name ?? profile?.name} size={42} />
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="muted">
                {greeting()}
              </Text>
              <Text variant="title" numberOfLines={1}>
                {user?.user.name ?? profile?.name ?? "Seeker"}
              </Text>
            </View>
          </View>
          <NotificationBell />
        </View>

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.xl }}>
          <LinearGradient
            colors={scheme === "dark" ? ["#241B10", "#171310"] : ["#2A2115", "#1A1611"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View>
                <Text variant="micro" style={{ color: "#D4AF37", letterSpacing: 2 }}>
                  YOUR VEDIC SNAPSHOT
                </Text>
                <Text variant="display" style={{ color: "#FAF6EE", marginTop: 4 }}>
                  {horoscope ? horoscope.lagnaSign : kundli.isLoading ? "Casting…" : "Kundli"}
                </Text>
                <Text variant="caption" style={{ color: "#C9BFB0" }}>
                  {horoscope ? `Lagna · ${horoscope.lagnaNakshatra ?? "Vedic sidereal"}` : "Prepared from your birth details"}
                </Text>
              </View>
              {horoscope?.manglikStatus ? (
                <Badge
                  label={`Manglik: ${titleCase(horoscope.manglikStatus)}`}
                  tone={horoscope.manglikStatus.toLowerCase().includes("non") ? "emerald" : "ruby"}
                  size="sm"
                />
              ) : null}
            </View>

            {kundli.isLoading ? (
              <View style={{ marginTop: spacing.lg }}>
                <Text variant="small" style={{ color: "#C9BFB0" }}>
                  Calculating planetary positions…
                </Text>
              </View>
            ) : kundli.error && !horoscope ? (
              <View style={{ marginTop: spacing.md }}>
                <Text variant="small" style={{ color: "#FCA5A5" }}>
                  We could not load your chart right now.
                </Text>
                <Button
                  label="Try again"
                  variant="secondary"
                  size="sm"
                  onPress={kundli.generate}
                  style={{ marginTop: spacing.md, borderColor: "#D4AF3766" }}
                />
              </View>
            ) : horoscope ? (
              <>
                <View style={{ flexDirection: "row", gap: spacing.lg, marginTop: spacing.lg }}>
                  <MiniStat label="Moon" value={horoscope.moonSign} />
                  <MiniStat label="Sun" value={horoscope.sunSign} />
                  <MiniStat label="Dasha" value={dasha?.currentMaha ?? "—"} />
                </View>
                <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg, alignItems: "center" }}>
                  <Button
                    label="Open kundli"
                    variant="gold"
                    size="sm"
                    onPress={() => router.push("/(tabs)/kundli")}
                  />
                  <Button
                    label="Ask the Guide"
                    variant="ghost"
                    size="sm"
                    onPress={() => router.push("/(tabs)/ai")}
                    style={{ backgroundColor: "transparent" }}
                  />
                </View>
                {meta?.ayanamsha ? (
                  <Text variant="micro" style={{ color: "#8F8678", marginTop: spacing.md }}>
                    {String(meta.ayanamsha)} ayanamsha · sidereal
                  </Text>
                ) : null}
              </>
            ) : (
              <Text variant="small" style={{ color: "#C9BFB0", marginTop: spacing.md }}>
                Add your birth details to cast your chart.
              </Text>
            )}
          </LinearGradient>

          <Card padded>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <CalendarDays size={16} color={palette.gold} />
                <Text variant="label">Today&apos;s panchanga</Text>
              </View>
              <Text variant="micro" tone="faint">
                {formatDate(new Date(), "EEE, d MMM")}
              </Text>
            </View>
            {panchanga.isLoading ? (
              <View style={{ marginTop: spacing.md }}>
                <Text variant="small" tone="muted">
                  Reading the sky…
                </Text>
              </View>
            ) : panchanga.isError ? (
              <Text variant="small" tone="muted" style={{ marginTop: spacing.sm }}>
                Panchanga is unavailable right now.
              </Text>
            ) : (
              <>
                <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: spacing.md, rowGap: spacing.md }}>
                  {[
                    ["Tithi", panchanga.data?.tithi?.name],
                    ["Nakshatra", panchanga.data?.nakshatra?.name],
                    ["Yoga", panchanga.data?.yoga?.name],
                    ["Vara", panchanga.data?.vara?.name],
                  ].map(([label, value]) => (
                    <View key={label} style={{ width: "50%" }}>
                      <Text variant="micro" tone="faint">
                        {label?.toUpperCase()}
                      </Text>
                      <Text variant="small" numberOfLines={1}>
                        {value ?? "—"}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: "row", gap: spacing.lg, marginTop: spacing.md }}>
                  <Text variant="caption" tone="muted">
                    Sunrise {panchanga.data?.sunrise ?? "—"}
                  </Text>
                  <Text variant="caption" tone="muted">
                    Sunset {panchanga.data?.sunset ?? "—"}
                  </Text>
                </View>
                <Button
                  label="Full panchanga"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push("/(app)/panchanga")}
                  style={{ alignSelf: "flex-start", marginLeft: -spacing.sm, marginTop: spacing.xs }}
                />
              </>
            )}
          </Card>

          <View>
            <SectionHeader
              title="Recommended for you"
              subtitle="Ranked by your chart and preferences"
              actionLabel="See all"
              onAction={() => router.push("/(app)/search")}
            />
            {recommendations.isLoading ? (
              <LoadingState variant="list" />
            ) : recommendations.isError ? (
              <ErrorState error={recommendations.error} onRetry={() => recommendations.refetch()} />
            ) : recs.length === 0 ? (
              <Card tone="outlined" style={{ gap: spacing.md }}>
                <Text variant="title">Recommendations are warming up</Text>
                <Text variant="small" tone="muted">
                  Complete your profile and preferences to receive curated, chart-based introductions.
                </Text>
                <Button
                  label="Review preferences"
                  variant="secondary"
                  size="sm"
                  onPress={() => router.push("/(app)/preferences")}
                />
              </Card>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: spacing.md, paddingRight: spacing.xl }}
              >
                {recs.map((match) => (
                  <MatchCard
                    key={match.userId}
                    match={match}
                    compact
                    onPress={() =>
                      router.push({ pathname: "/(app)/match/[id]", params: { id: match.userId } })
                    }
                  />
                ))}
              </ScrollView>
            )}
          </View>

          <View>
            <SectionHeader title="Explore" subtitle="Chart, time and guidance" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
              {EXPLORE.map(({ icon: Icon, label, route }) => (
                <Card
                  key={label}
                  onPress={() => router.push(route)}
                  padded={false}
                  style={{ width: "47.5%", padding: spacing.md, gap: spacing.sm }}
                  accessibilityLabel={label}
                >
                  <View
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: radii.md,
                      backgroundColor: `${palette.goldSoft}14`,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={17} color={palette.gold} />
                  </View>
                  <Text variant="small" weight="semibold">
                    {label}
                  </Text>
                </Card>
              ))}
            </View>
          </View>

          <Card tone="gold" onPress={() => router.push("/(app)/marriage-guru")} style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Sparkles size={16} color={palette.gold} />
                <Text variant="label">Marriage Guru</Text>
              </View>
              <ChevronRight size={16} color={palette.textFaint} />
            </View>
            <Text variant="small" tone="muted">
              Understand your readiness, timing windows and the patterns your chart repeats in
              relationships.
            </Text>
          </Card>

          <Text variant="micro" tone="faint" style={{ textAlign: "center", paddingHorizontal: spacing.lg }}>
            {DISCLAIMER}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text variant="micro" style={{ color: "#8F8678" }}>
        {label.toUpperCase()}
      </Text>
      <Text variant="title" style={{ color: "#FAF6EE" }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  hero: {
    borderRadius: radii.xxl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: "#D4AF3733",
  },
});
