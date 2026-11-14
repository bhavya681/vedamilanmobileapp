import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { Check } from "lucide-react-native";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, View } from "react-native";

import { errorMessage } from "@/api/client/errors";
import { WEB_URL } from "@/api/client/config";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InlineNotice } from "@/components/ui/ScreenState";
import { Text } from "@/components/ui/Text";
import { useSignUp } from "@/hooks/useAuthActions";
import { registerSchema, type RegisterValues } from "@/lib/validation";
import { useTheme } from "@/theme/ThemeProvider";
import { radii, spacing } from "@/theme/tokens";

export default function RegisterScreen() {
  const router = useRouter();
  const signUp = useSignUp();
  const { palette } = useTheme();
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      acceptedTerms: false as unknown as true,
    },
  });

  const accepted = watch("acceptedTerms");

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signUp.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
        phone: values.phone || undefined,
      });
      router.replace("/(onboarding)");
    } catch {
      // Surfaced below.
    }
  });

  return (
    <AuthShell
      eyebrow="Create account"
      title="A considered beginning"
      subtitle="A few essentials, then we will cast your Vedic birth chart."
      footer={
        <View style={{ alignItems: "center", gap: spacing.sm }}>
          <Text variant="small" tone="muted">
            Already have an account?
          </Text>
          <Button label="Sign in" variant="ghost" onPress={() => router.replace("/(auth)/login")} />
        </View>
      }
    >
      {signUp.isError ? <InlineNotice tone="warning" body={errorMessage(signUp.error)} /> : null}

      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            label="Full name"
            placeholder="As you would like it shown"
            autoCapitalize="words"
            autoComplete="name"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.name?.message}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.email?.message}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field }) => (
          <Input
            label="Phone"
            placeholder="Optional, with country code"
            keyboardType="phone-pad"
            autoComplete="tel"
            value={field.value ?? ""}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.phone?.message}
            hint="Used only for account security and important updates."
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Input
            label="Password"
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
            hint="Use a mix of letters and numbers."
            required
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <Input
            label="Confirm password"
            placeholder="Re-enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => void onSubmit()}
            error={errors.confirmPassword?.message}
            required
          />
        )}
      />

      <Pressable
        onPress={() => setValue("acceptedTerms", (!accepted) as true, { shouldValidate: true })}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: Boolean(accepted) }}
        accessibilityLabel="Accept terms and privacy policy"
        style={{ flexDirection: "row", gap: spacing.md, alignItems: "flex-start" }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            borderRadius: radii.xs,
            borderWidth: 1.5,
            borderColor: accepted ? palette.gold : palette.borderStrong,
            backgroundColor: accepted ? palette.gold : "transparent",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 1,
          }}
        >
          {accepted ? <Check size={14} color={palette.onAccent} /> : null}
        </View>
        <Text variant="small" tone="muted" style={{ flex: 1 }}>
          I agree to the{" "}
          <Text
            variant="small"
            tone="gold"
            onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/terms`)}
          >
            Terms of Service
          </Text>{" "}
          and{" "}
          <Text
            variant="small"
            tone="gold"
            onPress={() => void WebBrowser.openBrowserAsync(`${WEB_URL}/privacy`)}
          >
            Privacy Policy
          </Text>
          .
        </Text>
      </Pressable>
      {errors.acceptedTerms?.message ? (
        <Text variant="caption" tone="ruby">
          {errors.acceptedTerms.message}
        </Text>
      ) : null}

      <Button
        label="Create account"
        variant="gold"
        size="lg"
        fullWidth
        loading={signUp.isPending || isSubmitting}
        onPress={onSubmit}
      />
    </AuthShell>
  );
}
