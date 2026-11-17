import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { MapPin, Navigation, Sparkles } from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { format } from "date-fns";

import { errorMessage } from "@/api/client/errors";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Chip } from "@/components/ui/Chip";
import { Input } from "@/components/ui/Input";
import { InlineNotice } from "@/components/ui/ScreenState";
import { Text } from "@/components/ui/Text";
import { DateField } from "@/components/forms/DateField";
import { TimeField } from "@/components/forms/TimeField";
import { Stepper } from "@/components/onboarding/Stepper";
import { useProfileBundle, useSaveBirthDetails, useUpdateProfile } from "@/hooks/useProfile";
import { useToast } from "@/components/feedback/ToastProvider";
import { AYANAMSHA_OPTIONS, CHART_STYLE_OPTIONS, DISCLAIMER, GENDER_OPTIONS } from "@/lib/constants";
import { useTheme } from "@/theme/ThemeProvider";
import { spacing } from "@/theme/tokens";

const STEPS = ["About you", "Birth moment", "Birth place", "Review"];

export default function OnboardingScreen() {
  const router = useRouter();
  const { palette } = useTheme();
  const toast = useToast();
  const bundle = useProfileBundle(true);
  const updateProfile = useUpdateProfile();
  const saveBirth = useSaveBirthDetails();

  const [step, setStep] = useState(0);
  const [gender, setGender] = useState<string>("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<Date | null>(null);
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [placeName, setPlaceName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [ayanamsha, setAyanamsha] = useState("LAHIRI");
  const [chartStyle, setChartStyle] = useState<"NORTH" | "SOUTH" | "EAST">("NORTH");
  const [locating, setLocating] = useState(false);
  const [manualOpen, setManualOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!bundle.data) return;
    const { profile, birthDetails } = bundle.data;
    if (profile.gender) setGender(profile.gender);
    if (profile.city) setCity(profile.city);
    if (profile.state) setState(profile.state);
    if (profile.country) setCountry(profile.country);
    if (birthDetails) {
      if (birthDetails.birthDate) setBirthDate(new Date(`${birthDetails.birthDate}T00:00:00`));
      if (birthDetails.birthTime) {
        const [h, m] = birthDetails.birthTime.split(":");
        const d = new Date();
        d.setHours(Number(h ?? 12), Number(m ?? 0), 0, 0);
        setBirthTime(d);
      }
      setTimeUnknown(Boolean(birthDetails.birthTimeUnknown));
      setPlaceName(birthDetails.placeName ?? "");
      setLatitude(String(birthDetails.latitude ?? ""));
      setLongitude(String(birthDetails.longitude ?? ""));
      setTimezone(birthDetails.timezone ?? "Asia/Kolkata");
      if (birthDetails.ayanamsha) setAyanamsha(birthDetails.ayanamsha);
      if (birthDetails.chartStylePreference) setChartStyle(birthDetails.chartStylePreference);
    }
  }, [bundle.data]);

  const summary = useMemo(
    () => ({
      date: birthDate ? format(birthDate, "d MMMM yyyy") : "—",
      time: timeUnknown ? "Time unknown (12:00 used)" : birthTime ? format(birthTime, "h:mm a") : "—",
      place: placeName || "—",
      coords:
        latitude && longitude ? `${Number(latitude).toFixed(3)}, ${Number(longitude).toFixed(3)}` : "—",
      timezone,
    }),
    [birthDate, birthTime, timeUnknown, placeName, latitude, longitude, timezone],
  );

  const validateStep = (index: number): boolean => {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (!gender) next.gender = "Choose an option to continue";
      if (city.trim().length < 2) next.city = "Enter your current city";
    }
    if (index === 1) {
      if (!birthDate) next.birthDate = "Choose your birth date";
      if (!timeUnknown && !birthTime) next.birthTime = "Choose your birth time";
    }
    if (index === 2) {
      if (placeName.trim().length < 2) next.placeName = "Enter your birth city";
      const lat = Number(latitude);
      const lng = Number(longitude);
      if (!Number.isFinite(lat) || Math.abs(lat) > 90) next.latitude = "Enter a valid latitude";
      if (!Number.isFinite(lng) || Math.abs(lng) > 180) next.longitude = "Enter a valid longitude";
      if (timezone.trim().length < 3) next.timezone = "Enter the birth timezone";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const goNext = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const detectCurrentLocation = async () => {
    setLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        toast.show("Location permission is needed to detect your city.", "error");
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setLatitude(position.coords.latitude.toFixed(4));
      setLongitude(position.coords.longitude.toFixed(4));
      const detected = [address?.city ?? address?.subregion, address?.region, address?.country]
        .filter(Boolean)
        .join(", ");
      if (detected) setPlaceName(detected);
      const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (deviceTz) setTimezone(deviceTz);
      toast.show("Location captured. Adjust the timezone if you were born elsewhere.", "success");
    } catch {
      toast.show("Could not detect location. You can enter coordinates manually.", "error");
      setManualOpen(true);
    } finally {
      setLocating(false);
    }
  };

  const finish = async () => {
    if (!birthDate || (!birthTime && !timeUnknown)) {
      setStep(1);
      return;
    }
    for (let i = 0; i < STEPS.length - 1; i += 1) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }
    try {
      const dateOfBirth = format(birthDate, "yyyy-MM-dd");
      await updateProfile.mutateAsync({
        gender: gender as "MALE" | "FEMALE" | "OTHER" | "UNDISCLOSED",
        dateOfBirth,
        city: city.trim(),
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        completeOnboarding: true,
      });
      await saveBirth.mutateAsync({
        birthDate: dateOfBirth,
        birthTime: timeUnknown ? "12:00" : format(birthTime ?? new Date(), "HH:mm"),
        birthTimeUnknown: timeUnknown,
        placeName: placeName.trim(),
        latitude: Number(latitude),
        longitude: Number(longitude),
        timezone: timezone.trim(),
        ayanamsha,
        chartStylePreference: chartStyle,
      });
      toast.show("Your chart is ready. Welcome to VedaMilan.", "success");
      router.replace("/(tabs)");
    } catch (error) {
      toast.show(errorMessage(error), "error");
    }
  };

  const busy = updateProfile.isPending || saveBirth.isPending;

  if (bundle.isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={palette.gold} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: palette.canvas }} edges={["top", "left", "right", "bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Stepper steps={STEPS} current={step} />

          <View style={{ marginTop: spacing.xl, gap: spacing.sm }}>
            <Text variant="display">
              {step === 0 && "Let us begin with you"}
              {step === 1 && "The moment you arrived"}
              {step === 2 && "Where the sky met the earth"}
              {step === 3 && "Your chart is ready to be cast"}
            </Text>
            <Text variant="body" tone="muted">
              {step === 0 && "These details shape how we introduce you to compatible members."}
              {step === 1 && "An exact birth time gives a precise Ascendant, houses and dasha timeline."}
              {step === 2 && "Birth coordinates determine the rising sign and house cusps."}
              {step === 3 && "Review once, then we will calculate your Vedic chart on our server."}
            </Text>
          </View>

          <View style={{ marginTop: spacing.xxl, gap: spacing.lg }}>
            {step === 0 ? (
              <>
                <View style={{ gap: spacing.sm }}>
                  <Text variant="label" tone="muted">
                    I identify as
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {GENDER_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        selected={gender === opt.value}
                        onPress={() => setGender(opt.value)}
                      />
                    ))}
                  </View>
                  {errors.gender ? (
                    <Text variant="caption" tone="ruby">
                      {errors.gender}
                    </Text>
                  ) : null}
                </View>
                <Input
                  label="Current city"
                  placeholder="Mumbai"
                  value={city}
                  onChangeText={setCity}
                  error={errors.city}
                  required
                />
                <View style={{ flexDirection: "row", gap: spacing.md }}>
                  <Input
                    label="State / region"
                    placeholder="Maharashtra"
                    value={state}
                    onChangeText={setState}
                    containerStyle={{ flex: 1 }}
                  />
                  <Input
                    label="Country"
                    placeholder="India"
                    value={country}
                    onChangeText={setCountry}
                    containerStyle={{ flex: 1 }}
                  />
                </View>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <DateField
                  label="Birth date"
                  value={birthDate}
                  onChange={setBirthDate}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  error={errors.birthDate}
                  required
                />
                {!timeUnknown ? (
                  <TimeField
                    label="Birth time"
                    value={birthTime}
                    onChange={setBirthTime}
                    error={errors.birthTime}
                    required
                    hint="Use the time on your birth certificate or hospital record if available."
                  />
                ) : null}
                <Pressable
                  onPress={() => setTimeUnknown((v) => !v)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: timeUnknown }}
                  style={{ flexDirection: "row", gap: spacing.sm, alignItems: "center", minHeight: 36 }}
                >
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      borderWidth: 1.5,
                      borderColor: timeUnknown ? palette.gold : palette.borderStrong,
                      backgroundColor: timeUnknown ? palette.gold : "transparent",
                    }}
                  />
                  <Text variant="small" tone="muted">
                    I do not know my exact birth time
                  </Text>
                </Pressable>
                {timeUnknown ? (
                  <InlineNotice
                    tone="warning"
                    body="We will use 12:00 noon. Your Moon sign and nakshatra remain reliable; Ascendant and house-based insights become approximate."
                  />
                ) : null}
              </>
            ) : null}

            {step === 2 ? (
              <>
                <Button
                  label={locating ? "Detecting location…" : "Use my current location"}
                  variant="secondary"
                  icon={<Navigation size={16} color={palette.gold} />}
                  onPress={() => void detectCurrentLocation()}
                  loading={locating}
                />
                <Input
                  label="Birth city"
                  placeholder="City, region, country"
                  value={placeName}
                  onChangeText={setPlaceName}
                  error={errors.placeName}
                  required
                  hint="You may refine the place name after detecting coordinates."
                />
                <Pressable onPress={() => setManualOpen((v) => !v)} accessibilityRole="button">
                  <Text variant="caption" tone="gold">
                    {manualOpen ? "Hide coordinates" : "Enter coordinates manually"}
                  </Text>
                </Pressable>
                {manualOpen ? (
                  <>
                    <View style={{ flexDirection: "row", gap: spacing.md }}>
                      <Input
                        label="Latitude"
                        placeholder="19.0760"
                        keyboardType="numbers-and-punctuation"
                        value={latitude}
                        onChangeText={setLatitude}
                        error={errors.latitude}
                        containerStyle={{ flex: 1 }}
                        required
                      />
                      <Input
                        label="Longitude"
                        placeholder="72.8777"
                        keyboardType="numbers-and-punctuation"
                        value={longitude}
                        onChangeText={setLongitude}
                        error={errors.longitude}
                        containerStyle={{ flex: 1 }}
                        required
                      />
                    </View>
                    <Input
                      label="Timezone"
                      placeholder="Asia/Kolkata"
                      autoCapitalize="none"
                      value={timezone}
                      onChangeText={setTimezone}
                      error={errors.timezone}
                      hint="IANA timezone of the birth place at the time of birth."
                      required
                    />
                  </>
                ) : null}
              </>
            ) : null}

            {step === 3 ? (
              <>
                <Card tone="gold" style={{ gap: spacing.md }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <Sparkles size={16} color={palette.gold} />
                    <Text variant="label">Birth summary</Text>
                  </View>
                  {[
                    ["Date", summary.date],
                    ["Time", summary.time],
                    ["Place", summary.place],
                    ["Coordinates", summary.coords],
                    ["Timezone", summary.timezone],
                  ].map(([label, value]) => (
                    <View key={label} style={{ flexDirection: "row", justifyContent: "space-between", gap: spacing.md }}>
                      <Text variant="small" tone="muted">
                        {label}
                      </Text>
                      <Text variant="small" style={{ flex: 1, textAlign: "right" }} numberOfLines={2}>
                        {value}
                      </Text>
                    </View>
                  ))}
                </Card>

                <View style={{ gap: spacing.sm }}>
                  <Text variant="label" tone="muted">
                    Ayanamsha
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {AYANAMSHA_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        selected={ayanamsha === opt.value}
                        onPress={() => setAyanamsha(opt.value)}
                      />
                    ))}
                  </View>
                </View>

                <View style={{ gap: spacing.sm }}>
                  <Text variant="label" tone="muted">
                    Chart style
                  </Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
                    {CHART_STYLE_OPTIONS.map((opt) => (
                      <Chip
                        key={opt.value}
                        label={opt.label}
                        selected={chartStyle === opt.value}
                        onPress={() => setChartStyle(opt.value as "NORTH" | "SOUTH" | "EAST")}
                      />
                    ))}
                  </View>
                </View>

                <InlineNotice body={DISCLAIMER} />
                {saveBirth.isError ? <InlineNotice tone="warning" body={errorMessage(saveBirth.error)} /> : null}
              </>
            ) : null}
          </View>

          <View style={{ flexDirection: "row", gap: spacing.md, marginTop: spacing.xxxl }}>
            {step > 0 ? (
              <Button label="Back" variant="secondary" onPress={() => setStep((s) => Math.max(0, s - 1))} />
            ) : null}
            <Button
              label={step === STEPS.length - 1 ? "Cast my chart" : "Continue"}
              variant="gold"
              size="lg"
              loading={busy}
              onPress={step === STEPS.length - 1 ? () => void finish() : goNext}
              style={{ flex: 1 }}
            />
          </View>

          <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs, justifyContent: "center", marginTop: spacing.lg }}>
            <MapPin size={12} color={palette.textFaint} />
            <Text variant="micro" tone="faint">
              Your birth details stay private until you choose to share summaries.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.giant,
  },
});
