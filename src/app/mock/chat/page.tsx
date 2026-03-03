import {
  Bell,
  Hash,
  Image as ImageIcon,
  MessageCircle,
  Mic,
  Paperclip,
  Phone,
  Pin,
  Search,
  Send,
  Smile,
  Users,
  Video,
} from "lucide-react";
import { PageHeader } from "@/components/common/page-header";

const directRooms = [
  {
    name: "서포터장인",
    game: "LoL 랭크 듀오",
    preview: "9시쯤 바로 가능!",
    unread: 2,
  },
  {
    name: "VALO_neo",
    game: "발로란트 경쟁",
    preview: "포지션은 엔트리 맡을게요",
    unread: 0,
  },
  {
    name: "OW_healer",
    game: "오버워치2",
    preview: "디코 링크 보냈어요",
    unread: 0,
  },
] as const;

const directMessages = [
  {
    fromMe: false,
    message: "안녕하세요! 오늘 저녁 9시 이후 가능하세요?",
    time: "20:10",
  },
  {
    fromMe: true,
    message: "네 가능해요. 탑/정글 위주로 갑니다.",
    time: "20:12",
  },
  {
    fromMe: false,
    message: "좋아요. 듀오 2판 워밍업하고 랭크 가시죠.",
    time: "20:13",
  },
  { fromMe: true, message: "좋습니다. 디스코드 쓰실까요?", time: "20:14" },
] as const;

const groupRooms = [
  {
    name: "# 팀원모집",
    members: "2,904",
    preview: "저녁 10시 스크림 멤버 구합니다",
  },
  { name: "# 듀오매칭", members: "1,287", preview: "플4-다4 구간 정글 구해요" },
  { name: "# 자유대화", members: "6,312", preview: "이번 패치 체감 어때요?" },
] as const;

const groupMessages = [
  {
    author: "Rina",
    role: "리더",
    message: "오늘 10시 스크림 A팀 확정합니다.",
    time: "21:02",
  },
  {
    author: "Moki",
    role: "멤버",
    message: "서브 딜러 한 분 더 필요해요.",
    time: "21:03",
  },
  {
    author: "Mint",
    role: "매니저",
    message: "참여 가능하신 분은 스레드에 체크해주세요.",
    time: "21:05",
  },
] as const;

