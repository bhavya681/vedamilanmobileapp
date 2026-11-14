import React, { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { BottomSheet } from "@/components/ui/Sheet";
import { Text } from "@/components/ui/Text";
import type { DiscoveryFilters } from "@/hooks/useDiscoveryFilters";
import type { MatchQueryLike } from "@/hooks/useDiscovery";
import { RELIGION_OPTIONS } from "@/lib/constants";
import { spacing } from "@/theme/tokens";

const MANGLIK = [
  { value: "ANY", label: "Any" },
  { value: "NON_MANGLIK", label: "Non-Manglik" },
  { value: "MANGLIK", label: "Manglik" },
] as const;

const COMPAT = [50, 60, 70, 80];

export function FilterSheet({
  visible,
  initial,
  onClose,
  onApply,
}: {
  visible: boolean;
  initial: DiscoveryFilters;
  onClose: () => void;
  onApply: (filters: MatchQueryLike) => void;
}) {
  const [draft, setDraft] = useState<DiscoveryFilters>(initial);

  useEffect(() => {
    if (visible) setDraft(initial);
  }, [visible, initial]);

  const numberOrUndefined = (value: string): number | undefined => {
    const n = Number(value);
    return value.trim() && Number.isFinite(n) ? n : undefined;
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Refine your search">
      <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: spacing.lg, paddingBottom: spacing.lg }}>
          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Input
              label="Min age"
              keyboardType="number-pad"
              value={draft.minAge ? String(draft.minAge) : ""}
              onChangeText={(v) => setDraft((d) => ({ ...d, minAge: numberOrUndefined(v) }))}
              placeholder="24"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Max age"
              keyboardType="number-pad"
              value={draft.maxAge ? String(draft.maxAge) : ""}
              onChangeText={(v) => setDraft((d) => ({ ...d, maxAge: numberOrUndefined(v) }))}
              placeholder="36"
              containerStyle={{ flex: 1 }}
            />
          </View>

          <Input
            label="City"
            placeholder="Any city"
            value={draft.city ?? ""}
            onChangeText={(v) => setDraft((d) => ({ ...d, city: v || undefined }))}
          />
          <Input
            label="Profession"
            placeholder="Any profession"
            value={draft.profession ?? ""}
            onChangeText={(v) => setDraft((d) => ({ ...d, profession: v || undefined }))}
          />

          <View style={{ gap: spacing.sm }}>
            <Text variant="label" tone="muted">
              Religion
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {RELIGION_OPTIONS.slice(0, 8).map((religion) => (
                <Chip
                  key={religion}
                  label={religion}
                  selected={draft.religion === religion}
                  onPress={() =>
                    setDraft((d) => ({ ...d, religion: d.religion === religion ? undefined : religion }))
                  }
                />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text variant="label" tone="muted">
              Manglik preference
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {MANGLIK.map((option) => (
                <Chip
                  key={option.value}
                  label={option.label}
                  selected={(draft.manglik ?? "ANY") === option.value}
                  onPress={() => setDraft((d) => ({ ...d, manglik: option.value }))}
                />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text variant="label" tone="muted">
              Minimum compatibility
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              <Chip
                label="Any"
                selected={!draft.minCompatibility}
                onPress={() => setDraft((d) => ({ ...d, minCompatibility: undefined }))}
              />
              {COMPAT.map((score) => (
                <Chip
                  key={score}
                  label={`${score}%+`}
                  selected={draft.minCompatibility === score}
                  onPress={() => setDraft((d) => ({ ...d, minCompatibility: score }))}
                />
              ))}
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: spacing.md }}>
            <Input
              label="Min height (cm)"
              keyboardType="number-pad"
              value={draft.minHeightCm ? String(draft.minHeightCm) : ""}
              onChangeText={(v) => setDraft((d) => ({ ...d, minHeightCm: numberOrUndefined(v) }))}
              placeholder="150"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Max height (cm)"
              keyboardType="number-pad"
              value={draft.maxHeightCm ? String(draft.maxHeightCm) : ""}
              onChangeText={(v) => setDraft((d) => ({ ...d, maxHeightCm: numberOrUndefined(v) }))}
              placeholder="190"
              containerStyle={{ flex: 1 }}
            />
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text variant="label" tone="muted">
              Saved preferences
            </Text>
            <View style={{ flexDirection: "row", gap: spacing.sm }}>
              <Chip
                label="Apply my saved preferences"
                selected={draft.applyPreferences}
                onPress={() => setDraft((d) => ({ ...d, applyPreferences: true }))}
              />
              <Chip
                label="Ignore them"
                selected={!draft.applyPreferences}
                onPress={() => setDraft((d) => ({ ...d, applyPreferences: false }))}
              />
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.sm }}>
            <Button
              label="Clear"
              variant="secondary"
              onPress={() => onApply({ manglik: "ANY", applyPreferences: true })}
            />
            <Button
              label="Show matches"
              variant="gold"
              onPress={() => onApply({ ...draft, manglik: draft.manglik ?? "ANY" })}
              style={{ flex: 1 }}
            />
          </View>
        </View>
      </ScrollView>
    </BottomSheet>
  );
}
