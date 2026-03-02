import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

export async function POST() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "Supabase 설정이 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE 값을 먼저 설정해주세요.",
      },
      { status: 500 },
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase 클라이언트 초기화에 실패했습니다." },
      { status: 500 },
    );
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
