import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

import { wisdomApi, type WisdomGuideDetail } from "@/api/endpoints/wisdom";
import { queryKeys } from "@/api/queryKeys";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, InlineNotice, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

export default function RishiSageDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette } = useTheme();
  const query = useQuery({
    queryKey: queryKeys.wisdom.library(id),
    queryFn: () => wisdomApi.getLibrary({ guideId: id }),
    enabled: Boolean(id),
  });
  const detail = query.data && "guide" in query.data ? (query.data as WisdomGuideDetail) : undefined;
  const guide = detail?.guide;

  if (query.isLoading) {
    return (
      <Screen title="Sage" showBack>
        <LoadingState variant="detail" />
      </Screen>
    );
  }

  if (query.isError || !guide) {
    return (
      <Screen title="Sage" showBack>
        <ErrorState
          error={query.error ?? new Error("This sage could not be found.")}
          onRetry={() => query.refetch()}
        />
      </Screen>
    );
  }

  const sections = [
    guide.biography ? { label: "Background", body: guide.biography } : null,
    guide.shortPhilosophy ? { label: "Core outlook", body: guide.shortPhilosophy } : null,
    guide.coreTeachings?.length
      ? { label: "Teachings", body: guide.coreTeachings.map((item) => `• ${item}`).join("\n") }
      : null,
    guide.knowledgeScope?.length
      ? { label: "Guidance scope", body: guide.knowledgeScope.map((item) => `• ${item}`).join("\n") }
      : null,
    guide.limitations?.length
      ? { label: "Boundaries", body: guide.limitations.map((item) => `• ${item}`).join("\n") }
      : null,
    guide.primarySources?.length
      ? { label: "Primary sources", body: guide.primarySources.map((item) => `• ${item}`).join("\n") }
      : null,
    guide.associatedTexts?.length
      ? { label: "Associated texts", body: guide.associatedTexts.map((item) => `• ${item}`).join("\n") }
      : null,
  ].filter(Boolean) as { label: string; body: string }[];

  return (
    <Screen title={guide.displayName} subtitle={guide.role ?? guide.domain} eyebrow="VEDIC WISDOM" showBack>
      <View style={{ gap: spacing.lg }}>
        <Card tone="gold" style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: radii.xl,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: `${palette.gold}24`,
                borderWidth: 1,
                borderColor: `${palette.gold}66`,
              }}
            >
              <Text variant="serifLg" tone="gold">
                {guide.monogram ?? guide.displayName.slice(0, 1)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="heading">{guide.displayName}</Text>
              <Text variant="small" tone="gold">
                {guide.sanskritName ?? guide.role ?? "Rishi"}
              </Text>
              <Text variant="caption" tone="muted">
                {guide.domain ?? guide.era ?? "Vedic tradition"}
              </Text>
            </View>
          </View>
          {guide.shortPhilosophy ? (
            <Text variant="body" tone="muted">
              {guide.shortPhilosophy}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Button
              label={`Ask ${guide.displayName.replace("Sage ", "")}`}
              variant="gold"
              onPress={() =>
                router.push({
                  pathname: "/(app)/rishi-sages/[id]/chat",
                  params: { id: guide.id },
                } as never)
              }
              style={{ flex: 1 }}
            />
            <Button
              label="Council"
              variant="secondary"
              onPress={() => router.push({ pathname: "/(app)/ask-the-sages", params: { need: guide.id } } as never)}
              style={{ flex: 1 }}
            />
          </View>
        </Card>

        {guide.knownFor?.length ? (
          <View style={{ gap: spacing.sm }}>
            <Text variant="micro" tone="gold">
              KNOWN FOR
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {guide.knownFor.map((item) => (
                <View
                  key={item}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: radii.pill,
                    backgroundColor: palette.raised,
                    borderWidth: 1,
                    borderColor: palette.border,
                  }}
                >
                  <Text variant="caption" tone="muted">
                    {item}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {sections.map((section) => (
          <View key={section.label} style={{ gap: spacing.sm }}>
            <Text variant="label" tone="gold">
              {section.label}
            </Text>
            <Text variant="body" tone="muted" style={{ lineHeight: 22 }}>
              {section.body}
            </Text>
          </View>
        ))}

        <View
          style={{
            padding: spacing.lg,
            borderRadius: radii.xxl,
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: palette.raised,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <BookOpen size={16} color={palette.gold} />
            <Text variant="label">Walk the path</Text>
          </View>
          <Text variant="small" tone="muted">
            Explore your spiritual themes and past-life indicators alongside the sage’s guidance.
          </Text>
          <Button
            label="Open Spiritual Journey"
            variant="secondary"
            onPress={() => router.push("/(app)/spiritual-journey" as never)}
          />
        </View>

        <Button
          label="Browse all sages"
          variant="ghost"
          onPress={() => router.push("/(app)/rishi-sages" as never)}
          icon={<ArrowRight size={16} color={palette.gold} />}
        />
        <Button
          label="Read the daily reflection"
          variant="ghost"
          onPress={() => router.push("/(app)/ask-the-sages" as never)}
          icon={<Sparkles size={16} color={palette.gold} />}
        />
        <InlineNotice body={detail?.disclaimer ?? "Guidance is reflective and scriptural, not predictive."} />
      </View>
    </Screen>
  );
}
