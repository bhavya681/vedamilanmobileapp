import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { notificationsApi } from "@/api/endpoints/notifications";
import { queryKeys } from "@/api/queryKeys";
import { useSession } from "@/providers/SessionProvider";

export function useNotifications() {
  const { isAuthenticated } = useSession();
  return useQuery({
    queryKey: queryKeys.notifications.list,
    queryFn: () => notificationsApi.list(),
    enabled: isAuthenticated,
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { notificationId?: string; markAll?: boolean }) =>
      notificationsApi.markRead(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.list });
    },
  });
}
