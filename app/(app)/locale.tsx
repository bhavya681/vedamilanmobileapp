import React, { useState } from "react";
import { View } from "react-native";

import type { AppLocale, BillingCurrency, LocaleSettings } from "@/api/endpoints/profile";
import { useToast } from "@/components/feedback/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useLocaleSettings, useSaveLocaleSettings } from "@/hooks/useLocale";
import { spacing } from "@/theme/tokens";

const LOCALES: { id: AppLocale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "hi", label: "हिन्दी" },
  { id: "sa", label: "संस्कृतम्" },
  { id: "mr", label: "मराठी" },
  { id: "es", label: "Español" },
  { id: "pt", label: "Português" },
  { id: "fr", label: "Français" },
  { id: "ar", label: "العربية" },
  { id: "de", label: "Deutsch" },
  { id: "bn", label: "বাংলা" },
  { id: "ta", label: "தமிழ்" },
];

const DATE_FORMATS: { id: LocaleSettings["dateFormat"]; label: string }[] = [
  { id: "locale", label: "Locale" },
  { id: "DMY", label: "D M Y" },
  { id: "MDY", label: "M D Y" },
  { id: "YMD", label: "Y M D" },
];

const TIME_FORMATS: { id: LocaleSettings["timeFormat"]; label: string }[] = [
  { id: "12h", label: "12-hour" },
  { id: "24h", label: "24-hour" },
];

const CURRENCIES: BillingCurrency[] = ["INR", "USD", "EUR", "GBP", "AED", "CAD", "AUD", "SGD"];

export default function LocaleScreen() {
  const toast = useToast();
  const query = useLocaleSettings();
  const save = useSaveLocaleSettings();
  const [draft, setDraft] = useState<Partial<LocaleSettings>>({});
  const server = query.data?.localization;
  const form: LocaleSettings | null = server ? { ...server, ...draft } : null;

  const patch = (next: Partial<LocaleSettings>) => {
    setDraft((current) => ({ ...current, ...next }));
  };

  const submit = async () => {
    if (!form) return;
    try {
      await save.mutateAsync(form);
      setDraft({});
      toast.show("Language and region preferences saved.", "success");
    } catch {
      toast.show("Could not save those preferences. Please try again.", "error");
    }
  };

  return (
    <Screen title="Language & region" subtitle="Dates, time, currency, and AI replies" showBack>
      {query.isError ? (
        <ErrorState error={query.error} onRetry={() => query.refetch()} />
      ) : query.isLoading || !form ? (
        <LoadingState variant="detail" />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="App language" subtitle="Interface language" />
            <Text variant="body">English</Text>
            <Text variant="caption" tone="faint">
              Additional interface languages are rolling out. Your AI replies can already use another language.
            </Text>
          </Card>

          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="AI reply language" subtitle="Used for gurus, translations, and readings" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              <Chip label="Auto" selected={!form.aiLanguage} onPress={() => patch({ aiLanguage: null })} />
              {LOCALES.map((locale) => (
                <Chip
                  key={locale.id}
                  label={locale.label}
                  selected={form.aiLanguage === locale.id}
                  onPress={() => patch({ aiLanguage: locale.id })}
                />
              ))}
            </View>
          </Card>

          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Region & timezone" />
            <Input
              label="Region code"
              value={form.region}
              onChangeText={(value) => patch({ region: value.toUpperCase().slice(0, 8) })}
              autoCapitalize="characters"
              maxLength={8}
              hint="ISO country or region code, e.g. IN or US."
            />
            <Input
              label="Timezone"
              value={form.timezone}
              onChangeText={(value) => patch({ timezone: value })}
              autoCapitalize="none"
              maxLength={64}
              hint="IANA timezone, e.g. Asia/Kolkata."
            />
          </Card>

          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Date format" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {DATE_FORMATS.map((format) => (
                <Chip
                  key={format.id}
                  label={format.label}
                  selected={form.dateFormat === format.id}
                  onPress={() => patch({ dateFormat: format.id })}
                />
              ))}
            </View>
            <SectionHeader title="Time format" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {TIME_FORMATS.map((format) => (
                <Chip
                  key={format.id}
                  label={format.label}
                  selected={form.timeFormat === format.id}
                  onPress={() => patch({ timeFormat: format.id })}
                />
              ))}
            </View>
          </Card>

          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Currency" subtitle="Display and billing currency" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
              {CURRENCIES.map((currency) => (
                <Chip
                  key={currency}
                  label={currency}
                  selected={form.currency === currency}
                  onPress={() => patch({ currency })}
                />
              ))}
            </View>
          </Card>

          <Button label="Save preferences" variant="gold" loading={save.isPending} onPress={() => void submit()} />
        </View>
      )}
    </Screen>
  );
}
