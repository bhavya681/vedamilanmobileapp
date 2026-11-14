import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { heightLabel, titleCase } from "@/lib/format";
import type { RankedMatch } from "@/api/types/models";

export function MatchCard({
  match,
  onPress,
  compact = false,
}: {
  match: RankedMatch;
  onPress?: () => void;
  compact?: boolean;
}) {
  const { palette } = useTheme();
  const gunaPct =
    match.maxGuna > 0 ? Math.round((match.totalGuna / match.maxGuna) * 100) : Math.round(match.compatibilityScore);
  const tone = gunaPct >= 75 ? "emerald" : gunaPct >= 50 ? "gold" : "ruby";

  if (compact) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${match.name}, ${match.age ?? ""} ${match.city ?? ""}`}
        style={({ pressed }) => [styles.compact, { borderColor: palette.border, backgroundColor: palette.raised }, pressed && { opacity: 0.85 }]}
      >
        <Avatar uri={match.photo} name={match.name} size={56} ring />
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="label" numberOfLines={1}>
            {match.name}
            {match.age ? `, ${match.age}` : ""}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {[match.profession, match.city].filter(Boolean).join(" · ") || "Profile"}
          </Text>
          <Text variant="micro" tone="gold">
            {match.totalGuna}/{match.maxGuna} guna · {gunaPct}%
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Card onPress={onPress} padded={false} style={{ marginBottom: spacing.md }}>
      <View style={{ flexDirection: "row", padding: spacing.lg, gap: spacing.md }}>
        <Avatar uri={match.photo} name={match.name} size={72} ring />
        <View style={{ flex: 1, gap: 3 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>
              {match.name}
              {match.age ? `, ${match.age}` : ""}
            </Text>
            <Badge label={`${gunaPct}%`} tone={tone} size="sm" />
          </View>
          <Text variant="small" tone="muted" numberOfLines={1}>
            {[match.profession, match.city].filter(Boolean).join(" · ") || "—"}
          </Text>
          <Text variant="caption" tone="faint" numberOfLines={1}>
            {[match.heightCm ? heightLabel(match.heightCm) : null, match.religion ? titleCase(match.religion) : null, match.manglik ? `Manglik: ${titleCase(match.manglik)}` : null]
              .filter(Boolean)
              .join(" · ")}
          </Text>
          {match.reasons.length ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginTop: 3 }}>
              {match.reasons.slice(0, 2).map((reason) => (
                <View key={reason} style={[styles.reason, { borderColor: palette.border }]}>
                  <Text variant="micro" tone="muted">
                    {reason}
                  </Text>
                </View>
              ))}
            </View>
          ) : match.cardSummary ? (
            <Text variant="caption" tone="faint" numberOfLines={2} style={{ marginTop: 2 }}>
              {match.cardSummary}
            </Text>
          ) : null}
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: palette.border,
        }}
      >
        <Text variant="micro" tone="faint">
          {match.nakshatra ? `${match.nakshatra} nakshatra` : "Nakshatra hidden"}
        </Text>
        <Text variant="micro" tone="faint">
          {match.preferenceFit !== undefined ? `Preference fit ${Math.round(match.preferenceFit)}%` : ""}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  compact: {
    width: 200,
    flexDirection: "row",
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
  },
  reason: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
});
