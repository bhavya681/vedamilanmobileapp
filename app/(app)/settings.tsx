import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { LogOut, Moon, Smartphone, Sun } from "lucide-react-native";
import React from "react";
import { Alert, Pressable, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useAppearanceController } from "@/hooks/useAppearance";
import { useSession } from "@/providers/SessionProvider";
import { THEME_PRESETS } from "@/theme/presets";
import { radii, spacing } from "@/theme/tokens";

const MODES = [
  { value: "light", label: "Light", hint: "Bright, clean surfaces", icon: Sun },
  { value: "dark", label: "Dark", hint: "True black background", icon: Moon },
  { value: "system", label: "System", hint: "Match device setting", icon: Smartphone },
] as const;

export default function SettingsScreen() {
  const appearance = useAppearanceController();
  const { palette, mode } = appearance;
  const { signOut, user } = useSession();
  const router = useRouter();
  const activePreset = THEME_PRESETS.find((preset) => preset.id === appearance.theme) ?? THEME_PRESETS[0]!;

  const confirmSignOut = () => {
    Alert.alert("Sign out?", "You can sign back in at any time.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void signOut().then(() => router.replace("/(auth)/welcome"));
        },
      },
    ]);
  };

  return (
    <Screen title="Settings" subtitle={user?.user.email} showBack>
      <View style={{ gap: spacing.lg }}>
        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Appearance" subtitle="Choose how VedaMilan looks" />
          <View style={{ gap: spacing.sm }}>
            {MODES.map((option) => {
              const Icon = option.icon;
              const selected = mode === option.value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => appearance.update({ mode: option.value })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: spacing.md,
                    padding: spacing.md,
                    borderRadius: radii.lg,
                    borderWidth: selected ? 1.5 : 1,
                    borderColor: selected ? palette.gold : palette.border,
                    backgroundColor: selected ? `${palette.gold}14` : palette.sunken,
                  }}
                >
                  <View
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: selected ? `${palette.gold}22` : palette.raised,
                      borderWidth: 1,
                      borderColor: selected ? `${palette.gold}55` : palette.border,
                    }}
                  >
                    <Icon size={18} color={selected ? palette.gold : palette.textMuted} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="label" tone={selected ? "gold" : "default"}>
                      {option.label}
                    </Text>
                    <Text variant="caption" tone="muted">
                      {option.hint}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
          <ListRow
            title="Theme & appearance"
            subtitle={activePreset.name}
            value={activePreset.id === "veda-gold" && appearance.expression !== "neutral" ? "Tinted" : "Curated"}
            onPress={() => router.push("/(app)/appearance" as never)}
          />
          <Text variant="micro" tone="faint">
            {appearance.saveError
              ? "Saved on this device · will sync when online"
              : appearance.saving
                ? "Saving appearance…"
                : "Appearance is saved to your account"}
          </Text>
        </Card>

        <Card style={{ padding: 0 }}>
          <ListRow title="Edit profile" onPress={() => router.push("/(app)/edit-profile")} />
          <ListRow title="Photos" onPress={() => router.push("/(app)/photos")} />
          <ListRow title="Birth details" onPress={() => router.push("/(app)/birth-details")} />
          <ListRow title="Partner preferences" onPress={() => router.push("/(app)/preferences")} />
          <ListRow title="Privacy" onPress={() => router.push("/(app)/privacy")} />
          <ListRow
            title="Language & region"
            subtitle="Date, time, currency, and AI language"
            onPress={() => router.push("/(app)/locale" as never)}
          />
        </Card>

        <Card style={{ padding: 0 }}>
          <ListRow title="Billing & membership" onPress={() => router.push("/(app)/billing")} />
          <ListRow title="Consultations" onPress={() => router.push("/(app)/consultations")} />
          <ListRow title="Help & support" onPress={() => router.push("/(app)/support")} />
        </Card>

        <Button
          label="Sign out"
          variant="secondary"
          icon={<LogOut size={16} color={palette.ruby} />}
          onPress={confirmSignOut}
        />

        <View style={{ alignItems: "center", gap: 2 }}>
          <Text variant="caption" tone="faint">
            VedaMilan · v{Constants.expoConfig?.version ?? "1.0.0"}
          </Text>
        </View>
      </View>
    </Screen>
  );
}
