import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { profileApi, type LocaleSettings } from "@/api/endpoints/profile";
import { queryKeys } from "@/api/queryKeys";
import { useSession } from "@/providers/SessionProvider";

export function useLocaleSettings(enabled = true) {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.profile.locale,
    queryFn: () => profileApi.getLocale(),
    enabled: enabled && isAuthenticated,
    staleTime: 5 * 60_000,
  });
}

export function useSaveLocaleSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LocaleSettings) => profileApi.saveLocale(input),
    onSuccess: (saved) => {
      qc.setQueryData(queryKeys.profile.locale, saved);
      void qc.invalidateQueries({ queryKey: queryKeys.profile.bundle });
    },
  });
}
