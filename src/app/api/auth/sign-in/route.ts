import { NextResponse } from "next/server";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      {
        error:
          "Supabase 설정이 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE 값을 먼저 설정해주세요.",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문(JSON) 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          "로그인 요청 값이 올바르지 않습니다.",
      },
      { status: 400 },
    );
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase 클라이언트 초기화에 실패했습니다." },
      { status: 500 },
    );
  }

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
