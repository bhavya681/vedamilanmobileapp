import { useMutation } from "@tanstack/react-query";

import { authApi } from "@/api/endpoints/auth";
import { useSession } from "@/providers/SessionProvider";

export function useSignIn() {
  const { completeSignIn } = useSession();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) => authApi.signIn(input),
    onSuccess: (me) => completeSignIn(me),
  });
}

export function useSignUp() {
  const { completeSignIn } = useSession();
  return useMutation({
    mutationFn: (input: {
      name: string;
      email: string;
      password: string;
      phone?: string;
      displayName?: string;
    }) => authApi.signUp(input),
    onSuccess: (me) => completeSignIn(me),
  });
}

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: (email: string) => authApi.requestPasswordResetOtp(email) });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: { email: string; otp: string; password: string }) =>
      authApi.resetPasswordWithOtp(input),
  });
}

export function useSendVerificationOtp() {
  return useMutation({ mutationFn: (email: string) => authApi.sendVerificationOtp(email) });
}

export function useVerifyEmail() {
  return useMutation({
    mutationFn: (input: { email: string; otp: string }) => authApi.verifyEmailOtp(input),
  });
}
