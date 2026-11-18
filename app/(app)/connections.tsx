import { useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { View } from "react-native";

import { matchmakingApi } from "@/api/endpoints/matchmaking";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useToast } from "@/components/feedback/ToastProvider";
import { formatDate } from "@/lib/format";
import { spacing } from "@/theme/tokens";

type Person = {
  otherUserId: string;
  name?: string;
  photo?: string | null;
  message?: string;
  createdAt?: string;
  city?: string;
  profession?: string;
  age?: number;
};
type Hub = {
  interested?: {
    sent?: (Person & { id: string })[];
    received?: (Person & { id: string })[];
    mutual?: Person[];
  };
  requests?: { received?: (Person & { id: string })[]; sent?: (Person & { id: string })[] };
  connected?: (Person & { id: string; connectedAt?: string })[];
};

export default function ConnectionsScreen() {
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["connections"], queryFn: () => matchmakingApi.getConnections() });
  const hub = (query.data ?? {}) as Hub;

  const respond = useMutation({
    mutationFn: ({ id, action }: { id: string; action: "accept" | "decline" }) =>
      matchmakingApi.respondToRequest(id, action),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["connections"] });
      toast.show("Request updated.", "success");
    },
    onError: () => toast.show("Could not update the request.", "error"),
  });

  const section = (title: string, people: Person[], actions: boolean) => (
    <Card style={{ gap: spacing.md }}>
      <SectionHeader title={title} subtitle={`${people.length}`} />
      {people.length === 0 ? (
        <Text variant="caption" tone="faint">
          Nothing here yet.
        </Text>
      ) : (
        people.map((person, index) => (
          <View key={`${person.otherUserId}-${index}`} style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <Avatar uri={person.photo} name={person.name ?? "Member"} size={40} ring />
            <View style={{ flex: 1 }}>
              <Text variant="body">{person.name ?? "Member"}</Text>
              {person.message ? (
                <Text variant="caption" tone="faint" numberOfLines={1}>
                  “{person.message}”
                </Text>
              ) : person.createdAt ? (
                <Text variant="caption" tone="faint">
                  {formatDate(person.createdAt)}
                </Text>
              ) : null}
            </View>
            {actions && "id" in person ? (
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Button
                  label="Accept"
                  size="sm"
                  variant="gold"
                  onPress={() => respond.mutate({ id: String((person as { id: string }).id), action: "accept" })}
                />
                <Button
                  label="Decline"
                  size="sm"
                  variant="ghost"
                  onPress={() => respond.mutate({ id: String((person as { id: string }).id), action: "decline" })}
                />
              </View>
            ) : (
              <Button
                label="View"
                size="sm"
                variant="ghost"
                onPress={() => router.push(`/(app)/match/${person.otherUserId}`)}
              />
            )}
          </View>
        ))
      )}
    </Card>
  );

  return (
    <Screen title="Connections" subtitle="Interests, requests, and people you've connected with" showBack>
      {query.isLoading ? (
        <LoadingState variant="detail" />
      ) : query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          {section("Requests received", hub.requests?.received ?? [], true)}
          {section("Requests sent", hub.requests?.sent ?? [], false)}
          {section("Interested in you", hub.interested?.received ?? [], false)}
          {section("Interest you sent", hub.interested?.sent ?? [], false)}
          {section("Mutual interest", hub.interested?.mutual ?? [], false)}
          {section("Connected", hub.connected ?? [], false)}
          {![
            hub.requests?.received?.length,
            hub.requests?.sent?.length,
            hub.interested?.received?.length,
            hub.interested?.sent?.length,
            hub.interested?.mutual?.length,
            hub.connected?.length,
          ].some(Boolean) ? (
            <EmptyState title="Build your network" body="Send interests from Discover to start connecting." />
          ) : null}
          <Button label="Find matches" variant="gold" onPress={() => router.push("/(tabs)/discover")} />
        </View>
      )}
    </Screen>
  );
}
