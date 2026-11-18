import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { ArrowRight, Sparkles, Users } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, TextInput, View } from "react-native";

import { wisdomApi } from "@/api/endpoints/wisdom";
import { queryKeys } from "@/api/queryKeys";
import type { WisdomBundle, WisdomGuide } from "@/api/types/models";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { SageAvatar } from "@/components/wisdom/SageAvatar";
import { COUNCIL_IMAGE, getSageImage } from "@/lib/sageImages";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";
import { fontFamily } from "@/theme/typography";

export default function RishiSagesScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [need, setNeed] = useState<string | null>(null);

  const query = useQuery({ queryKey: queryKeys.wisdom.library(), queryFn: () => wisdomApi.getLibrary() });
  const bundle: WisdomBundle | undefined =
    query.data && "guides" in query.data ? (query.data as WisdomBundle) : undefined;

  const guides = useMemo(() => {
    const all = [
      ...(bundle?.guides ?? []),
      ...(bundle?.featuredSages ?? []),
      ...(bundle?.relationshipGuides ?? []),
    ];
    const unique = new Map<string, WisdomGuide>();
    all.forEach((guide) => {
      if (guide?.id) unique.set(guide.id, guide);
    });
    return [...unique.values()];
  }, [bundle]);

  const categoryName = (id: string) =>
    bundle?.categories?.find((item) => item.id === id)?.title ??
    bundle?.categories?.find((item) => item.id === id)?.name ??
    id;

  const filtered = guides.filter((guide) => {
    const matchesSearch = `${guide.displayName} ${guide.sanskritName ?? ""} ${guide.domain ?? ""} ${guide.shortPhilosophy ?? ""}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = !category || guide.categoryIds?.includes(category);
    const matchesNeed =
      !need ||
      guide.topics?.some((topic) => topic.toLowerCase().includes(need.toLowerCase())) ||
      guide.knowledgeScope?.some((scope) => scope.toLowerCase().includes(need.toLowerCase()));
    return matchesSearch && matchesCategory && matchesNeed;
  });

  return (
    <Screen
      title="Rishi & Sages"
      subtitle="Timeless Vedic wisdom, in your own words"
      eyebrow="VEDIC WISDOM"
      showBack
      refreshing={query.isFetching}
      onRefresh={() => query.refetch()}
    >
      <View style={{ gap: spacing.lg }}>
        <Pressable
          onPress={() => router.push("/(app)/ask-the-sages" as never)}
          accessibilityRole="button"
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.md,
            padding: spacing.lg,
            borderRadius: radii.xxl,
            backgroundColor: palette.temple,
            borderWidth: 1,
            borderColor: `${palette.gold}55`,
          }}
        >
          <SageAvatar uri={COUNCIL_IMAGE} label="Council of Sages" size={42} rounded={radii.pill} />
          <View style={{ flex: 1 }}>
            <Text variant="label" tone="onAccent">
              Ask the Sages
            </Text>
            <Text variant="caption" tone="onAccent">
              A council of sages for one question
            </Text>
          </View>
          <ArrowRight size={17} color={palette.gold} />
        </Pressable>

        {bundle?.daily?.title ? (
          <View
            style={{
              padding: spacing.lg,
              borderRadius: radii.xxl,
              borderWidth: 1,
              borderColor: palette.border,
              backgroundColor: palette.raised,
              gap: 6,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color={palette.gold} />
              <Text variant="micro" tone="gold">
                DAILY REFLECTION
              </Text>
            </View>
            <Text variant="body" weight="semibold">
              {bundle.daily.title}
            </Text>
            {bundle.daily.body ? (
              <Text variant="small" tone="muted">
                {bundle.daily.body}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            paddingHorizontal: spacing.md,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: palette.border,
            backgroundColor: palette.raised,
          }}
        >
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search sages, themes, or traditions"
            placeholderTextColor={palette.textFaint}
            accessibilityLabel="Search sages"
            style={{ flex: 1, minHeight: 46, color: palette.text, fontFamily: fontFamily.body }}
          />
        </View>

        {bundle?.categories?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <Chip label="All" selected={!category} onPress={() => setCategory(null)} size="sm" />
            {bundle.categories.map((item) => (
              <Chip
                key={item.id}
                label={item.title ?? item.name ?? item.id}
                selected={category === item.id}
                onPress={() => setCategory((prev) => (prev === item.id ? null : item.id))}
                size="sm"
              />
            ))}
          </ScrollView>
        ) : null}

        {bundle?.needs?.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {bundle.needs.map((item) => (
              <Chip
                key={item.id}
                label={item.label ?? item.id}
                selected={need === item.id}
                onPress={() => setNeed((prev) => (prev === item.id ? null : item.id))}
                size="sm"
                tone="emerald"
              />
            ))}
          </ScrollView>
        ) : null}

        <Text variant="micro" tone="faint">
          {category ? categoryName(category).toUpperCase() : "ALL SAGES"} · {filtered.length} GUIDES
        </Text>

        {query.isLoading ? (
          <LoadingState variant="list" />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No sages found"
            body="Try a different name, tradition, or theme."
            actionLabel="Clear filters"
            onAction={() => {
              setSearch("");
              setCategory(null);
              setNeed(null);
            }}
          />
        ) : (
          filtered.map((guide) => (
            <Pressable
              key={guide.id}
              onPress={() => router.push({ pathname: "/(app)/rishi-sages/[id]", params: { id: guide.id } } as never)}
              accessibilityRole="button"
              style={{
                padding: spacing.lg,
                borderRadius: radii.xxl,
                borderWidth: 1,
                borderColor: palette.border,
                backgroundColor: palette.raised,
                gap: spacing.sm,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <SageAvatar
                  uri={getSageImage(guide)}
                  label={guide.monogram ?? guide.displayName}
                  size={46}
                  rounded={radii.lg}
                />
                <View style={{ flex: 1 }}>
                  <Text variant="label" numberOfLines={1}>
                    {guide.displayName}
                  </Text>
                  <Text variant="micro" tone="gold" numberOfLines={1}>
                    {guide.sanskritName ? `${guide.sanskritName} · ` : ""}
                    {guide.role ?? guide.domain ?? "Vedic guide"}
                  </Text>
                </View>
                <ArrowRight size={17} color={palette.gold} />
              </View>
              {guide.shortPhilosophy ? (
                <Text variant="small" tone="muted" numberOfLines={2}>
                  {guide.shortPhilosophy}
                </Text>
              ) : null}
              {guide.topics?.length ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                  {guide.topics.slice(0, 4).map((topic) => (
                    <View
                      key={topic}
                      style={{
                        paddingHorizontal: 8,
                        paddingVertical: 3,
                        borderRadius: radii.pill,
                        backgroundColor: palette.canvas,
                        borderWidth: 1,
                        borderColor: palette.border,
                      }}
                    >
                      <Text variant="micro" tone="faint">
                        {topic}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : null}
            </Pressable>
          ))
        )}

        <Button
          label="Open Wisdom Journal"
          variant="secondary"
          onPress={() => router.push("/(app)/journal" as never)}
        />
      </View>
    </Screen>
  );
}
