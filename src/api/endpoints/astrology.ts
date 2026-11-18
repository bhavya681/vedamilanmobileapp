import { format } from "date-fns";

import { request } from "@/api/client/http";
import type {
  Celebration,
  HoroscopePayload,
  KundliChart,
  PanchangaResponse,
  Planet,
  VedicExtras,
} from "@/api/types/models";

export type MuhurtaWindow = {
  date?: string;
  activity?: string;
  rating?: "excellent" | "good" | "moderate" | "avoid";
  startTime?: string;
  endTime?: string;
  startTs?: number;
  endTs?: number;
  score?: number;
  reasons?: string[];
  cautions?: string[];
  label?: string;
  start?: string;
  end?: string;
  quality?: string;
  notes?: string;
  [key: string]: unknown;
};

export type MuhurtaResponse = {
  windows: MuhurtaWindow[];
  activity: string;
  date: string;
  panchanga: unknown;
  location?: unknown;
};

export type GocharResponse = {
  asOf?: string;
  timezoneNote?: string;
  transitAscendant?: string;
  natalLagna?: string;
  natalMoon?: string | null;
  highlights?: string[];
  planets?: Planet[];
  chartNorth?: KundliChart;
  chartSouth?: KundliChart;
  chartEast?: KundliChart;
  [key: string]: unknown;
};
export type NumerologyResponse = {
  hasDob: boolean;
  numberCards?: { number: string | number; planet: string; keyword: string; coreEnergy: string }[];
  [key: string]: unknown;
};

export type LalKitabResponse = Record<string, unknown> & { disclaimer?: string };
export type MarriageTimingResponse = Record<string, unknown>;
export type GenericAstrologyReport = Record<string, unknown> & { disclaimer?: string };
export type LifeCalendarResponse = Record<string, unknown>;
export type CelestialHorizonResponse = Record<string, unknown>;

export const astrologyApi = {
  getHoroscope: () => request<HoroscopePayload | null>("/horoscope"),

  generateHoroscope: () =>
    request<HoroscopePayload>("/horoscope", { method: "POST", timeoutMs: 60_000 }),

  getVedicExtras: () => request<VedicExtras>("/horoscope/vedic-extras"),

  getPanchanga: (query?: { date?: string; latitude?: number; longitude?: number; timezone?: string }) =>
    request<PanchangaResponse>("/panchanga", {
      query: { ...query, date: query?.date ?? format(new Date(), "yyyy-MM-dd") },
    }),

  getMuhurta: (query: {
    date: string;
    activity: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  }) => request<MuhurtaResponse>("/muhurta", { query }),

  getGochar: (date?: string) =>
    request<GocharResponse>("/gochar", {
      query: { date: date ?? new Date().toISOString() },
    }),

  getNumerology: () => request<NumerologyResponse>("/numerology"),

  getLalKitab: () => request<LalKitabResponse>("/lal-kitab"),

  getMarriageTiming: () => request<MarriageTimingResponse>("/marriage-timing"),

  getShadbala: () => request<GenericAstrologyReport>("/astrology/shadbala"),

  getPlanetStrength: () => request<GenericAstrologyReport>("/astrology/planet-strength"),

  getJaimini: (query?: { convention?: "sapta" | "ashta"; retrograde?: "direct" | "remaining" }) =>
    request<GenericAstrologyReport>("/astrology/jaimini", { query }),

  getBnn: () => request<GenericAstrologyReport>("/astrology/bnn"),

  getMarriageIntelligence: () =>
    request<GenericAstrologyReport>("/astrology/marriage-intelligence"),

  getPastLifeDeeds: () => request<GenericAstrologyReport>("/astrology/past-life-deeds"),

  getSpiritualJourney: () => request<GenericAstrologyReport>("/astrology/spiritual-journey"),

  getChartComparison: (partnerUserId: string) =>
    request<GenericAstrologyReport>("/astrology/chart-comparison", {
      query: { partnerUserId },
    }),

  getCelebrities: (id?: string) =>
    request<
      | {
          celebrities?: Celebration[];
          selected?: Record<string, unknown> | null;
          total?: number;
          studio?: unknown;
        }
      | Celebration[]
    >("/astrology/celebrities", { query: { id } }),

  getMarriagePrecautions: () => request<GenericAstrologyReport>("/matrimony/marriage-precautions"),

  getLifeCalendar: () => request<LifeCalendarResponse>("/calendar"),

  getCelestialHorizon: (query?: {
    mode?: "live" | "birth";
    at?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    locationLabel?: string;
  }) => request<CelestialHorizonResponse>("/celestial-horizon", { query }),
};
