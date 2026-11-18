import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { errorMessage } from "@/api/client/errors";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InlineNotice } from "@/components/ui/ScreenState";
import { Text } from "@/components/ui/Text";
import { useResetPassword } from "@/hooks/useAuthActions";
import { resetSchema, type ResetValues } from "@/lib/validation";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string }>();
  const reset = useResetPassword();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: params.email ?? "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await reset.mutateAsync({ email: values.email, otp: values.otp, password: values.password });
      router.replace({ pathname: "/(auth)/login", params: { reset: "1" } });
    } catch {
      // Surfaced below.
    }
  });

  return (
    <AuthShell
      eyebrow="Almost there"
      title="Set a new password"
      subtitle="Enter the code from your email and choose a strong new password."
    >
      {reset.isError ? <InlineNotice tone="warning" body={errorMessage(reset.error)} /> : null}

      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
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
        name="otp"
        render={({ field }) => (
          <Input
            label="One-time code"
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            maxLength={8}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.otp?.message}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Input
            label="New password"
            placeholder="At least 8 characters"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            error={errors.password?.message}
            required
          />
        )}
      />

      <Controller
        control={control}
        name="confirmPassword"
        render={({ field }) => (
          <Input
            label="Confirm new password"
            placeholder="Re-enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            value={field.value}
            onChangeText={field.onChange}
            onSubmitEditing={() => void onSubmit()}
            onBlur={field.onBlur}
            error={errors.confirmPassword?.message}
            required
          />
        )}
      />

      <Button
        label="Reset password"
        variant="primary"
        size="lg"
        fullWidth
        loading={reset.isPending}
        onPress={onSubmit}
      />

      <View style={{ alignItems: "center" }}>
        <Text variant="small" tone="muted">
          Need a new code?
        </Text>
        <Button
          label="Start over"
          variant="ghost"
          onPress={() => router.replace("/(auth)/forgot-password")}
        />
      </View>
    </AuthShell>
  );
}
