import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Switch, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useProfileBundle, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/components/feedback/ToastProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import type { PrivacySettings, Profile } from "@/api/types/models";

const TOGGLES: Array<{ key: keyof PrivacySettings; label: string; hint: string }> = [
  { key: "showAge", label: "Show my age", hint: "Display your age on your profile" },
  { key: "showMoonSign", label: "Show moon sign", hint: "Reveal your Rashi to members" },
  { key: "showLagna", label: "Show lagna", hint: "Reveal your ascendant" },
  { key: "showNakshatra", label: "Show nakshatra", hint: "Reveal your birth star" },
  { key: "showManglik", label: "Show manglik status", hint: "Reveal your manglik dosha status" },
  { key: "acceptInterests", label: "Accept new interests", hint: "Allow members to send you interests" },
  { key: "showOnlineStatus", label: "Show online status", hint: "Let matches see when you are active" },
];

export default function PrivacyScreen() {
  const bundle = useProfileBundle();

  if (bundle.isLoading) {
    return (
      <Screen title="Privacy" showBack>
        <LoadingState variant="detail" />
      </Screen>
    );
  }

  return <PrivacyForm key={bundle.data?.profile.userId ?? "privacy"} profile={bundle.data?.profile} />;
}

function PrivacyForm({ profile }: { profile?: Profile }) {
  const { palette } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const save = useUpdateProfile();
  const [privacy, setPrivacy] = useState<PrivacySettings>(profile?.privacy ?? {});
  const [visibility, setVisibility] = useState<NonNullable<Profile["visibility"]>>(
    profile?.visibility ?? "MEMBERS",
  );

  const toggle = (key: keyof PrivacySettings) =>
    setPrivacy((prev) => ({ ...prev, [key]: !prev[key] }));

  const submit = async () => {
    try {
      await save.mutateAsync({ privacy, visibility });
      toast.show("Privacy settings saved.", "success");
      router.back();
    } catch {
      toast.show("We couldn't save your privacy settings.", "error");
    }
  };

  return (
    <Screen title="Privacy" subtitle="Control what members can see" showBack>
      <View style={{ gap: spacing.lg }}>
        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Profile visibility" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {[
              { value: "PUBLIC", label: "Public" },
              { value: "MEMBERS", label: "Members" },
              { value: "HIDDEN", label: "Hidden" },
            ].map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={visibility === option.value}
                onPress={() => setVisibility(option.value as NonNullable<Profile["visibility"]>)}
              />
            ))}
          </View>
          <Text variant="caption" tone="faint">
            Hidden profiles are excluded from Discover but keep your matches.
          </Text>
        </Card>

        <Card>
          <SectionHeader title="What others can see" />
          <View style={{ gap: spacing.md }}>
            {TOGGLES.map((item) => (
              <View key={item.key} style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
                <View style={{ flex: 1 }}>
                  <Text variant="small">{item.label}</Text>
                  <Text variant="caption" tone="faint">
                    {item.hint}
                  </Text>
                </View>
                <Switch
                  value={privacy[item.key] ?? item.key !== "showOnlineStatus"}
                  onValueChange={() => toggle(item.key)}
                  trackColor={{ true: palette.gold, false: palette.borderStrong }}
                  thumbColor={palette.raised}
                />
              </View>
            ))}
          </View>
        </Card>

        <Button label="Save privacy settings" variant="gold" loading={save.isPending} onPress={submit} />
      </View>
    </Screen>
  );
}
