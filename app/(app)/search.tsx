import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { Text } from "@/components/ui/Text";
import { MatchCard } from "@/components/match/MatchCard";
import { useDiscovery } from "@/hooks/useDiscovery";
import { useDiscoveryFilters } from "@/hooks/useDiscoveryFilters";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

export default function SearchScreen() {
  const { palette } = useTheme();
  const router = useRouter();
  const filters = useDiscoveryFilters();
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const query = useDiscovery({
    q: term.trim() || undefined,
    page,
    limit: 20,
    applyPreferences: filters.filters.applyPreferences,
    manglik: filters.filters.manglik === "ANY" ? undefined : filters.filters.manglik,
  });

  const items = query.data?.items ?? query.data?.data ?? query.data?.results ?? [];
  const hasMore = query.data?.hasMore ?? (query.data?.totalPages ? page < query.data.totalPages : false);

  return (
    <Screen title="Search" subtitle="Find members by name, city, or profession" showBack>
      <View style={{ gap: spacing.md }}>
        <Input
          placeholder="Search members"
          value={term}
          onChangeText={(value) => {
            setTerm(value);
            setPage(1);
          }}
          returnKeyType="search"
          rightAccessory={<Search size={18} color={palette.textMuted} />}
        />
        <Button label="Search" variant="secondary" size="sm" onPress={() => query.refetch()} />

        {query.isLoading ? (
          <LoadingState variant="list" />
        ) : query.isError ? (
          <ErrorState error={query.error} onRetry={() => query.refetch()} />
        ) : items.length === 0 ? (
          <EmptyState title="No members found" body="Try a different name or clear the search." />
        ) : (
          <>
            {items.map((match) => (
              <MatchCard key={match.userId} match={match} onPress={() => router.push(`/(app)/match/${match.userId}`)} />
            ))}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Button
                label="Previous"
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
              />
              <Text variant="caption" tone="faint">
                Page {page}
              </Text>
              <Button
                label="Next"
                variant="ghost"
                size="sm"
                disabled={!hasMore}
                onPress={() => setPage((p) => p + 1)}
              />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}
