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
import { useProfileBundle, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/components/feedback/ToastProvider";
import {
  GENDER_OPTIONS,
  INCOME_RANGE_OPTIONS,
  LANGUAGE_OPTIONS,
  MARITAL_STATUS_OPTIONS,
} from "@/lib/constants";
import { spacing } from "@/theme/tokens";
import type { Gender, Profile } from "@/api/types/models";

export default function EditProfileScreen() {
  const bundle = useProfileBundle();

  if (bundle.isLoading) {
    return (
      <Screen title="Edit profile" showBack>
        <LoadingState variant="detail" />
      </Screen>
    );
  }

  return <EditProfileForm key={bundle.data?.profile.userId ?? "profile"} profile={bundle.data?.profile} />;
}

function EditProfileForm({ profile }: { profile?: Profile }) {
  const router = useRouter();
  const toast = useToast();
  const save = useUpdateProfile();

  const [name, setName] = useState(profile?.name ?? "");
  const [headline, setHeadline] = useState(profile?.headline ?? "");
  const [about, setAbout] = useState(profile?.about ?? "");
  const [gender, setGender] = useState<Gender | undefined>(profile?.gender ?? undefined);
  const [heightCm, setHeightCm] = useState(profile?.heightCm?.toString() ?? "");
  const [maritalStatus, setMaritalStatus] = useState(profile?.maritalStatus ?? "");
  const [religion, setReligion] = useState(profile?.religion ?? "");
  const [community, setCommunity] = useState(profile?.community ?? "");
  const [motherTongue, setMotherTongue] = useState(profile?.motherTongue ?? "");
  const [languages, setLanguages] = useState<string[]>(profile?.languages ?? []);
  const [education, setEducation] = useState(profile?.education ?? "");
  const [profession, setProfession] = useState(profile?.profession ?? "");
  const [company, setCompany] = useState(profile?.company ?? "");
  const [incomeRange, setIncomeRange] = useState(profile?.incomeRange ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [state, setState] = useState(profile?.state ?? "");
  const [country, setCountry] = useState(profile?.country ?? "India");
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    if (!name.trim()) {
      setError("Your name cannot be empty.");
      return;
    }
    const height = heightCm ? Number(heightCm) : null;
    if (height != null && (!Number.isFinite(height) || height < 100 || height > 230)) {
      setError("Height should be between 100 and 230 cm.");
      return;
    }
    try {
      await save.mutateAsync({
        name: name.trim(),
        headline: headline.trim() || undefined,
        about: about.trim() || undefined,
        gender,
        heightCm: height,
        maritalStatus: maritalStatus || undefined,
        religion: religion.trim() || null,
        community: community.trim() || null,
        motherTongue: motherTongue || null,
        languages,
        education: education.trim() || null,
        profession: profession.trim() || null,
        company: company.trim() || null,
        incomeRange: incomeRange || null,
        city: city.trim() || null,
        state: state.trim() || null,
        country: country.trim() || "India",
      });
      toast.show("Profile updated.", "success");
      router.back();
    } catch {
      setError("We couldn't save your profile. Please try again.");
    }
  };

  return (
    <Screen title="Edit profile" subtitle="Details shown on your matrimonial profile" showBack>
      <View style={{ gap: spacing.lg }}>
        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Essentials" />
          <Input label="Name" value={name} onChangeText={setName} required />
          <Input label="Headline" value={headline} onChangeText={setHeadline} placeholder="A short line about you" maxLength={120} />
          <Input
            label="About"
            value={about}
            onChangeText={setAbout}
            multiline
            numberOfLines={4}
            style={{ minHeight: 96, textAlignVertical: "top" }}
            maxLength={1200}
          />
          <Text variant="label" tone="muted">
            Gender
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {GENDER_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={gender === option.value}
                onPress={() => setGender(option.value)}
              />
            ))}
          </View>
          <Input label="Height (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="number-pad" />
          <Text variant="label" tone="muted">
            Marital status
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {MARITAL_STATUS_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={maritalStatus === option.value}
                onPress={() => setMaritalStatus(option.value)}
              />
            ))}
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Background" />
          <Input label="Religion" value={religion} onChangeText={setReligion} />
          <Input label="Community" value={community} onChangeText={setCommunity} />
          <Input label="Mother tongue" value={motherTongue} onChangeText={setMotherTongue} />
          <Text variant="label" tone="muted">
            Languages spoken
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {LANGUAGE_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={languages.includes(option)}
                onPress={() =>
                  setLanguages((prev) => (prev.includes(option) ? prev.filter((l) => l !== option) : [...prev, option]))
                }
              />
            ))}
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Education & career" />
          <Input label="Education" value={education} onChangeText={setEducation} />
          <Input label="Profession" value={profession} onChangeText={setProfession} />
          <Input label="Company" value={company} onChangeText={setCompany} />
          <Text variant="label" tone="muted">
            Income range
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {INCOME_RANGE_OPTIONS.map((option) => (
              <Chip
                key={option}
                label={option}
                selected={incomeRange === option}
                onPress={() => setIncomeRange(option)}
              />
            ))}
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Location" />
          <Input label="City" value={city} onChangeText={setCity} />
          <Input label="State" value={state} onChangeText={setState} />
          <Input label="Country" value={country} onChangeText={setCountry} />
        </Card>

        {error ? (
          <Text variant="small" tone="ruby">
            {error}
          </Text>
        ) : null}
        <Button label="Save changes" variant="gold" loading={save.isPending} onPress={submit} />
      </View>
    </Screen>
  );
}
