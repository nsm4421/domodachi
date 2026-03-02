import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv, isSupabaseConfigured } from "./env";

export const createBrowserSupabaseClient = () => {
  const env = getSupabasePublicEnv();

  if (!env) {
    return null;
  }

  return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
};

export const supabase =
  typeof window === "undefined" ? null : createBrowserSupabaseClient();

export { isSupabaseConfigured };
