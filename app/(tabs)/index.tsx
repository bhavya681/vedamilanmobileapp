import { useRouter } from "expo-router";
import {
  CalendarDays,
  Calculator,
  ChevronRight,
  HeartHandshake,
  Mic,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Bell,
} from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";
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
import { formatDate, formatTimeOfDay, titleCase } from "@/lib/format";
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
  const completion = profile?.completion?.score ?? profile?.profileCompletion ?? 0;
  const photo = profile?.photos?.find((p) => p.isPrimary)?.secureUrl ?? profile?.photos?.[0]?.secureUrl;
  const recs = (recommendations.data?.recommendations ?? recommendations.data?.items ?? []).slice(0, 6);
  const horoscope = kundli.payload?.horoscope;
  const dasha = kundli.payload?.dasha;
  const meta = kundli.payload?.meta;

  const isBirthIncomplete = !birth;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.giant }}>
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 }}>
            <Avatar uri={photo} name={user?.user.name ?? profile?.name} size={44} ring />
            <View style={{ flex: 1 }}>
              <Text variant="caption" tone="muted" style={{ letterSpacing: 0.5 }}>
                {greeting()}, {user?.user.name ?? profile?.name?.split(" ")[0] ?? "there"}
              </Text>
              <Text variant="titleLg" numberOfLines={1} weight="semibold">
                {user?.user.name ?? profile?.name ?? "Seeker"}
              </Text>
            </View>
          </View>
          <NotificationBell />
        </View>

        <View style={{ paddingHorizontal: spacing.xl, gap: spacing.xl }}>

          {isBirthIncomplete ? (
            <Card padded style={{ gap: spacing.md, backgroundColor: `${palette.goldSoft}12`, borderColor: `${palette.goldSoft}40` }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <Bell size={18} color={palette.gold} />
                <Text variant="body" weight="semibold" style={{ flex: 1 }}>
                  Complete your birth details
                </Text>
                <Button label="Add now" variant="gold" size="sm" onPress={() => router.push("/(app)/birth-details")} />
              </View>
              <Text variant="small" tone="muted">
                Your Vedic chart, panchanga and compatibility depend on accurate birth date, time and place.
              </Text>
            </Card>
          ) : null}

          <Card tone="sunken" padded={false} style={styles.hero}>
            <View style={{ padding: spacing.xl }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                <View>
                  <Text variant="micro" tone="gold" style={{ letterSpacing: 1.2 }}>
                    Your Vedic snapshot
                  </Text>
                  <Text variant="display" numberOfLines={1} weight="semibold" style={{ marginTop: 4 }}>
                    {horoscope ? horoscope.lagnaSign : kundli.isLoading ? "—" : "—"}
                  </Text>
                  <Text variant="caption" tone="muted" style={{ marginTop: 2 }}>
                    {horoscope ? `Lagna · ${horoscope.lagnaNakshatra ?? "Vedic sidereal"}` : "Add your birth details to cast your chart."}
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
                <View style={{ marginTop: spacing.lg, alignItems: "center" }}>
                  <ActivityIndicator color={palette.gold} style={{ marginTop: spacing.sm }} />
                  <Text variant="small" tone="muted" style={{ marginTop: spacing.sm }}>
                    Calculating planetary positions…
                  </Text>
                </View>
              ) : kundli.error && !horoscope ? (
                <View style={{ marginTop: spacing.md, alignItems: "center" }}>
                  <Text variant="small" tone="ruby" style={{ textAlign: "center" }}>
                    We could not load your chart right now.
                  </Text>
                  <Button
                    label="Try again"
                    variant="secondary"
                    size="sm"
                    onPress={kundli.generate}
                    style={{ marginTop: spacing.md, width: 120 }}
                  />
                </View>
              ) : horoscope ? (
                <>
                  <View style={{ flexDirection: "row", gap: spacing.lg, marginTop: spacing.lg }}>
                    <MiniStat label="Moon" value={horoscope.moonSign ?? "—"} />
                    <MiniStat label="Sun" value={horoscope.sunSign ?? "—"} />
                    <MiniStat label="Dasha" value={dasha?.currentMaha ?? "—"} />
                  </View>
                  <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.lg, alignItems: "center" }}>
                    <Button
                      label="Open horoscope"
                      variant="gold"
                      size="sm"
                      onPress={() => router.push("/(tabs)/kundli")}
                      style={{ flex: 1 }}
                    />
                <Button
                  label="Ask the Guide"
                  variant="ghost"
                  size="sm"
                  onPress={() => router.push("/chats")}
                  style={{ flex: 1 }}
                />
                  </View>
                  {meta?.ayanamsha ? (
                    <Text variant="micro" tone="faint" style={{ marginTop: spacing.md, textAlign: "center" }}>
                      {String(meta.ayanamsha)} ayanamsha · sidereal
                    </Text>
                  ) : null}
                </>
              ) : null}
            </View>
          </Card>

          <View>
            <SectionHeader title="Today at a glance" subtitle="Quick actions and today's panchanga" />
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <QuickTile
                icon={CalendarDays}
                label="Panchanga"
                value={panchanga.data?.tithi?.name ?? "—"}
                subtitle={panchanga.data?.nakshatra?.name ?? "Vedic almanac"}
                onPress={() => router.push("/(app)/panchanga")}
              />
              <QuickTile
                icon={HeartHandshake}
                label="Compatibility"
                value="Check"
                subtitle="Compare charts"
                onPress={() => router.push("/(app)/compatibility")}
              />
              <QuickTile
                icon={Sparkles}
                label="AI Guide"
                value="Ask"
                subtitle="Vedic insights"
                onPress={() => router.push("/chats")}
              />
              <QuickTile
                icon={Bell}
                label="Notifications"
                value="0 new"
                subtitle="Updates"
                onPress={() => router.push("/(app)/notifications")}
              />
            </View>
          </View>

          {panchanga.data && !panchanga.isLoading && !panchanga.isError ? (
            <Card padded style={{ gap: spacing.md }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                  <CalendarDays size={16} color={palette.gold} />
                  <Text variant="label">Today&rsquo;s panchanga</Text>
                </View>
                <Text variant="micro" tone="faint">
                  {formatDate(new Date(), "EEE, d MMM")}
                </Text>
              </View>
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
                    <Text variant="small" numberOfLines={1} weight="semibold">
                      {value ?? "—"}
                    </Text>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: "row", gap: spacing.lg, marginTop: spacing.md, justifyContent: "center" }}>
                <Text variant="caption" tone="muted">
                  Sunrise {formatTimeOfDay(panchanga.data?.sunrise)}
                </Text>
                <Text variant="caption" tone="muted">
                  Sunset {formatTimeOfDay(panchanga.data?.sunset)}
                </Text>
              </View>
              <Button
                label="Full panchanga"
                variant="ghost"
                size="sm"
                onPress={() => router.push("/(app)/panchanga")}
                style={{ alignSelf: "flex-start", marginTop: spacing.xs }}
              />
            </Card>
          ) : null}

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
                <Text variant="title" align="center">Recommendations are warming up</Text>
                <Text variant="small" tone="muted" align="center">
                  Complete your profile and preferences to receive curated, chart-based introductions.
                </Text>
                <Button
                  label="Review preferences"
                  variant="secondary"
                  size="sm"
                  onPress={() => router.push("/(app)/preferences")}
                  style={{ alignSelf: "center", marginTop: spacing.sm }}
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
                  style={[styles.exploreCard, { borderColor: palette.border }]}
                  accessibilityLabel={label}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: radii.md,
                      backgroundColor: `${palette.goldSoft}10`,
                      alignItems: "center",
                      justifyContent: "center",
                      borderWidth: 1,
                      borderColor: `${palette.goldSoft}33`,
                    }}
                  >
                    <Icon size={18} color={palette.gold} />
                  </View>
                  <Text variant="small" weight="semibold" style={{ marginTop: spacing.xs }}>
                    {label}
                  </Text>
                </Card>
              ))}
            </View>
          </View>

          <Card padded style={{ gap: spacing.sm }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Sparkles size={16} color={palette.gold} />
                <Text variant="label">Marriage Guru</Text>
              </View>
              <ChevronRight size={16} color={palette.textFaint} />
            </View>
            <Text variant="small" tone="muted">
              Understand your readiness, timing windows and the patterns your chart repeats in relationships.
            </Text>
          </Card>

          <Text variant="micro" tone="faint" style={{ textAlign: "center", paddingHorizontal: spacing.lg, marginTop: spacing.xs }}>
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
      <Text variant="micro" tone="faint" style={{ textAlign: "center" }}>
        {label.toUpperCase()}
      </Text>
      <Text variant="title" numberOfLines={1} style={{ textAlign: "center" }}>
        {value}
      </Text>
    </View>
  );
}

function QuickTile({
  icon: Icon,
  label,
  value,
  subtitle,
  onPress,
}: {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  value: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={styles.quickTile}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <View style={{ width: 40, height: 40, borderRadius: radii.md, backgroundColor: "#14110E12", alignItems: "center", justifyContent: "center" }}>
        <Icon size={18} color="#C89B3C" />
      </View>
      <Text variant="small" weight="semibold" numberOfLines={1} style={{ marginTop: spacing.xs }}>
        {label}
      </Text>
      <Text variant="micro" tone="muted" numberOfLines={1} style={{ marginTop: spacing.xxs }}>
        {value}
      </Text>
    </Pressable>
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
  },
  exploreCard: {
    width: "47.5%",
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
  },
  quickTile: {
    flex: 1,
    minWidth: "22%",
    padding: spacing.md,
    gap: spacing.sm,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#14110E10",
    alignItems: "center",
  },
});
