import * as Linking from "expo-linking";
import React from "react";
import { Alert, View } from "react-native";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ErrorState, LoadingState } from "@/components/ui/ScreenState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Text } from "@/components/ui/Text";
import { useBilling, useCheckout } from "@/hooks/useBilling";
import { useToast } from "@/components/feedback/ToastProvider";
import { formatDate, formatInr, titleCase } from "@/lib/format";
import { spacing } from "@/theme/tokens";

export default function BillingScreen() {
  const toast = useToast();
  const billing = useBilling();
  const checkout = useCheckout();
  const summary = billing.data;
  const currentCode = summary?.subscription?.planCode;

  const startCheckout = async (planCode: string) => {
    try {
      const result = await checkout.mutateAsync({ planCode, provider: "RAZORPAY" });
      const url = result.url ?? result.checkoutUrl;
      if (url) {
        await Linking.openURL(url);
        toast.show("Complete the payment in your browser, then return here.", "info");
        return;
      }
      if (result.activated) {
        toast.show("Membership activated.", "success");
        void billing.refetch();
        return;
      }
      Alert.alert("Checkout unavailable", "This plan could not be opened on mobile. Please try again later.");
    } catch {
      toast.show("Checkout could not be started.", "error");
    }
  };

  return (
    <Screen title="Billing & membership" subtitle="Manage your plan and payments" showBack>
      {billing.isLoading ? (
        <LoadingState variant="detail" />
      ) : billing.isError ? (
        <ErrorState error={billing.error} onRetry={() => billing.refetch()} />
      ) : (
        <View style={{ gap: spacing.lg }}>
          <Card style={{ gap: spacing.sm }}>
            <Text variant="micro" tone="faint">
              CURRENT MEMBERSHIP
            </Text>
            <Text variant="heading">{summary?.subscription ? titleCase(currentCode ?? "Member") : "Free"}</Text>
            <Text variant="caption" tone="muted">
              {summary?.subscription
                ? [
                    summary.subscription.subscriptionStatus,
                    summary.subscription.currentPeriodEnd
                      ? `Renews ${formatDate(summary.subscription.currentPeriodEnd)}`
                      : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "Upgrade to unlock deeper compatibility reports and guidance."}
            </Text>
          </Card>

          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="Plans" />
            {(summary?.plans ?? []).map((plan) => {
              const active = plan.code === currentCode;
              return (
                <View key={plan.code} style={{ gap: spacing.sm, borderTopWidth: 1, borderTopColor: "transparent" }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.sm }}>
                    <Text variant="title" style={{ flex: 1 }}>
                      {plan.name}
                    </Text>
                    {active ? <Badge label="Active" tone="emerald" size="sm" /> : null}
                  </View>
                  <Text variant="body" tone="muted">
                    {formatInr(plan.priceInr)} {plan.interval ? `/ ${plan.interval.toLowerCase()}` : ""}
                  </Text>
                  {(plan.features ?? []).map((feature) => (
                    <Text key={feature} variant="caption" tone="faint">
                      • {feature}
                    </Text>
                  ))}
                  <Button
                    label={active ? "Current plan" : "Choose plan"}
                    variant={active ? "secondary" : "gold"}
                    size="sm"
                    disabled={active}
                    loading={checkout.isPending}
                    onPress={() => startCheckout(plan.code)}
                  />
                </View>
              );
            })}
            {!(summary?.plans ?? []).length ? (
              <Text variant="caption" tone="faint">
                Plans are not available right now.
              </Text>
            ) : null}
          </Card>

          <Card style={{ gap: spacing.sm }}>
            <SectionHeader title="Payment history" />
            {(summary?.payments ?? []).length === 0 ? (
              <Text variant="caption" tone="faint">
                No payments yet.
              </Text>
            ) : (
              (summary?.payments ?? []).map((payment, index) => (
                <View key={payment.id ?? payment._id ?? index} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text variant="small" tone="muted">
                    {formatDate(payment.createdAt)} · {titleCase(payment.status ?? "pending")}
                  </Text>
                  <Text variant="small">{formatInr(payment.amount)}</Text>
                </View>
              ))
            )}
          </Card>
        </View>
      )}
    </Screen>
  );
}
