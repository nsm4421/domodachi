import { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

type AuthLayoutProps = {
  children: ReactNode;
};

export default async function AuthLayout({ children }: AuthLayoutProps) {
  if (!isSupabaseConfigured) {
    return children;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return children;
  }

  const { data, error } = await supabase.auth.getUser();
  if (!error && data.user) {
    redirect("/");
  }

  return children;
}
