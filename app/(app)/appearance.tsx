import { Check, RotateCcw } from "lucide-react-native";
import React from "react";
import { Pressable, Switch, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useAppearanceController } from "@/hooks/useAppearance";
import {
  ACCENT_OVERRIDES,
  BORDER_INTENSITIES,
  EXPRESSION_OPTIONS,
  THEME_PRESETS,
} from "@/theme/presets";
import { colors, withAlpha } from "@/theme/colors";
import { radii, spacing } from "@/theme/tokens";

const MODES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
] as const;

export default function AppearanceScreen() {
  const appearance = useAppearanceController();
  const { palette, theme, mode, expression, accentOverride, borderIntensity, reducedMotion } = appearance;
  const activePreset = THEME_PRESETS.find((preset) => preset.id === theme) ?? THEME_PRESETS[0]!;

  return (
    <Screen title="Appearance" subtitle="Make VedaMilan feel like yours" showBack>
      <View style={{ gap: spacing.lg }}>
        <Card tone="gold" style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: palette.border,
                flexDirection: "row",
              }}
            >
              {activePreset.swatches.map((swatch) => (
                <View key={swatch} style={{ flex: 1, backgroundColor: swatch }} />
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="micro" tone="faint" style={{ letterSpacing: 1.2 }}>
                ACTIVE THEME
              </Text>
              <Text variant="title">{activePreset.name}</Text>
              <Text variant="caption" tone="muted">
                {mode === "system" ? "Following system" : `${mode === "dark" ? "Dark" : "Light"} mode`} ·{" "}
                {expression} expression
              </Text>
            </View>
          </View>
          <Text variant="caption" tone="muted">
            {activePreset.description}
          </Text>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Mode" subtitle="Light, dark, or match your device" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {MODES.map((option) => (
              <Chip
                key={option.id}
                label={option.label}
                selected={mode === option.id}
                onPress={() => appearance.update({ mode: option.id })}
              />
            ))}
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Theme presets" subtitle="Curated palettes from VedaMilan's design system" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.md }}>
            {THEME_PRESETS.map((preset) => {
              const selected = theme === preset.id;
              return (
                <Pressable
                  key={preset.id}
                  onPress={() => appearance.update({ theme: preset.id })}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${preset.name} theme`}
                  style={{
                    flexGrow: 1,
                    flexBasis: "46%",
                    gap: spacing.sm,
                    padding: spacing.sm + 2,
                    borderRadius: radii.lg,
                    borderWidth: selected ? 1.5 : 1,
                    borderColor: selected ? palette.gold : palette.border,
                    backgroundColor: selected ? withAlpha(palette.gold, 0.08) : palette.raised,
                  }}
                >
                  <View
                    style={{
                      height: 34,
                      borderRadius: radii.md,
                      overflow: "hidden",
                      flexDirection: "row",
                      borderWidth: 1,
                      borderColor: palette.border,
                    }}
                  >
                    {preset.swatches.map((swatch) => (
                      <View key={swatch} style={{ flex: 1, backgroundColor: swatch }} />
                    ))}
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text variant="small" weight="semibold" style={{ flex: 1 }}>
                      {preset.name}
                    </Text>
                    {selected ? <Check size={14} color={palette.gold} /> : null}
                  </View>
                  <Text variant="micro" tone="faint" numberOfLines={3}>
                    {preset.description}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader
            title="Personal expression"
            subtitle="Applies a tint to the classic Veda Gold theme only — curated themes stay pure."
          />
          <View style={{ gap: spacing.sm }}>
            {EXPRESSION_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => appearance.update({ expression: option.id })}
                accessibilityRole="button"
                accessibilityState={{ selected: expression === option.id }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: spacing.md,
                  padding: spacing.md,
                  borderRadius: radii.lg,
                  borderWidth: expression === option.id ? 1.5 : 1,
                  borderColor: expression === option.id ? palette.gold : palette.border,
                  backgroundColor:
                    expression === option.id ? withAlpha(palette.gold, 0.08) : palette.sunken,
                }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    borderWidth: 2,
                    borderColor: expression === option.id ? palette.gold : palette.borderStrong,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {expression === option.id ? (
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: palette.gold }} />
                  ) : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="body" weight="semibold">
                    {option.name}
                  </Text>
                  <Text variant="caption" tone="muted">
                    {option.description}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Accent override" subtitle="Override the preset's primary accent" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            <Chip
              label="Theme default"
              selected={!accentOverride}
              onPress={() => appearance.update({ accentOverride: null })}
            />
            {ACCENT_OVERRIDES.map((accent) => (
              <Chip
                key={accent.id}
                label={accent.name}
                selected={accentOverride === accent.id}
                onPress={() => appearance.update({ accentOverride: accent.id })}
              />
            ))}
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Border intensity" subtitle="Subtle, balanced, or defined separation" />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {BORDER_INTENSITIES.map((intensity) => (
              <Chip
                key={intensity.id}
                label={intensity.name}
                selected={borderIntensity === intensity.id}
                onPress={() => appearance.update({ borderIntensity: intensity.id })}
              />
            ))}
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text variant="body" weight="semibold">
                Reduce motion
              </Text>
              <Text variant="caption" tone="muted">
                Minimise decorative transitions and animation.
              </Text>
            </View>
            <Switch
              value={reducedMotion}
              onValueChange={(value) => appearance.update({ reducedMotion: value })}
              trackColor={{ false: palette.sunken, true: withAlpha(colors.royalGold, 0.55) }}
              thumbColor={reducedMotion ? palette.gold : palette.textFaint}
              accessibilityLabel="Reduce motion"
            />
          </View>
        </Card>

        <View style={{ gap: spacing.sm, alignItems: "center" }}>
          <Text variant="caption" tone={appearance.saveError ? "ruby" : "faint"} align="center">
            {appearance.saveError
              ? "Saved on this device. We'll sync to your account when the connection returns."
              : appearance.saving
                ? "Saving to your account…"
                : "Appearance is saved to this device and your VedaMilan account."}
          </Text>
          <Button
            label="Reset to defaults"
            variant="outline"
            size="sm"
            icon={<RotateCcw size={15} color={palette.text} />}
            onPress={appearance.reset}
          />
        </View>
      </View>
    </Screen>
  );
}
