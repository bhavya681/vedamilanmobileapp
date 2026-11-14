import { useQuery } from "@tanstack/react-query";

import { matchmakingApi, type MatchQuery } from "@/api/endpoints/matchmaking";
import { queryKeys } from "@/api/queryKeys";

export type MatchQueryLike = MatchQuery;

export function useDiscovery(params: MatchQueryLike) {
  return useQuery({
    queryKey: queryKeys.matchmaking.search(params as Record<string, unknown>),
    queryFn: () => matchmakingApi.search(params),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}
