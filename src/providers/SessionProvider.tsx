import { useQueryClient } from "@tanstack/react-query";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { setUnauthorizedHandler } from "@/api/client/http";
import { authApi } from "@/api/endpoints/auth";
import type { AuthMe } from "@/api/types/models";
import { tokenStore } from "@/lib/auth/tokenStore";

export type SessionStatus = "loading" | "authenticated" | "anonymous";

type SessionContextValue = {
  status: SessionStatus;
  user: AuthMe | null;
  isAuthenticated: boolean;
  completeSignIn: (me: AuthMe) => void;
  refresh: (options?: { silent?: boolean }) => Promise<AuthMe | null>;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [status, setStatus] = useState<SessionStatus>("loading");
  const [user, setUser] = useState<AuthMe | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const clearLocal = useCallback(async () => {
    await tokenStore.clear();
    qc.clear();
    if (mounted.current) {
      setUser(null);
      setStatus("anonymous");
    }
  }, [qc]);

  const refresh = useCallback(
    async (options?: { silent?: boolean }): Promise<AuthMe | null> => {
      const credentials = await tokenStore.hydrate();
      if (!credentials.token && !credentials.cookie) {
        if (mounted.current) {
          setUser(null);
          setStatus("anonymous");
        }
        return null;
      }
      try {
        const me = await authApi.me();
        if (mounted.current) {
          setUser(me);
          setStatus("authenticated");
        }
        return me;
      } catch {
        await tokenStore.clear();
        if (mounted.current) {
          setUser(null);
          setStatus("anonymous");
        }
        return null;
      } finally {
        if (options?.silent === false) {
          // no-op: kept for call-site clarity
        }
      }
    },
    [],
  );

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearLocal();
    });
    void refresh();
    return () => setUnauthorizedHandler(null);
  }, [clearLocal, refresh]);

  const completeSignIn = useCallback((me: AuthMe) => {
    setUser(me);
    setStatus("authenticated");
    void qc.invalidateQueries();
  }, [qc]);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    await clearLocal();
  }, [clearLocal]);

  const value = useMemo<SessionContextValue>(
    () => ({
      status,
      user,
      isAuthenticated: status === "authenticated",
      completeSignIn,
      refresh,
      signOut,
    }),
    [status, user, completeSignIn, refresh, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
