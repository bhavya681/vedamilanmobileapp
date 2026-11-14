export type {
  ChartPlanetGlyph,
  KundliChart as ChartData,
  NorthChartData,
  SouthChartData,
  SouthSignRow,
} from "@/api/types/models";

import type { KundliChart, NorthChartData } from "@/api/types/models";

export function isNorthChart(data: KundliChart): data is NorthChartData {
  return data.style === "NORTH";
}

export function chartPlanets(data: KundliChart) {
  if (isNorthChart(data)) return Object.values(data.houses).flat();
  return data.signs.flatMap((s) => s.planets);
}
