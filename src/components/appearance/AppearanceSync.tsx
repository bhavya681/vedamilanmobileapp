import { useEffect, useRef } from "react";

import { useAppearanceQuery } from "@/hooks/useAppearance";
import { useSession } from "@/providers/SessionProvider";
import { useAppearancePreference } from "@/theme/ThemeProvider";
import { normalizeAppearance } from "@/theme/presets";

/**
 * Hydrates the local appearance store from the member's server profile once
 * per signed-in user. Subsequent changes are written by useAppearanceController.
 */
export function AppearanceSync() {
  const { isAuthenticated, user } = useSession();
  const query = useAppearanceQuery();
  const setAppearance = useAppearancePreference((state) => state.setAppearance);
  const appliedFor = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      appliedFor.current = null;
      return;
    }
    const userId = user?.user.id;
    if (!userId || !query.data) return;
    if (appliedFor.current === userId) return;
    appliedFor.current = userId;
    setAppearance(normalizeAppearance(query.data));
  }, [isAuthenticated, query.data, setAppearance, user?.user.id]);

  return null;
}
