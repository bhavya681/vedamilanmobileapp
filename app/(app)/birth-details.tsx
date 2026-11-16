import { useRouter } from "expo-router";
import { MapPin, Navigation } from "lucide-react-native";
import React, { useMemo, useState } from "react";
import { Pressable, View } from "react-native";
import { format } from "date-fns";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { DateField } from "@/components/forms/DateField";
import { TimeField } from "@/components/forms/TimeField";
import { useProfileBundle, useSaveBirthDetails } from "@/hooks/useProfile";
import { useToast } from "@/components/feedback/ToastProvider";
import { AYANAMSHA_OPTIONS, CHART_STYLE_OPTIONS, DISCLAIMER } from "@/lib/constants";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";
import type { BirthDetails } from "@/api/types/models";

export default function BirthDetailsScreen() {
  const bundle = useProfileBundle();

  if (bundle.isLoading) {
    return (
      <Screen title="Birth details" showBack>
        <LoadingState variant="detail" />
      </Screen>
    );
  }

  return (
    <BirthDetailsForm
      key={bundle.data?.birthDetails?.birthDate ?? "new"}
      existing={bundle.data?.birthDetails ?? undefined}
    />
  );
}

function BirthDetailsForm({ existing }: { existing?: BirthDetails }) {
  const { palette } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const save = useSaveBirthDetails();

  const [birthDate, setBirthDate] = useState<Date | null>(
    existing?.birthDate ? new Date(existing.birthDate) : null,
  );
  const [birthTime, setBirthTime] = useState<Date | null>(
    existing?.birthTime ? new Date(`2000-01-01T${existing.birthTime}`) : null,
  );
  const [timeUnknown, setTimeUnknown] = useState(existing?.birthTimeUnknown ?? false);
  const [placeName, setPlaceName] = useState(existing?.placeName ?? "");
  const [latitude, setLatitude] = useState(existing?.latitude?.toString() ?? "");
  const [longitude, setLongitude] = useState(existing?.longitude?.toString() ?? "");
  const [timezone, setTimezone] = useState(
    existing?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? "Asia/Kolkata",
  );
  const [ayanamsha, setAyanamsha] = useState(existing?.ayanamsha ?? "LAHIRI");
  const [chartStyle, setChartStyle] = useState<"NORTH" | "SOUTH" | "EAST">(
    existing?.chartStylePreference ?? "NORTH",
  );
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(
    () => Boolean(birthDate && placeName.trim() && latitude && longitude && timezone && (timeUnknown || birthTime)),
    [birthDate, placeName, latitude, longitude, timezone, timeUnknown, birthTime],
  );

  const detectLocation = async () => {
    setLocating(true);
    try {
      const Location = await import("expo-location");
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        toast.show("Location permission was declined. Enter coordinates manually.", "error");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude: lat, longitude: lon } = position.coords;
      setLatitude(lat.toFixed(4));
      setLongitude(lon.toFixed(4));
      const places = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon }).catch(() => []);
      const place = places[0];
      if (place) {
        const label = [place.city ?? place.subregion, place.region, place.country].filter(Boolean).join(", ");
        if (label) setPlaceName(label);
      }
    } catch {
      toast.show("We could not read your location. Enter it manually.", "error");
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    setError(null);
    if (!birthDate || !placeName.trim() || !latitude || !longitude || !timezone) {
      setError("Please complete every required field.");
      return;
    }
    if (!timeUnknown && !birthTime) {
      setError("Add your birth time, or mark it as unknown.");
      return;
    }
    const lat = Number(latitude);
    const lon = Number(longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lon) || lon < -180 || lon > 180) {
      setError("Latitude must be −90…90 and longitude −180…180.");
      return;
    }
    try {
      await save.mutateAsync({
        birthDate: format(birthDate, "yyyy-MM-dd"),
        birthTime: timeUnknown || !birthTime ? "12:00" : format(birthTime, "HH:mm"),
        birthTimeUnknown: timeUnknown,
        placeName: placeName.trim(),
        latitude: lat,
        longitude: lon,
        timezone,
        ayanamsha,
        chartStylePreference: chartStyle,
      });
      toast.show("Birth details saved. Your chart will refresh.", "success");
      router.back();
    } catch {
      setError("We could not save your birth details. Please try again.");
    }
  };

  return (
    <Screen title="Birth details" subtitle="Astrology accuracy depends on exact time and place" showBack>
      <View style={{ gap: spacing.lg }}>
        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="When you were born" />
          <DateField
            label="Date of birth"
            value={birthDate}
            onChange={setBirthDate}
            maximumDate={new Date()}
            required
          />
          <TimeField label="Time of birth" value={birthTime} onChange={setBirthTime} hint={timeUnknown ? "Using 12:00 noon as a placeholder." : undefined} />
          <Pressable
            onPress={() => setTimeUnknown((v) => !v)}
            style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 40 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: timeUnknown }}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: 6,
                borderWidth: 1.5,
                borderColor: timeUnknown ? palette.gold : palette.borderStrong,
                backgroundColor: timeUnknown ? palette.gold : "transparent",
              }}
            />
            <Text variant="small" tone="muted">
              I don't know my birth time
            </Text>
          </Pressable>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Where you were born" />
          <Input
            label="Place"
            value={placeName}
            onChangeText={setPlaceName}
            placeholder="City, state, country"
            autoCapitalize="words"
          />
          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Input
              label="Latitude"
              value={latitude}
              onChangeText={setLatitude}
              keyboardType="numbers-and-punctuation"
              containerStyle={{ flex: 1 }}
            />
            <Input
              label="Longitude"
              value={longitude}
              onChangeText={setLongitude}
              keyboardType="numbers-and-punctuation"
              containerStyle={{ flex: 1 }}
            />
          </View>
          <Input label="Timezone" value={timezone} onChangeText={setTimezone} autoCapitalize="words" />
          <Button
            label={locating ? "Detecting…" : "Use current location"}
            variant="secondary"
            size="sm"
            icon={locating ? undefined : <Navigation size={16} color={palette.text} />}
            loading={locating}
            onPress={detectLocation}
          />
          <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
            <MapPin size={14} color={palette.textFaint} />
            <Text variant="caption" tone="faint">
              Coordinates drive the house cusps. Double-check them.
            </Text>
          </View>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Calculation settings" subtitle="Applied when your chart is regenerated" />
          <Text variant="label" tone="muted">
            Ayanamsha
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {AYANAMSHA_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={ayanamsha === option.value}
                onPress={() => setAyanamsha(option.value)}
              />
            ))}
          </View>
          <Text variant="label" tone="muted">
            Chart style
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
            {CHART_STYLE_OPTIONS.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={chartStyle === option.value}
                onPress={() => setChartStyle(option.value)}
              />
            ))}
          </View>
        </Card>

        {error ? (
          <Text variant="small" tone="ruby">
            {error}
          </Text>
        ) : null}
        <Button label="Save birth details" variant="gold" loading={save.isPending} disabled={!canSave} onPress={submit} />
        <Text variant="caption" tone="faint">
          {DISCLAIMER}
        </Text>
      </View>
    </Screen>
  );
}
