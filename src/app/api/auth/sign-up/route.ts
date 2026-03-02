import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createServerSupabaseClient,
  isSupabaseConfigured,
} from "@/lib/supabase/server";

const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해주세요.")
    .email("올바른 이메일 형식을 입력해주세요."),
  password: z
    .string()
    .min(1, "비밀번호를 입력해주세요.")
    .min(6, "비밀번호는 6자 이상이어야 합니다."),
  username: z
    .string()
    .trim()
    .min(1, "사용자 이름을 입력해주세요.")
    .min(3, "사용자 이름은 3자 이상이어야 합니다.")
    .max(30, "사용자 이름은 30자 이하여야 합니다."),
});

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

  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          "회원가입 요청 값이 올바르지 않습니다.",
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

  const { email, password, username } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      },
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json(
    {
      ok: true,
      needsEmailVerification: !data.session,
    },
    { status: 200 },
  );
}
