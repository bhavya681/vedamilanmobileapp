import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { astrologyApi } from "@/api/endpoints/astrology";
import { queryKeys } from "@/api/queryKeys";
import type { BirthDetails } from "@/api/types/models";

const DEFAULT_POINT = {
  latitude: 28.6139,
  longitude: 77.209,
  timezone: "Asia/Kolkata",
} as const;

function queryPoint(birth: BirthDetails | null | undefined) {
  if (!birth) return undefined;
  return {
    latitude: birth.latitude,
    longitude: birth.longitude,
    timezone: birth.timezone,
  };
}

export function useHoroscope(autoGenerate = true) {
  const qc = useQueryClient();
  const query = useQuery({
    queryKey: ["horoscope", "latest"] as const,
    queryFn: () => astrologyApi.getHoroscope(),
  });

  const generate = useMutation({
    mutationFn: () => astrologyApi.generateHoroscope(),
    onSuccess: (payload) => {
      qc.setQueryData(["horoscope", "latest"], payload);
      void qc.invalidateQueries({ queryKey: ["horoscope"] });
      void qc.invalidateQueries({ queryKey: ["astrology"] });
    },
  });

  const attempted = useRef(false);
  useEffect(() => {
    if (!autoGenerate || attempted.current) return;
    if (query.isLoading) return;
    if (query.data === null) {
      attempted.current = true;
      generate.mutate();
    }
  }, [autoGenerate, query.isLoading, query.data, generate]);

  return {
    payload: query.data ?? generate.data ?? null,
    isLoading: query.isLoading || generate.isPending,
    isGenerating: generate.isPending,
    error: query.error ?? generate.error,
    refetch: query.refetch,
    generate: () => generate.mutate(),
  };
}

export function useVedicExtras(enabled = true) {
  return useQuery({
    queryKey: queryKeys.horoscope.extras,
    queryFn: () => astrologyApi.getVedicExtras(),
    enabled,
    staleTime: 5 * 60_000,
  });
}

export function usePanchanga(birth?: BirthDetails | null, date?: string) {
  const ready = birth !== undefined;
  const point = queryPoint(birth) ?? DEFAULT_POINT;
  return useQuery({
    queryKey: [...queryKeys.panchanga(date), point] as const,
    queryFn: () => astrologyApi.getPanchanga({ date, ...point }),
    enabled: ready,
    staleTime: 10 * 60_000,
  });
}

export function useMuhurta(activity: string, date: string, birth?: BirthDetails | null) {
  const ready = birth !== undefined;
  const point = queryPoint(birth) ?? DEFAULT_POINT;
  return useQuery({
    queryKey: ["muhurta", activity, date, point] as const,
    queryFn: () => astrologyApi.getMuhurta({ activity, date, ...point }),
    enabled: Boolean(activity && date && ready),
  });
}

export function useGochar(date?: string) {
  return useQuery({
    queryKey: ["astrology", "gochar", date ?? "today"] as const,
    queryFn: () => astrologyApi.getGochar(date),
    staleTime: 10 * 60_000,
  });
}

export function useNumerology(enabled = true) {
  return useQuery({
    queryKey: queryKeys.numerology,
    queryFn: () => astrologyApi.getNumerology(),
    enabled,
  });
}

export function useLalKitab(enabled = true) {
  return useQuery({
    queryKey: ["astrology", "lal-kitab"] as const,
    queryFn: () => astrologyApi.getLalKitab(),
    enabled,
  });
}

export function useMarriageTiming(enabled = true) {
  return useQuery({
    queryKey: ["astrology", "marriage-timing"] as const,
    queryFn: () => astrologyApi.getMarriageTiming(),
    enabled,
  });
}

export type AstrologyModule =
  | "shadbala"
  | "planet-strength"
  | "jaimini"
  | "bnn"
  | "marriage-intelligence"
  | "past-life-deeds"
  | "spiritual-journey"
  | "marriage-precautions"
  | "calendar"
  | "celestial-horizon";

const fetchers: Record<AstrologyModule, () => Promise<Record<string, unknown>>> = {
  shadbala: astrologyApi.getShadbala,
  "planet-strength": astrologyApi.getPlanetStrength,
  jaimini: () => astrologyApi.getJaimini(),
  bnn: astrologyApi.getBnn,
  "marriage-intelligence": astrologyApi.getMarriageIntelligence,
  "past-life-deeds": astrologyApi.getPastLifeDeeds,
  "spiritual-journey": astrologyApi.getSpiritualJourney,
  "marriage-precautions": astrologyApi.getMarriagePrecautions,
  calendar: astrologyApi.getLifeCalendar,
  "celestial-horizon": () => astrologyApi.getCelestialHorizon({ mode: "live" }),
};

export function useAstrologyModule(module: AstrologyModule, enabled = true) {
  return useQuery({
    queryKey: queryKeys.astrology.module(module),
    queryFn: () => fetchers[module](),
    enabled,
    staleTime: 5 * 60_000,
    retry: 0,
  });
}

export function useCelebrities() {
  return useQuery({
    queryKey: ["astrology", "celebrities"] as const,
    queryFn: () => astrologyApi.getCelebrities(),
    staleTime: 30 * 60_000,
  });
}

export function useChartComparison(partnerUserId: string | undefined) {
  return useQuery({
    queryKey: ["astrology", "chart-comparison", partnerUserId ?? "none"] as const,
    queryFn: () => astrologyApi.getChartComparison(partnerUserId ?? ""),
    enabled: Boolean(partnerUserId),
  });
}
