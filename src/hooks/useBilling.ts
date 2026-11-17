import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { billingApi, type CheckoutResult } from "@/api/endpoints/billing";
import { queryKeys } from "@/api/queryKeys";
import { useSession } from "@/providers/SessionProvider";

export function useBilling() {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.billing.summary,
    queryFn: () => billingApi.summary(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useInvoices() {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.billing.invoices,
    queryFn: () => billingApi.invoices(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });
}

export function useCheckout() {
  const qc = useQueryClient();
  return useMutation<CheckoutResult, unknown, { planCode: string; provider?: "STRIPE" | "RAZORPAY" }>({
    mutationFn: ({ planCode, provider }) => billingApi.checkout(planCode, provider),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.billing.summary });
    },
  });
}

export function useVerifyRazorpay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { orderId: string; paymentId: string; signature: string }) =>
      billingApi.verifyRazorpay(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.billing.summary });
    },
  });
}
