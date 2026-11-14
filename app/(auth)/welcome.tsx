import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Sparkles, Star, HeartHandshake } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LogoMark, Wordmark } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Text } from "@/components/ui/Text";
import { useTheme } from "@/theme/ThemeProvider";
import { DISCLAIMER } from "@/lib/constants";
import { radii, spacing } from "@/theme/tokens";

const PILLARS = [
  {
    icon: Star,
    title: "Vedic Kundli, precisely cast",
    body: "Lahiri ayanamsha, whole-sign charts, dashas, yogas and doshas — calculated on our server.",
  },
  {
    icon: HeartHandshake,
    title: "Compatibility with depth",
    body: "Ashtakoota guna matching, Manglik balance and AI-guided marriage timing.",
  },
  {
    icon: Sparkles,
    title: "Guidance you can trust",
    body: "A Vedic AI guide that explains, never dictates — grounded in your own chart.",
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const { palette, scheme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: palette.canvas }}>
      <LinearGradient
        colors={scheme === "dark" ? ["#1A140C", palette.canvas] : ["#F3E4C4", palette.canvas]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right", "bottom"]}>
        <View style={styles.content}>
          <View style={{ alignItems: "center", gap: spacing.md }}>
            <LogoMark size={88} />
            <Wordmark size="lg" />
            <Text variant="bodyLg" tone="muted" align="center" style={{ maxWidth: 320 }}>
              Where Vedic wisdom meets modern matchmaking — thoughtfully, privately, and with real
              astrology behind every insight.
            </Text>
          </View>

          <View style={{ gap: spacing.lg, marginTop: spacing.xxxl }}>
            {PILLARS.map(({ icon: Icon, title, body }) => (
              <View key={title} style={styles.pillar}>
                <View style={[styles.pillarIcon, { backgroundColor: `${palette.goldSoft}1A`, borderColor: `${palette.goldSoft}40` }]}>
                  <Icon size={18} color={palette.gold} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="label">{title}</Text>
                  <Text variant="small" tone="muted">
                    {body}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={{ gap: spacing.md, marginTop: spacing.xxxl }}>
            <Button
              label="Begin your journey"
              variant="gold"
              size="lg"
              fullWidth
              onPress={() => router.push("/(auth)/register")}
            />
            <Button
              label="I already have an account"
              variant="secondary"
              size="lg"
              fullWidth
              onPress={() => router.push("/(auth)/login")}
            />
            <Text variant="micro" tone="faint" align="center" style={{ paddingHorizontal: spacing.lg }}>
              {DISCLAIMER}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.giant,
    paddingBottom: spacing.lg,
    justifyContent: "center",
  },
  pillar: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start",
  },
  pillarIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
