import { useMutation, useQuery } from "@tanstack/react-query";

import { systemApi, type ContactInput } from "@/api/endpoints/system";
import { queryKeys } from "@/api/queryKeys";

export function useSystemHealth() {
  return useQuery({
    queryKey: queryKeys.system.health,
    queryFn: () => systemApi.health(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useContactSupport() {
  return useMutation({
    mutationFn: (input: ContactInput) => systemApi.contact(input),
  });
}
