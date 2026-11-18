import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { Users } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import { wisdomApi } from "@/api/endpoints/wisdom";
import { queryKeys } from "@/api/queryKeys";
import type { WisdomBundle } from "@/api/types/models";
import { Chip } from "@/components/ui/Chip";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { SageChat } from "@/components/wisdom/SageChat";
import { SageAvatar } from "@/components/wisdom/SageAvatar";
import { COUNCIL_IMAGE } from "@/lib/sageImages";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

const FALLBACK_GUIDE_IDS = ["vasistha", "vishwamitra", "vyasa", "yajnavalkya"];

export default function AskTheSagesScreen() {
  const { need: needParam } = useLocalSearchParams<{ need?: string }>();
  const { palette } = useTheme();
  const query = useQuery({ queryKey: queryKeys.wisdom.library(), queryFn: () => wisdomApi.getLibrary() });
  const bundle: WisdomBundle | undefined =
    query.data && "guides" in query.data ? (query.data as WisdomBundle) : undefined;
  const [selected, setSelected] = useState<string[]>([]);
  const [need, setNeed] = useState<string | undefined>(needParam);

  const councilGuides = useMemo(() => {
    const source = bundle?.featuredSages?.length ? bundle.featuredSages : bundle?.guides ?? [];
    return source.slice(0, 6);
  }, [bundle]);

  useEffect(() => {
    if (!selected.length && councilGuides.length) {
      setSelected(councilGuides.slice(0, 4).map((guide) => guide.id));
    }
  }, [councilGuides, selected.length]);

  const guideIds = selected.length ? selected : councilGuides.map((guide) => guide.id).slice(0, 4);
  const finalGuideIds = guideIds.length ? guideIds : FALLBACK_GUIDE_IDS;
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));

  if (query.isLoading) {
    return (
      <Screen title="Ask the Sages" showBack>
        <LoadingState variant="detail" />
      </Screen>
    );
  }

  if (query.isError) {
    return (
      <Screen title="Ask the Sages" showBack>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Ask the Sages"
      subtitle="A council of Vedic voices"
      eyebrow="VEDIC COUNCIL"
      showBack
      scroll={false}
      padded={false}
      edges={["top", "left", "right", "bottom"]}
    >
      <View style={{ flex: 1 }}>
        <View
          style={{
            gap: spacing.sm,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            borderBottomWidth: 1,
            borderBottomColor: palette.border,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
            <SageAvatar uri={COUNCIL_IMAGE} label="Council of Sages" size={28} rounded={radii.pill} />
            <Text variant="micro" tone="gold">
              COUNCIL MEMBERS · {finalGuideIds.length}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {councilGuides.map((guide) => (
              <Chip
                key={guide.id}
                label={guide.displayName.replace("Sage ", "")}
                selected={selected.includes(guide.id)}
                onPress={() => toggle(guide.id)}
                size="sm"
              />
            ))}
          </ScrollView>
          {bundle?.needs?.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {bundle.needs.slice(0, 8).map((item) => (
                <Chip
                  key={item.id}
                  label={item.label ?? item.id}
                  selected={need === item.id}
                  onPress={() => setNeed((prev) => (prev === item.id ? undefined : item.id))}
                  size="sm"
                  tone="emerald"
                />
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View style={{ flex: 1 }}>
          <SageChat
            council
            identity={{
              title: "Council of Sages",
              tagline: finalGuideIds.length ? `${finalGuideIds.length} sages in dialogue` : "Vedic council",
              assistantLabel: "COUNCIL OF SAGES",
              welcomeBody:
                "Ask one question and receive a synthesis from the selected sages’ documented teachings. Each voice stays within its own scope.",
              suggestions: [
                "How should I approach a difficult decision with dharma and clarity?",
                "What does disciplined effort teach about lasting success?",
                "How can I cultivate inner calm while fulfilling family duties?",
                "What does Vedic wisdom say about ethical leadership?",
              ],
              disclaimer: bundle?.disclaimer,
            }}
            guideIds={finalGuideIds}
            need={need}
            category="vedic-council"
          />
        </View>
      </View>
    </Screen>
  );
}
