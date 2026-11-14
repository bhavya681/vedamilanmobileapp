import { request } from "@/api/client/http";
import type {
  MatchSearchResponse,
  Paginated,
  Profile,
  RankedMatch,
} from "@/api/types/models";

export type MatchQuery = {
  q?: string;
  city?: string;
  religion?: string;
  profession?: string;
  education?: string;
  language?: string;
  manglik?: "ANY" | "NON_MANGLIK" | "MANGLIK";
  minAge?: number;
  maxAge?: number;
  minHeightCm?: number;
  maxHeightCm?: number;
  minCompatibility?: number;
  page?: number;
  limit?: number;
  applyPreferences?: boolean;
  prefs?: string;
  requireSituational?: boolean;
};

export type LikeItem = {
  id?: string;
  toUserId?: string;
  type?: string;
  createdAt?: string;
  name?: string;
  photo?: string | null;
  [key: string]: unknown;
};

export type ShortlistItem = {
  id?: string;
  targetUserId?: string;
  note?: string;
  name?: string;
  photo?: string | null;
  [key: string]: unknown;
};

export type VisitorItem = {
  userId?: string;
  name?: string;
  photo?: string | null;
  visitedAt?: string;
  [key: string]: unknown;
};

export type ConnectionsHub = Record<string, unknown>;
export type ConnectionState = Record<string, unknown>;
export type InterestItem = Record<string, unknown>;

export const matchmakingApi = {
  search: (query: MatchQuery) =>
    request<MatchSearchResponse>("/matches", {
      query: { ...query, applyPreferences: query.applyPreferences ?? true },
    }),

  recommendations: () =>
    request<{ recommendations?: RankedMatch[]; items?: RankedMatch[]; [key: string]: unknown }>(
      "/recommendations",
      { timeoutMs: 45_000 },
    ),

  getCandidate: (userId: string) =>
    request<{ profile: Profile & Partial<RankedMatch> }>(`/matches/${encodeURIComponent(userId)}`),

  listLikes: () => request<Paginated<LikeItem> | LikeItem[]>("/likes"),

  like: (toUserId: string, type: "LIKE" | "SUPER_LIKE" | "INTEREST" = "LIKE") =>
    request<LikeItem>("/likes", { method: "POST", body: { toUserId, type } }),

  listShortlist: () => request<{ shortlist: ShortlistItem[] }>("/shortlist"),

  shortlist: (targetUserId: string, note?: string) =>
    request<ShortlistItem>("/shortlist", { method: "POST", body: { targetUserId, note } }),

  listVisitors: () => request<{ visitors: VisitorItem[] }>("/visitors"),

  listInterests: () => request<InterestItem>("/interests"),

  expressInterest: (toUserId: string) =>
    request<InterestItem>("/interests", { method: "POST", body: { toUserId } }),

  undoInterest: (toUserId: string) =>
    request<InterestItem>(`/interests?toUserId=${encodeURIComponent(toUserId)}`, {
      method: "DELETE",
    }),

  getConnections: () => request<ConnectionsHub>("/connections"),

  getConnectionState: (withUserId: string) =>
    request<ConnectionState>("/connections", { query: { with: withUserId } }),

  sendConnectionRequest: (toUserId: string, message?: string) =>
    request<ConnectionState>("/connections/requests", {
      method: "POST",
      body: { toUserId, message },
    }),

  respondToRequest: (id: string, action: "accept" | "decline" | "withdraw") =>
    request<ConnectionState>(`/connections/requests/${encodeURIComponent(id)}`, {
      method: "POST",
      body: { action },
    }),

  removeConnection: (otherUserId: string) =>
    request<ConnectionState>("/connections", {
      method: "DELETE",
      body: { otherUserId },
    }),

  listBlocks: () => request<{ blocks: unknown[] }>("/blocks"),

  block: (blockedId: string, reason?: string) =>
    request<unknown>("/blocks", { method: "POST", body: { blockedId, reason } }),

  unblock: (blockedId: string) =>
    request<unknown>("/blocks", { method: "DELETE", body: { blockedId } }),
};
