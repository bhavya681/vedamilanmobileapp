import { QueryClient } from "@tanstack/react-query";

import { ApiError } from "@/api/client/errors";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 10 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error) => {
        if (error instanceof ApiError) {
          if (
            error.status === 401 ||
            error.status === 402 ||
            error.status === 403 ||
            error.status === 404 ||
            error.status === 422
          ) {
            return false;
          }
          if (error.kind === "rate_limit") return false;
        }
        return failureCount < 2;
      },
    },
    mutations: { retry: 0 },
  },
});
