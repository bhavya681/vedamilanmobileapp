import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type DiscoveryFilters = {
  city?: string;
  religion?: string;
  profession?: string;
  manglik?: "ANY" | "NON_MANGLIK" | "MANGLIK";
  minAge?: number;
  maxAge?: number;
  minHeightCm?: number;
  maxHeightCm?: number;
  minCompatibility?: number;
  applyPreferences: boolean;
};

const DEFAULTS: DiscoveryFilters = { manglik: "ANY", applyPreferences: true };

type Store = {
  filters: DiscoveryFilters;
  setFilters: (filters: DiscoveryFilters) => void;
  reset: () => void;
};

const useStore = create<Store>()(
  persist(
    (set) => ({
      filters: DEFAULTS,
      setFilters: (filters) => set({ filters }),
      reset: () => set({ filters: DEFAULTS }),
    }),
    { name: "vedamilan.discovery.filters", storage: createJSONStorage(() => AsyncStorage) },
  ),
);

const IGNORED = new Set(["manglik", "applyPreferences"]);

export function useDiscoveryFilters() {
  const filters = useStore((s) => s.filters);
  const setFilters = useStore((s) => s.setFilters);
  const reset = useStore((s) => s.reset);

  const activeCount = Object.entries(filters).filter(([key, value]) => {
    if (IGNORED.has(key)) return false;
    return value !== undefined && value !== null && value !== "";
  }).length;

  return { filters, setFilters, reset, activeCount };
}
