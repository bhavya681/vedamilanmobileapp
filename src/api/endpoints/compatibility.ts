import { request } from "@/api/client/http";
import type { CompatibilityReport } from "@/api/types/models";

export type SituationalCatalog = {
  catalog: unknown;
  profile: unknown;
  comparison?: unknown;
  youComplete?: boolean;
  themComplete?: boolean;
};

export type RelationshipJourney = Record<string, unknown>;

export const compatibilityApi = {
  listReports: () => request<{ reports: CompatibilityReport[] }>("/compatibility"),

  compare: (candidateUserId: string) =>
    request<CompatibilityReport>("/compatibility", {
      method: "POST",
      body: { candidateUserId },
      timeoutMs: 45_000,
    }),

  getSituational: (withUserId?: string) =>
    request<SituationalCatalog>("/situational-alignment", {
      query: withUserId ? { with: withUserId } : undefined,
    }),

  saveSituational: (input: { answers?: Record<string, unknown>; clear?: boolean }) =>
    request<SituationalCatalog>("/situational-alignment", { method: "PUT", body: input }),

  getJourney: (partnerUserId: string) =>
    request<RelationshipJourney>("/relationship-journey", { query: { partnerUserId } }),

  journeyAction: (action: string, payload: Record<string, unknown>) =>
    request<RelationshipJourney>("/relationship-journey", {
      method: "POST",
      body: { action, ...payload },
    }),
};
