"use client";

import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase/client";

type UseAuthSessionResult = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  refreshSession: () => Promise<void>;
};

const canUseSupabase = Boolean(isSupabaseConfigured && supabase);

export function useAuthSession(): UseAuthSessionResult {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(canUseSupabase);
  const [error, setError] = useState<string | null>(
    canUseSupabase ? null : "Supabase is not configured.",
  );

  const refreshSession = useCallback(async () => {
    if (!canUseSupabase || !supabase) {
      return;
    }

    setIsLoading(true);

    const { data, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      setError(sessionError.message);
      setSession(null);
    } else {
      setError(null);
      setSession(data.session);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!canUseSupabase || !supabase) {
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!isMounted) {
        return;
      }

      if (sessionError) {
        setError(sessionError.message);
        setSession(null);
      } else {
        setError(null);
        setSession(data.session);
      }

      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) {
        return;
      }

      setSession(nextSession);
      setError(null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return {
    session,
    user: session?.user ?? null,
    isLoading,
    error,
    isConfigured: canUseSupabase,
    refreshSession,
  };
}
