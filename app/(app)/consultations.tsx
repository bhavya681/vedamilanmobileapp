import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react-native";
import React from "react";
import { View } from "react-native";

import { consultationApi } from "@/api/endpoints/consultation";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState, InlineNotice } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

export default function ConsultationsScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const query = useQuery({
    queryKey: ["consultation-astrologers"],
    queryFn: () => consultationApi.listAstrologers(),
  });
  const astrologers = query.data?.astrologers ?? [];

  return (
    <Screen title="Consultations" subtitle="Speak with an astrologer" showBack>
      {query.isLoading ? (
        <LoadingState variant="list" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : astrologers.length === 0 ? (
        <EmptyState title="No astrologers available" body="Please check back shortly." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {astrologers.map((astrologer) => (
            <Card
              key={astrologer.id}
              onPress={() => router.push(`/(app)/consultation/${astrologer.id}`)}
              style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}
            >
              <Avatar uri={astrologer.photo} name={astrologer.name} size={52} ring />
              <View style={{ flex: 1 }}>
                <Text variant="body">{astrologer.name}</Text>
                <Text variant="caption" tone="muted">
                  {[astrologer.title, astrologer.experienceYears ? `${astrologer.experienceYears} yrs` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
                {astrologer.specialties?.length ? (
                  <Text variant="micro" tone="faint" numberOfLines={1}>
                    {astrologer.specialties.slice(0, 3).join(" · ")}
                  </Text>
                ) : null}
              </View>
              <MessageCircle size={18} color={palette.gold} />
            </Card>
          ))}
          <InlineNotice body={query.data?.disclaimer ?? "Consultations are guidance conversations, not emergency support."} />
        </View>
      )}
    </Screen>
  );
}
