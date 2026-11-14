import { useLocalSearchParams, useRouter } from "expo-router";
import { Image } from "expo-image";
import { Heart, MapPin, MessageCircle, Star } from "lucide-react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import { Alert, ScrollView, View } from "react-native";

import { matchmakingApi } from "@/api/endpoints/matchmaking";
import { chatApi } from "@/api/endpoints/chat";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { useToast } from "@/components/feedback/ToastProvider";
import { heightLabel, titleCase } from "@/lib/format";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const toast = useToast();
  const { palette } = useTheme();

  const query = useQuery({
    queryKey: ["candidate", id],
    queryFn: () => matchmakingApi.getCandidate(id as string),
    enabled: Boolean(id),
  });

  const interest = useMutation({
    mutationFn: () => matchmakingApi.expressInterest(id as string),
    onSuccess: () => toast.show("Interest sent.", "success"),
    onError: () => toast.show("Could not send interest.", "error"),
  });

  const shortlist = useMutation({
    mutationFn: () => matchmakingApi.shortlist(id as string),
    onSuccess: () => toast.show("Added to shortlist.", "success"),
    onError: () => toast.show("Could not update shortlist.", "error"),
  });

  const openChat = useMutation({
    mutationFn: () => chatApi.openChat(id as string),
    onSuccess: (result) => {
      const chatId = result.chat.id ?? result.chat._id;
      if (!chatId) {
        toast.show("Chat could not be opened.", "error");
        return;
      }
      router.push(`/(app)/chat/${chatId}?other=${encodeURIComponent(id ?? "")}&name=${encodeURIComponent(candidate?.name ?? "")}`);
    },
    onError: () => toast.show("Chat could not be opened.", "error"),
  });

  const candidate = query.data?.profile;

  if (query.isLoading) {
    return (
      <Screen title="Profile" showBack>
        <LoadingState variant="detail" />
      </Screen>
    );
  }
  if (query.isError || !candidate) {
    return (
      <Screen title="Profile" showBack>
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      </Screen>
    );
  }

  const photos = candidate.photos ?? [];
  const primary = photos.find((p) => p.isPrimary) ?? photos[0];
  const score = Math.round(candidate.compatibilityScore ?? 0);
  const strengths = (candidate as { strengths?: string[] }).strengths ?? [];
  const challenges = (candidate as { challenges?: string[] }).challenges ?? [];

  return (
    <Screen showBack padded={false}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
        {primary ? (
          <Image
            source={primary.secureUrl ?? primary.url}
            style={{ width: "100%", aspectRatio: 4 / 5, backgroundColor: palette.raised }}
            contentFit="cover"
          />
        ) : null}
        <View style={{ padding: spacing.lg, gap: spacing.lg, marginTop: primary ? -24 : 0 }}>
          <Card style={{ gap: spacing.md }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
              <View style={{ flex: 1 }}>
                <Text variant="heading">
                  {candidate.name}
                  {candidate.age ? `, ${candidate.age}` : ""}
                </Text>
                <Text variant="small" tone="muted">
                  {[candidate.profession, candidate.company].filter(Boolean).join(" · ") || "—"}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                  <MapPin size={13} color={palette.textFaint} />
                  <Text variant="caption" tone="faint">
                    {[candidate.city, candidate.country].filter(Boolean).join(", ") || "Location private"}
                  </Text>
                </View>
              </View>
              <ScoreRing score={score} size={64} label="Match" max={100} />
            </View>
            <Text variant="caption" tone="faint">
              {[
                candidate.heightCm ? heightLabel(candidate.heightCm) : null,
                candidate.religion ? titleCase(candidate.religion) : null,
                candidate.motherTongue,
                candidate.maritalStatus ? titleCase(candidate.maritalStatus) : null,
                candidate.manglik ? `Manglik: ${titleCase(candidate.manglik)}` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Text>
            {candidate.headline ? <Text variant="body">{candidate.headline}</Text> : null}
          </Card>

          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Button
              label="Interest"
              variant="gold"
              size="sm"
              icon={<Heart size={16} color={palette.onAccent} />}
              loading={interest.isPending}
              onPress={() => interest.mutate()}
              style={{ flex: 1 }}
            />
            <Button
              label="Shortlist"
              variant="secondary"
              size="sm"
              icon={<Star size={16} color={palette.text} />}
              loading={shortlist.isPending}
              onPress={() => shortlist.mutate()}
              style={{ flex: 1 }}
            />
            <Button
              label="Chat"
              variant="secondary"
              size="sm"
              icon={<MessageCircle size={16} color={palette.text} />}
              loading={openChat.isPending}
              onPress={() => openChat.mutate()}
              style={{ flex: 1 }}
            />
          </View>

          <Button
            label="Full compatibility report"
            variant="secondary"
            size="sm"
            onPress={() => router.push(`/(app)/compatibility?candidateUserId=${encodeURIComponent(id ?? "")}`)}
          />

          {candidate.about ? (
            <Card style={{ gap: spacing.sm }}>
              <SectionHeader title="About" />
              <Text variant="body" tone="muted">
                {candidate.about}
              </Text>
            </Card>
          ) : null}

          {candidate.gunaBreakdown?.length ? (
            <Card style={{ gap: spacing.sm }}>
              <SectionHeader
                title="Ashtakoota"
                subtitle={`${candidate.totalGuna ?? 0}/${candidate.maxGuna ?? 36} guna`}
              />
              {candidate.gunaBreakdown.map((item) => (
                <View key={item.koota} style={{ gap: 4 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text variant="small">{titleCase(item.koota)}</Text>
                    <Text variant="caption" tone="gold">
                      {item.score}/{item.max}
                    </Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: palette.border }}>
                    <View
                      style={{
                        height: 6,
                        borderRadius: 3,
                        width: `${Math.min(100, Math.round((item.score / Math.max(1, item.max)) * 100))}%`,
                        backgroundColor: palette.gold,
                      }}
                    />
                  </View>
                  {item.note ? (
                    <Text variant="micro" tone="faint">
                      {item.note}
                    </Text>
                  ) : null}
                </View>
              ))}
            </Card>
          ) : null}

          {strengths.length || challenges.length ? (
            <Card style={{ gap: spacing.md }}>
              {strengths.length ? (
                <View style={{ gap: spacing.xs }}>
                  <Text variant="label" tone="muted">
                    STRENGTHS
                  </Text>
                  {strengths.map((item) => (
                    <Text key={item} variant="small" tone="muted">
                      • {item}
                    </Text>
                  ))}
                </View>
              ) : null}
              {challenges.length ? (
                <View style={{ gap: spacing.xs }}>
                  <Text variant="label" tone="muted">
                    POINTS TO DISCUSS
                  </Text>
                  {challenges.map((item) => (
                    <Text key={item} variant="small" tone="muted">
                      • {item}
                    </Text>
                  ))}
                </View>
              ) : null}
            </Card>
          ) : null}

          <Button
            label="Block or report"
            variant="ghost"
            size="sm"
            onPress={() =>
              Alert.alert("Block this member?", "They will no longer appear in your matches or chats.", [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Block",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      await matchmakingApi.block(id as string);
                      toast.show("Member blocked.", "success");
                      router.back();
                    } catch {
                      toast.show("Could not block this member.", "error");
                    }
                  },
                },
              ])
            }
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
