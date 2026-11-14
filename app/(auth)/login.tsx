import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { errorMessage } from "@/api/client/errors";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { InlineNotice } from "@/components/ui/ScreenState";
import { Input } from "@/components/ui/Input";
import { Text } from "@/components/ui/Text";
import { useSignIn } from "@/hooks/useAuthActions";
import { loginSchema, type LoginValues } from "@/lib/validation";
import { spacing } from "@/theme/tokens";

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useSignIn();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await signIn.mutateAsync(values);
      router.replace("/(tabs)");
    } catch {
      // Surfaced below via mutation error.
    }
  });

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Return to your journey"
      subtitle="Sign in to see your kundli, matches and guidance."
      footer={
        <View style={{ alignItems: "center", gap: spacing.md }}>
          <Text variant="small" tone="muted">
            New to VedaMilan?
          </Text>
          <Button label="Create an account" variant="ghost" onPress={() => router.replace("/(auth)/register")} />
        </View>
      }
    >
      {signIn.isError ? (
        <InlineNotice tone="warning" body={errorMessage(signIn.error)} />
      ) : null}

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
            returnKeyType="next"
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
        name="password"
        render={({ field }) => (
          <Input
            label="Password"
            placeholder="Your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
            textContentType="password"
            returnKeyType="go"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => void onSubmit()}
            error={errors.password?.message}
            required
          />
        )}
      />

      <Button
        label="Sign in"
        variant="primary"
        size="lg"
        fullWidth
        loading={signIn.isPending || isSubmitting}
        onPress={onSubmit}
      />

      <Button
        label="Forgot your password?"
        variant="ghost"
        onPress={() => router.push("/(auth)/forgot-password")}
        style={{ alignSelf: "center" }}
      />
    </AuthShell>
  );
}