export default function ChatMockPage() {
  return (
    <section className="mx-auto w-full max-w-7xl space-y-6">
      <PageHeader
        eyebrow="Mock Up"
        title="채팅 UI 목업"
        description="추후 구현할 1:1 채팅과 그룹 채팅의 구조를 먼저 확인할 수 있는 시안입니다."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="border-border bg-card overflow-hidden rounded-3xl border">
          <header className="border-border from-primary/10 via-primary/5 to-background border-b bg-linear-to-r px-5 py-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
              Direct Message
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-tight">
              <MessageCircle size={18} />
              1:1 채팅
            </h2>
          </header>

          <div className="grid gap-3 p-3 md:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_190px]">
            <aside className="border-border bg-background rounded-2xl border p-3">
              <div className="border-border text-muted-foreground mb-3 flex h-9 items-center gap-2 rounded-lg border px-3 text-xs">
                <Search size={14} />
                대화 검색
              </div>
              <ul className="space-y-2">
                {directRooms.map((room, index) => (
                  <li
                    key={room.name}
                    className={`rounded-xl border px-3 py-2 ${
                      index === 0
                        ? "border-primary/30 bg-primary/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold">{room.name}</p>
                      {room.unread ? (
                        <span className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                          {room.unread}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      {room.game}
                    </p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {room.preview}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="border-border bg-background rounded-2xl border">
              <div className="border-border flex items-center justify-between border-b px-4 py-3">
                <div>
                  <p className="text-sm font-semibold">서포터장인</p>
                  <p className="text-muted-foreground text-xs">
                    온라인 · LoL 랭크 듀오
                  </p>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <button className="hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-lg">
                    <Phone size={15} />
                  </button>
                  <button className="hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-lg">
                    <Video size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-4">
                {directMessages.map((message) => (
                  <div
                    key={message.message}
                    className={`flex ${message.fromMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        message.fromMe
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      <p>{message.message}</p>
                      <p
                        className={`mt-1 text-[11px] ${
                          message.fromMe
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {message.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-border flex items-center gap-2 border-t px-3 py-3">
                <button className="text-muted-foreground hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg">
                  <Paperclip size={15} />
                </button>
                <div className="border-border text-muted-foreground flex h-9 flex-1 items-center rounded-lg border px-3 text-sm">
                  메시지를 입력하세요
                </div>
                <button className="text-muted-foreground hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg">
                  <Smile size={15} />
                </button>
                <button className="bg-primary text-primary-foreground inline-flex h-9 w-9 items-center justify-center rounded-lg">
                  <Send size={15} />
                </button>
              </div>
            </div>

            <aside className="border-border bg-background rounded-2xl border p-3 xl:block">
              <p className="text-sm font-semibold">상대 정보</p>
              <ul className="text-muted-foreground mt-3 space-y-2 text-xs">
                <li className="bg-muted rounded-lg px-2 py-1.5">
                  최근 플레이: LoL 42시간
                </li>
                <li className="bg-muted rounded-lg px-2 py-1.5">
                  선호 시간: 21:00-01:00
                </li>
                <li className="bg-muted rounded-lg px-2 py-1.5">
                  마이크: 가능
                </li>
              </ul>
              <button className="border-border hover:bg-accent mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border text-xs font-medium">
                매칭 상세 보기
              </button>
            </aside>
          </div>
        </article>

        <article className="border-border bg-card overflow-hidden rounded-3xl border">
          <header className="border-border from-chart-2/18 via-chart-2/5 to-background border-b bg-linear-to-r px-5 py-4">
            <p className="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase">
              Group Chat
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-semibold tracking-tight">
              <Users size={18} />
              그룹 채팅
            </h2>
          </header>

          <div className="grid gap-3 p-3 md:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_190px]">
            <aside className="border-border bg-background rounded-2xl border p-3">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">채널 목록</p>
                <Bell size={14} className="text-muted-foreground" />
              </div>
              <ul className="space-y-2">
                {groupRooms.map((room, index) => (
                  <li
                    key={room.name}
                    className={`rounded-xl border px-3 py-2 ${
                      index === 0
                        ? "border-chart-2/30 bg-chart-2/10"
                        : "border-border bg-card"
                    }`}
                  >
                    <p className="text-sm font-semibold">{room.name}</p>
                    <p className="text-muted-foreground mt-1 text-[11px]">
                      멤버 {room.members}명
                    </p>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {room.preview}
                    </p>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="border-border bg-background rounded-2xl border">
              <div className="border-border flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <Hash size={15} className="text-muted-foreground" />
                  <p className="text-sm font-semibold">팀원모집</p>
                </div>
                <div className="text-muted-foreground flex items-center gap-2">
                  <button className="hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-lg">
                    <Pin size={15} />
                  </button>
                  <button className="hover:bg-accent inline-flex h-8 w-8 items-center justify-center rounded-lg">
                    <Search size={15} />
                  </button>
                </div>
              </div>

              <div className="space-y-3 p-4">
                {groupMessages.map((message) => (
                  <article
                    key={message.author + message.time}
                    className="flex gap-3"
                  >
                    <div className="bg-chart-2/20 text-chart-2 flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold">
                      {message.author.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {message.author}
                        </p>
                        <span className="text-muted-foreground bg-muted rounded px-1.5 py-0.5 text-[10px]">
                          {message.role}
                        </span>
                        <p className="text-muted-foreground text-[11px]">
                          {message.time}
                        </p>
                      </div>
                      <p className="text-sm">{message.message}</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="border-border flex items-center gap-2 border-t px-3 py-3">
                <button className="text-muted-foreground hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg">
                  <ImageIcon size={15} />
                </button>
                <button className="text-muted-foreground hover:bg-accent inline-flex h-9 w-9 items-center justify-center rounded-lg">
                  <Mic size={15} />
                </button>
                <div className="border-border text-muted-foreground flex h-9 flex-1 items-center rounded-lg border px-3 text-sm">
                  채널에 메시지 보내기
                </div>
                <button className="bg-chart-2/85 inline-flex h-9 items-center justify-center rounded-lg px-3 text-xs font-semibold text-white">
                  전송
                </button>
              </div>
            </div>

            <aside className="border-border bg-background rounded-2xl border p-3 xl:block">
              <p className="text-sm font-semibold">채널 정보</p>
              <ul className="text-muted-foreground mt-3 space-y-2 text-xs">
                <li className="bg-muted rounded-lg px-2 py-1.5">
                  오늘 모집 글: 32개
                </li>
                <li className="bg-muted rounded-lg px-2 py-1.5">
                  활성 스레드: 8개
                </li>
                <li className="bg-muted rounded-lg px-2 py-1.5">
                  운영자 온라인: 3명
                </li>
              </ul>
              <button className="border-border hover:bg-accent mt-3 inline-flex h-8 w-full items-center justify-center rounded-lg border text-xs font-medium">
                공지 보기
              </button>
            </aside>
          </div>
        </article>
      </div>

      <section className="border-border bg-card rounded-2xl border p-5">
        <p className="text-sm font-semibold">디자인 메모</p>
        <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
          <li>1:1 채팅은 빠른 응답에 집중된 단순한 버블 UI를 사용했습니다.</li>
          <li>
            그룹 채팅은 역할 배지/채널 정보를 노출해 커뮤니티 운영성을
            강조했습니다.
          </li>
          <li>
            두 화면 모두 실제 구현 시 실시간 메시지/읽음 상태만 연결하면 됩니다.
          </li>
        </ul>
      </section>
    </section>
  );
}
