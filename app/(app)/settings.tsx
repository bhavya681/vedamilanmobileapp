import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import React from "react";
import { Alert, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { ListRow } from "@/components/ui/ListRow";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useSession } from "@/providers/SessionProvider";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

const MODES = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
] as const;

export default function SettingsScreen() {
  const { palette, mode, setMode } = useTheme();
  const { signOut, user } = useSession();
  const router = useRouter();

  const confirmSignOut = () => {
    Alert.alert("Sign out?", "You can sign back in at any time.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign out",
        style: "destructive",
        onPress: () => {
          void signOut();
        },
      },
    ]);
  };

  return (
    <Screen title="Settings" subtitle={user?.user.email} showBack>
      <View style={{ gap: spacing.lg }}>
        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Appearance" />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            {MODES.map((option) => (
              <Chip key={option.value} label={option.label} selected={mode === option.value} onPress={() => setMode(option.value)} />
            ))}
          </View>
        </Card>

        <Card style={{ padding: 0 }}>
          <ListRow title="Edit profile" onPress={() => router.push("/(app)/edit-profile")} />
          <ListRow title="Photos" onPress={() => router.push("/(app)/photos")} />
          <ListRow title="Birth details" onPress={() => router.push("/(app)/birth-details")} />
          <ListRow title="Partner preferences" onPress={() => router.push("/(app)/preferences")} />
          <ListRow title="Privacy" onPress={() => router.push("/(app)/privacy")} />
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
