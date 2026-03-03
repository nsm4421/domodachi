import Link from "next/link";
import {
  ArrowRight,
  Check,
  Clock3,
  Gamepad2,
  MessageCircle,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function Home() {
  const hasSupabaseConfig = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  const steps = [
    {
      title: "게임과 플레이 스타일 설정",
      description:
        "주로 하는 게임, 티어, 선호 시간대, 보이스 채팅 여부를 설정하세요.",
      icon: Search,
    },
    {
      title: "맞는 파티를 빠르게 탐색",
      description:
        "조건에 맞는 글을 보고 바로 신청하거나, 직접 모집 글을 올리세요.",
      icon: Users,
    },
    {
      title: "채팅 후 바로 게임 시작",
      description: "매칭된 팀원과 간단히 대화하고 링크로 바로 합류하세요.",
      icon: MessageCircle,
    },
  ] as const;

  const partyExamples = [
    {
      game: "League of Legends",
      mode: "랭크 듀오",
      tags: ["골드-플래티넘", "오후 9시-자정", "디스코드 선호"],
    },
    {
      game: "Valorant",
      mode: "일반/경쟁 5인 스택",
      tags: ["편안한 분위기 + 소통", "주말 위주", "트롤 금지"],
    },
    {
      game: "Overwatch 2",
      mode: "빠른 대전/경쟁전",
      tags: ["힐러 환영", "마이크 선택", "좋은 분위기 우선"],
    },
  ] as const;

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="border-border bg-card relative overflow-hidden rounded-3xl border px-6 py-10 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_15%_20%,oklch(0.94_0.03_210/.55),transparent_42%),radial-gradient(circle_at_85%_10%,oklch(0.92_0.05_160/.45),transparent_40%)]" />

        <div className="relative z-10 flex flex-col gap-8">
          <div className="space-y-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.18em] uppercase">
              게임 친구 매칭
            </p>
            <h1 className="max-w-3xl text-3xl leading-tight font-semibold tracking-tight sm:text-5xl">
              함께할 팀원을
              <br />
              domodachi에서 빠르게 찾아보세요
            </h1>
            <p className="text-muted-foreground max-w-2xl text-sm sm:text-base">
              실력만이 아니라 시간대와 성향까지 맞는 팀원을 연결해드려요.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              className="bg-primary text-primary-foreground inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors hover:opacity-90"
              href="/auth/sign-up"
            >
              무료로 시작하기
              <ArrowRight size={16} />
            </Link>
            <Link
              className="border-border text-foreground hover:bg-accent inline-flex h-10 items-center rounded-lg border px-4 text-sm font-medium transition-colors"
              href="/auth/sign-in"
            >
              로그인
            </Link>
            <Link
              className="text-muted-foreground hover:text-foreground inline-flex h-10 items-center rounded-lg px-2 text-sm font-medium underline underline-offset-4"
              href="/mock/chat"
            >
              채팅 목업 보기
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="border-border/70 bg-background/80 rounded-xl border p-4">
              <p className="text-muted-foreground text-xs">평균 응답 시간</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <Clock3 size={16} />
                3분 이내
              </p>
            </div>
            <div className="border-border/70 bg-background/80 rounded-xl border p-4">
              <p className="text-muted-foreground text-xs">지원 게임</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <Gamepad2 size={16} />
                MOBA / FPS / Co-op
              </p>
            </div>
            <div className="border-border/70 bg-background/80 rounded-xl border p-4">
              <p className="text-muted-foreground text-xs">안전한 커뮤니티</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <ShieldCheck size={16} />
                차단/신고 기능
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article
              key={step.title}
              className="border-border bg-card rounded-2xl border p-5"
            >
              <div className="bg-primary/10 text-primary inline-flex h-9 w-9 items-center justify-center rounded-lg">
                <Icon size={18} />
              </div>
              <h2 className="mt-4 text-base font-semibold">{step.title}</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                {step.description}
              </p>
            </article>
          );
        })}
      </div>

      <div className="border-border bg-card rounded-2xl border p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">실시간 파티 글 예시</h2>
          <Link
            className="text-muted-foreground hover:text-foreground text-sm underline"
            href="/auth/sign-in"
          >
            로그인 후 전체 보기
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {partyExamples.map((party) => (
            <article
              key={party.game + party.mode}
              className="border-border/80 bg-background rounded-xl border p-4"
            >
              <p className="text-sm font-semibold">{party.game}</p>
              <p className="text-muted-foreground mt-1 text-sm">{party.mode}</p>
              <ul className="mt-3 space-y-2">
                {party.tags.map((tag) => (
                  <li
                    key={tag}
                    className="text-muted-foreground flex items-center gap-2 text-xs"
                  >
                    <Check size={14} className="text-primary" />
                    {tag}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>

      <div className="border-border bg-card rounded-2xl border p-6">
        <p className="text-muted-foreground text-sm">Supabase 연결 상태</p>
        <p className="mt-2 text-lg font-semibold">
          {hasSupabaseConfig ? "정상 설정됨" : ".env.local 값이 필요합니다"}
        </p>
      </div>
    </section>
  );
}
