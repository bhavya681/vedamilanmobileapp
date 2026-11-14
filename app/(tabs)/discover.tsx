import { useRouter } from "expo-router";
import { SlidersHorizontal, Search as SearchIcon } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { MatchQueryLike } from "@/hooks/useDiscovery";
import { useDiscovery } from "@/hooks/useDiscovery";
import { useDiscoveryFilters } from "@/hooks/useDiscoveryFilters";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { EmptyState, ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Text } from "@/components/ui/Text";
import { MatchCard } from "@/components/match/MatchCard";
import { FilterSheet } from "@/components/discover/FilterSheet";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import type { RankedMatch } from "@/api/types/models";

export default function DiscoverScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const { filters, setFilters, reset, activeCount } = useDiscoveryFilters();
  const [page, setPage] = useState(1);

  const params = useMemo<MatchQueryLike>(
    () => ({ ...filters, q: query.trim() || undefined, page, limit: 20 }),
    [filters, query, page],
  );

  const results = useDiscovery(params);
  const items: RankedMatch[] = results.data?.items ?? results.data?.data ?? results.data?.results ?? [];
  const total = results.data?.total;
  const hasMore = results.data?.hasMore ?? (total !== undefined ? items.length < total : false);

  const applyFilters = (next: MatchQueryLike) => {
    setFilters(next as unknown as Parameters<typeof setFilters>[0]);
    setPage(1);
    setSheetOpen(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right"]}>
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.sm }}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text variant="display">Discover</Text>
            <Text variant="caption" tone="muted">
              {total !== undefined ? `${total} members to explore` : "Chart-aware introductions"}
            </Text>
          </View>
          <Pressable
            onPress={() => setSheetOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open filters"
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: activeCount ? palette.gold : palette.border,
              backgroundColor: palette.raised,
            }}
          >
            <SlidersHorizontal size={15} color={activeCount ? palette.gold : palette.textMuted} />
            <Text variant="caption" weight="semibold" tone={activeCount ? "gold" : "muted"}>
              Filters{activeCount ? ` · ${activeCount}` : ""}
            </Text>
          </Pressable>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: spacing.sm,
            backgroundColor: palette.raised,
            borderColor: palette.border,
            borderWidth: StyleSheet.hairlineWidth,
            borderRadius: 14,
            paddingHorizontal: spacing.md,
            marginTop: spacing.lg,
          }}
        >
          <SearchIcon size={17} color={palette.textMuted} />
          <TextInput
            value={query}
            onChangeText={(v) => {
              setQuery(v);
              setPage(1);
            }}
            placeholder="Search by name, city or profession"
            placeholderTextColor={palette.textFaint}
            accessibilityLabel="Search members"
            style={{ flex: 1, color: palette.text, paddingVertical: 12, fontSize: 15 }}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>

        <View style={{ flexDirection: "row", gap: spacing.sm, marginTop: spacing.md, flexWrap: "wrap" }}>
          <Chip label="Recommended" selected tone="gold" />
          {filters.manglik && filters.manglik !== "ANY" ? (
            <Chip label={`Manglik: ${filters.manglik}`} selected tone="ruby" onPress={() => applyFilters({ ...filters, manglik: "ANY" })} />
          ) : null}
          {filters.minCompatibility ? (
            <Chip label={`${filters.minCompatibility}%+ match`} selected onPress={() => applyFilters({ ...filters, minCompatibility: undefined })} />
          ) : null}
          {activeCount > 0 ? <Chip label="Clear" onPress={reset} /> : null}
        </View>
      </View>

      {results.isLoading ? (
        <View style={{ padding: spacing.xl }}>
          <LoadingState variant="list" />
        </View>
      ) : results.isError ? (
        <View style={{ padding: spacing.xl }}>
          <ErrorState error={results.error} onRetry={() => results.refetch()} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.userId}
          contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing.giant, flexGrow: 1 }}
          refreshControl={undefined}
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasMore && !results.isFetching) setPage((p) => p + 1);
          }}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              onPress={() => router.push({ pathname: "/(app)/match/[id]", params: { id: item.userId } })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No matches for these filters"
              body="Widen your preferences or clear a filter to see more chart-compatible members."
              actionLabel="Reset filters"
              onAction={reset}
            />
          }
          ListFooterComponent={
            hasMore ? (
              <Button
                label={results.isFetching ? "Loading…" : "Load more"}
                variant="secondary"
                fullWidth
                loading={results.isFetching}
                onPress={() => setPage((p) => p + 1)}
              />
            ) : items.length ? (
              <Text variant="caption" tone="faint" align="center">
                You have reached the end of this selection.
              </Text>
            ) : undefined
          }
        />
      )}

      <FilterSheet
        visible={sheetOpen}
        initial={filters}
        onClose={() => setSheetOpen(false)}
        onApply={applyFilters}
      />
    </SafeAreaView>
  );
}
