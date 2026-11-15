import { addDays, format, subDays } from "date-fns";
import { ChevronLeft, ChevronRight, Sunrise, Sunset } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useMuhurta, usePanchanga } from "@/hooks/useAstrology";
import { useProfileBundle } from "@/hooks/useProfile";
import { formatTimeOfDay, titleCase } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

const ACTIVITIES = [
  { value: "marriage", label: "Marriage" },
  { value: "engagement", label: "Engagement" },
  { value: "griha-pravesh", label: "Griha pravesh" },
  { value: "travel", label: "Travel" },
  { value: "business", label: "Business" },
];

export default function PanchangaScreen() {
  const { palette } = useTheme();
  const [date, setDate] = useState(new Date());
  const [activity, setActivity] = useState("marriage");
  const bundle = useProfileBundle();
  const dateKey = format(date, "yyyy-MM-dd");
  const panchanga = usePanchanga(bundle.data?.birthDetails, dateKey);
  const muhurta = useMuhurta(activity, dateKey, bundle.data?.birthDetails);

  const data = panchanga.data;

  return (
    <Screen title="Panchanga" subtitle={bundle.data?.birthDetails?.placeName ?? "Vedic almanac"} showBack>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: spacing.lg }}>
        <Pressable
          onPress={() => setDate((d) => subDays(d, 1))}
          accessibilityLabel="Previous day"
          style={{ padding: 8 }}
        >
          <ChevronLeft size={20} color={palette.text} />
        </Pressable>
        <Pressable onPress={() => setDate(new Date())} accessibilityLabel="Today">
          <Text variant="title">{format(date, "EEEE, d MMMM")}</Text>
          <Text variant="micro" tone="faint" align="center">
            Tap for today
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setDate((d) => addDays(d, 1))}
          accessibilityLabel="Next day"
          style={{ padding: 8 }}
        >
          <ChevronRight size={20} color={palette.text} />
        </Pressable>
      </View>

      {panchanga.isLoading ? (
        <LoadingState variant="detail" />
      ) : panchanga.isError ? (
        <ErrorState error={panchanga.error} onRetry={() => panchanga.refetch()} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="The five limbs" subtitle="Tithi · Nakshatra · Yoga · Karana · Vara" />
            {[
              ["Tithi", data?.tithi?.name, data?.tithi?.paksha],
              ["Nakshatra", data?.nakshatra?.name, data?.nakshatra?.pada ? `Pada ${data.nakshatra.pada}` : undefined],
              ["Yoga", data?.yoga?.name, undefined],
              ["Karana", data?.karana?.name, undefined],
              ["Vara", data?.vara?.name, undefined],
            ].map(([label, value, detail]) => (
              <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingVertical: 4 }}>
                <Text variant="small" tone="muted">
                  {label}
                </Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text variant="body">{value ?? "—"}</Text>
                  {detail ? (
                    <Text variant="micro" tone="faint">
                      {detail}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </Card>

          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Sun & moon" subtitle={data?.location?.placeName ?? "Birth location"} />
            <View style={{ flexDirection: "row", gap: spacing.md }}>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Sunrise size={18} color={palette.gold} />
                <View>
                  <Text variant="micro" tone="faint">
                    SUNRISE
                  </Text>
                  <Text variant="small">{formatTimeOfDay(data?.sunrise)}</Text>
                </View>
              </View>
              <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                <Sunset size={18} color={palette.saffron} />
                <View>
                  <Text variant="micro" tone="faint">
                    SUNSET
                  </Text>
                  <Text variant="small">{formatTimeOfDay(data?.sunset)}</Text>
                </View>
              </View>
            </View>
            {data?.moonrise ? (
              <Text variant="caption" tone="muted">
                Moonrise {formatTimeOfDay(data.moonrise)}
              </Text>
            ) : null}
          </Card>

          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Muhurta windows" subtitle="Auspicious timing for an activity" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {ACTIVITIES.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={activity === option.value}
                  onPress={() => setActivity(option.value)}
                />
              ))}
            </View>
            {muhurta.isLoading ? (
              <Text variant="small" tone="muted">
                Calculating windows…
              </Text>
            ) : muhurta.isError ? (
              <Text variant="small" tone="ruby">
                Muhurta is unavailable for this date.
              </Text>
            ) : muhurta.data?.windows?.length ? (
              muhurta.data.windows.map((window, index) => (
                <View key={index} style={{ borderTopWidth: 1, borderTopColor: palette.border, paddingTop: spacing.sm, gap: 2 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
                    <Text variant="small" weight="semibold">
                      {window.rating ? `${titleCase(window.rating)} window` : window.label ?? window.activity ?? "Window"}
                    </Text>
                    <Text variant="caption" tone={window.rating === "avoid" ? "ruby" : "gold"}>
                      {window.startTime && window.endTime
                        ? `${window.startTime} – ${window.endTime}`
                        : window.start && window.end
                          ? `${window.start} – ${window.end}`
                          : window.quality ?? ""}
                    </Text>
                  </View>
                  {window.reasons?.length ? (
                    <Text variant="caption" tone="muted">
                      {window.reasons.join(" · ")}
                    </Text>
                  ) : window.notes ? (
                    <Text variant="caption" tone="muted">
                      {window.notes}
                    </Text>
                  ) : null}
                  {window.cautions?.length ? (
                    <Text variant="caption" tone="ruby">
                      {window.cautions.join(" · ")}
                    </Text>
                  ) : null}
                </View>
              ))
            ) : (
              <Text variant="small" tone="muted">
                No recommended windows for {activity.replace("-", " ")} on this date.
              </Text>
            )}
          </Card>
        </View>
      )}
    </Screen>
  );
}
