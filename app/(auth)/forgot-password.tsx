import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { View } from "react-native";

import { errorMessage } from "@/api/client/errors";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { InlineNotice } from "@/components/ui/ScreenState";
import { Text } from "@/components/ui/Text";
import { useRequestPasswordReset } from "@/hooks/useAuthActions";
import { forgotSchema, type ForgotValues } from "@/lib/validation";
import { spacing } from "@/theme/tokens";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const request = useRequestPasswordReset();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await request.mutateAsync(values.email);
      setSentTo(values.email);
    } catch {
      // Surfaced below.
    }
  });

  if (sentTo) {
    return (
      <AuthShell
        eyebrow="Check your inbox"
        title="Reset code sent"
        subtitle={`If an account exists for ${sentTo}, a one-time code is on its way. Codes expire quickly for your safety.`}
      >
        <InlineNotice
          body="Enter the code on the next screen together with your new password. Check spam if it does not arrive within a minute."
        />
        <Button
          label="Enter reset code"
          variant="gold"
          size="lg"
          fullWidth
          onPress={() =>
            router.replace({ pathname: "/(auth)/reset-password", params: { email: sentTo } })
          }
        />
        <Button
          label="Use a different email"
          variant="ghost"
          onPress={() => setSentTo(null)}
          style={{ alignSelf: "center" }}
        />
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Forgot your password?"
      subtitle="We will email you a one-time code to reset it securely."
    >
      {request.isError ? <InlineNotice tone="warning" body={errorMessage(request.error)} /> : null}

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
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            onSubmitEditing={() => void onSubmit()}
            error={errors.email?.message}
            required
          />
        )}
      />

      <Button
        label="Send reset code"
        variant="primary"
        size="lg"
        fullWidth
        loading={request.isPending}
        onPress={onSubmit}
      />

      <View style={{ alignItems: "center" }}>
        <Text variant="small" tone="muted">
          Remembered it?
        </Text>
        <Button label="Back to sign in" variant="ghost" onPress={() => router.back()} />
      </View>
    </AuthShell>
  );
}
