import { request } from "@/api/client/http";
import type { BillingSummary, Subscription } from "@/api/types/models";

export type CheckoutResult = {
  provider?: "STRIPE" | "RAZORPAY";
  url?: string;
  checkoutUrl?: string;
  orderId?: string;
  amount?: number;
  currency?: string;
  keyId?: string;
  subscription?: Subscription;
  activated?: boolean;
  [key: string]: unknown;
};

export const billingApi = {
  summary: () => request<BillingSummary>("/billing"),

  invoices: () => request<{ plans: BillingSummary["plans"]; payments: BillingSummary["payments"] }>(
    "/billing/invoices",
  ),

  checkout: (planCode: string, provider: "STRIPE" | "RAZORPAY" = "RAZORPAY") =>
    request<CheckoutResult>("/billing/checkout", {
      method: "POST",
      body: { planCode, provider },
    }),

  verifyRazorpay: (input: { orderId: string; paymentId: string; signature: string }) =>
    request<{ subscription: Subscription }>("/billing/razorpay/verify", {
      method: "POST",
      body: input,
    }),
};
