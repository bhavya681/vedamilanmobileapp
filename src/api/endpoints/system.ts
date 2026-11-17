import { request } from "@/api/client/http";

export type HealthStatus = {
  status: "ok" | "degraded" | "not_ready";
  checks?: { mongo?: "ok" | "error" | "skipped" | "missing_config" };
};

export type ContactInput = {
  name: string;
  email: string;
  message: string;
  company?: string;
  website?: string;
};

export const systemApi = {
  health: () => request<HealthStatus>("/health", { anonymous: true }),
  ready: () => request<HealthStatus>("/ready", { anonymous: true }),
  contact: (input: ContactInput) =>
    request<{ delivered: boolean }>("/contact", {
      method: "POST",
      anonymous: true,
      body: input,
    }),
};
