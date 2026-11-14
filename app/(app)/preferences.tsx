import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { usePreferences, useSavePreferences } from "@/hooks/useProfile";
import { useToast } from "@/components/feedback/ToastProvider";
import { RELIGION_OPTIONS } from "@/lib/constants";
import { spacing } from "@/theme/tokens";
import type { Preferences } from "@/api/types/models";

const MANGLIK_OPTIONS = [
  { value: "ANY", label: "Any" },
  { value: "NON_MANGLIK", label: "Non-manglik" },
  { value: "MANGLIK", label: "Manglik" },
  { value: "PARTIAL_OK", label: "Partial match ok" },
] as const;

function toCsv(values?: string[]) {
  return values?.join(", ") ?? "";
}

function fromCsv(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function PreferencesScreen() {
  const router = useRouter();
  const toast = useToast();
  const query = usePreferences();
  const save = useSavePreferences();
  const prefs = query.data;

  const [ageMin, setAgeMin] = useState(prefs?.ageMin?.toString() ?? "");
  const [ageMax, setAgeMax] = useState(prefs?.ageMax?.toString() ?? "");
  const [heightMin, setHeightMin] = useState(prefs?.heightMinCm?.toString() ?? "");
  const [heightMax, setHeightMax] = useState(prefs?.heightMaxCm?.toString() ?? "");
  const [religions, setReligions] = useState<string[]>(prefs?.religions ?? []);
  const [communities, setCommunities] = useState(toCsv(prefs?.communities));
  const [motherTongues, setMotherTongues] = useState(toCsv(prefs?.motherTongues));
  const [educations, setEducations] = useState(toCsv(prefs?.educations));
  const [professions, setProfessions] = useState(toCsv(prefs?.professions));
  const [manglik, setManglik] = useState<Preferences["manglikPreference"]>(prefs?.manglikPreference ?? "ANY");
  const [minScore, setMinScore] = useState(prefs?.minCompatibilityScore?.toString() ?? "");
  const [maxDistance, setMaxDistance] = useState(prefs?.maxDistanceKm?.toString() ?? "");
  const [notes, setNotes] = useState(prefs?.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  if (query.isLoading) {
    return (
      <Screen title="Partner preferences" showBack>
        <LoadingState variant="detail" />
      </Screen>
    );
  }

  const submit = async () => {
    setError(null);
    const min = ageMin ? Number(ageMin) : undefined;
    const max = ageMax ? Number(ageMax) : undefined;
    if (min != null && max != null && min > max) {
      setError("Minimum age cannot exceed maximum age.");
      return;
    }
    if (min != null && (min < 18 || min > 80)) {
      setError("Preferred age should be between 18 and 80.");
      return;
    }
    const score = minScore ? Number(minScore) : undefined;
    if (score != null && (score < 0 || score > 100)) {
      setError("Minimum compatibility score must be between 0 and 100.");
      return;
    }
    try {
      await save.mutateAsync({
        ageMin: min,
        ageMax: max,
        heightMinCm: heightMin ? Number(heightMin) : null,
        heightMaxCm: heightMax ? Number(heightMax) : null,
        religions,
        communities: fromCsv(communities),
        motherTongues: fromCsv(motherTongues),
        educations: fromCsv(educations),
        professions: fromCsv(professions),
        manglikPreference: manglik,
        minCompatibilityScore: score,
        maxDistanceKm: maxDistance ? Number(maxDistance) : null,
        notes: notes.trim() || undefined,
      });
      toast.show("Preferences saved.", "success");
      router.back();
    } catch {
      setError("We couldn't save your preferences. Please try again.");
    }
  };

  return (
    <Screen title="Partner preferences" subtitle="These shape who appears in Discover" showBack>
      <View style={{ gap: spacing.lg }}>
        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Age & height" />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Input label="Minimum age" value={ageMin} onChangeText={setAgeMin} keyboardType="number-pad" containerStyle={{ flex: 1 }} />
            <Input label="Maximum age" value={ageMax} onChangeText={setAgeMax} keyboardType="number-pad" containerStyle={{ flex: 1 }} />
          </View>
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Input label="Min height (cm)" value={heightMin} onChangeText={setHeightMin} keyboardType="number-pad" containerStyle={{ flex: 1 }} />
            <Input label="Max height (cm)" value={heightMax} onChangeText={setHeightMax} keyboardType="number-pad" containerStyle={{ flex: 1 }} />
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Community" subtitle="Leave blank to include everyone" />
          <Text variant="label" tone="muted">
            Religions
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {RELIGION_OPTIONS.map((religion) => (
              <Chip
                key={religion}
                label={religion}
                selected={religions.includes(religion)}
                onPress={() =>
                  setReligions((prev) => (prev.includes(religion) ? prev.filter((r) => r !== religion) : [...prev, religion]))
                }
              />
            ))}
          </View>
          <Input label="Communities" value={communities} onChangeText={setCommunities} hint="Comma separated" />
          <Input label="Mother tongues" value={motherTongues} onChangeText={setMotherTongues} hint="Comma separated" />
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Education & career" />
          <Input label="Educations" value={educations} onChangeText={setEducations} hint="Comma separated" />
          <Input label="Professions" value={professions} onChangeText={setProfessions} hint="Comma separated" />
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Astrological fit" />
          <Text variant="label" tone="muted">
            Manglik preference
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {MANGLIK_OPTIONS.map((option) => (
              <Chip key={option.value} label={option.label} selected={manglik === option.value} onPress={() => setManglik(option.value)} />
            ))}
          </View>
          <Input label="Minimum compatibility score" value={minScore} onChangeText={setMinScore} keyboardType="number-pad" hint="0–100" />
          <Input label="Maximum distance (km)" value={maxDistance} onChangeText={setMaxDistance} keyboardType="number-pad" hint="Leave blank for no limit" />
          <Input label="Notes" value={notes} onChangeText={setNotes} multiline numberOfLines={3} style={{ minHeight: 80, textAlignVertical: "top" }} />
        </Card>

        {error ? (
          <Text variant="small" tone="ruby">
            {error}
          </Text>
        ) : null}
        <Button label="Save preferences" variant="gold" loading={save.isPending} onPress={submit} />
      </View>
    </Screen>
  );
}
