-- Supabase(PostgreSQL)를 사용하는 채팅 앱용 핵심 스키마
-- auth.users 링크 등은 실제 Supabase 프로젝트 환경에 맞게 필요 시 수정

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null
    references auth.users (id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_auth_user_id on public.profiles (auth_user_id);

-- 트리거: 새로운 auth.users 행이 생성될 때 자동으로 profiles 행 생성
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (auth_user_id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(trim(coalesce(new.raw_user_meta_data->>'username', '')), ''),
      coalesce(new.email, new.id::text)
    ),
    coalesce(
      nullif(trim(coalesce(new.raw_user_meta_data->>'full_name', '')), ''),
      new.email
    ),
    nullif(trim(coalesce(new.raw_user_meta_data->>'avatar_url', '')), '')
  );

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_auth_user();

-- 1:1 대화방(Direct Conversation)
create table if not exists public.direct_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  created_by uuid not null references public.profiles (id) on delete restrict,
  last_message_at timestamptz,
  constraint direct_conversations_unique_pair unique (id)
);

-- 1:1 대화방의 참여자 및 유저별 상태 관리 테이블
create table if not exists public.direct_conversation_participants (
  conversation_id uuid not null references public.direct_conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  -- per-user state
  last_read_at timestamptz,
  muted boolean not null default false,
  blocked boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

-- (추가 인덱스/제약으로 두 명만 참여하도록 강제하는 것은 추후 확장 지점)
create unique index if not exists idx_direct_pair_unique
on public.direct_conversation_participants (
  conversation_id,
  profile_id
);

-- 그룹 채팅방(Group Chat)
create table if not exists public.group_chats (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid not null references public.profiles (id) on delete restrict,
  is_private boolean not null default false,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.group_chat_members (
  chat_id uuid not null references public.group_chats (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member', -- owner, admin, member 등 역할
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  muted boolean not null default false,
  primary key (chat_id, profile_id)
);

create index if not exists idx_group_chat_members_profile_id
  on public.group_chat_members (profile_id);

do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'message_target_type'
  ) then
    create type message_target_type as enum ('direct', 'group');
  end if;
end;
$$;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  -- 이 메시지가 속한 공간 (1:1 / 그룹) 정보
  target_type message_target_type not null,
  direct_conversation_id uuid references public.direct_conversations (id) on delete cascade,
  group_chat_id uuid references public.group_chats (id) on delete cascade,

  sender_id uuid not null references public.profiles (id) on delete restrict,
  content text not null,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,

  -- 빠른 정렬/페이지네이션을 위한 전송 시각
  sent_at timestamptz not null default now(),

  constraint messages_target_consistency check (
    (target_type = 'direct' and direct_conversation_id is not null and group_chat_id is null) or
    (target_type = 'group' and group_chat_id is not null and direct_conversation_id is null)
  )
);

create index if not exists idx_messages_direct_conversation_id_created_at
  on public.messages (direct_conversation_id, created_at desc)
  where target_type = 'direct';

create index if not exists idx_messages_group_chat_id_created_at
  on public.messages (group_chat_id, created_at desc)
  where target_type = 'group';

-- 메시지 단위 읽음 처리(읽음 표시) 테이블
create table if not exists public.message_reads (
  message_id uuid not null references public.messages (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

-- 타이핑 상태(누가 어디에서 타이핑 중인지) 관리 테이블
create table if not exists public.typing_states (
  id uuid primary key default gen_random_uuid(),
  target_type message_target_type not null,
  direct_conversation_id uuid references public.direct_conversations (id) on delete cascade,
  group_chat_id uuid references public.group_chats (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  is_typing boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint typing_states_target_consistency check (
    (target_type = 'direct' and direct_conversation_id is not null and group_chat_id is null) or
    (target_type = 'group' and group_chat_id is not null and direct_conversation_id is null)
  )
);

-- 유저 전역 차단 관계 테이블
create table if not exists public.user_blocks (
  id bigserial primary key,
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_profile_id uuid not null references public.profiles (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  constraint user_blocks_no_self_block check (blocker_id <> blocked_profile_id),
  constraint user_blocks_unique_pair unique (blocker_id, blocked_profile_id)
);

create index if not exists idx_user_blocks_blocker_id
  on public.user_blocks (blocker_id);

create index if not exists idx_user_blocks_blocked_profile_id
  on public.user_blocks (blocked_profile_id);

-- 신고 관련 enum 타입들
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'report_target_type'
  ) then
    create type report_target_type as enum ('profile', 'message', 'group_chat');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'report_status'
  ) then
    create type report_status as enum ('pending', 'reviewing', 'resolved', 'rejected');
  end if;

  if not exists (
    select 1 from pg_type where typname = 'report_category'
  ) then
    create type report_category as enum ('spam', 'abuse', 'nudity', 'hate', 'others');
  end if;
end;
$$;

-- 신고 테이블
create table if not exists public.reports (
  id bigserial primary key,

  reporter_id uuid not null references public.profiles (id) on delete cascade,

  target_type report_target_type not null,
  target_profile_id uuid references public.profiles (id) on delete cascade,
  target_message_id uuid references public.messages (id) on delete cascade,
  target_group_chat_id uuid references public.group_chats (id) on delete cascade,

  category report_category not null,
  description text,

  status report_status not null default 'pending',
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  resolution_note text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint reports_valid_target check (
    (target_type = 'profile' and target_profile_id is not null
                          and target_message_id is null
                          and target_group_chat_id is null)
    or
    (target_type = 'message' and target_message_id is not null
                          and target_profile_id is null
                          and target_group_chat_id is null)
    or
    (target_type = 'group_chat' and target_group_chat_id is not null
                          and target_profile_id is null
                          and target_message_id is null)
  )
);

create index if not exists idx_reports_status
  on public.reports (status);

create index if not exists idx_reports_target_profile
  on public.reports (target_profile_id);

create index if not exists idx_reports_target_message
  on public.reports (target_message_id);

create index if not exists idx_reports_target_group_chat
  on public.reports (target_group_chat_id);

-- reports.updated_at 자동 갱신 트리거
create or replace function public.set_reports_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_reports_updated_at on public.reports;

create trigger set_reports_updated_at
before update on public.reports
for each row
execute procedure public.set_reports_updated_at();

-- ============================================================================
-- RLS(Row Level Security) 설정
--  - Supabase Realtime/클라이언트에서 안전하게 사용하기 위한 기본 정책
--  - auth.uid() = profiles.auth_user_id 를 기준으로 현재 유저 프로필을 찾는 패턴 사용
-- ============================================================================

-- 1. profiles: 본인 프로필만 조회/수정 가능, 생성은 트리거로만
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = auth_user_id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- 2. direct_conversations / direct_conversation_participants
alter table public.direct_conversations enable row level security;
alter table public.direct_conversation_participants enable row level security;

-- direct_conversation_participants: 참여자만 조회
drop policy if exists "dcp_select_participant" on public.direct_conversation_participants;
create policy "dcp_select_participant"
  on public.direct_conversation_participants
  for select
  using (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

-- direct_conversations: 참여자만 조회
drop policy if exists "dc_select_participant" on public.direct_conversations;
create policy "dc_select_participant"
  on public.direct_conversations
  for select
  using (
    exists (
      select 1
      from public.direct_conversation_participants dcp
      join public.profiles p on p.id = dcp.profile_id
      where dcp.conversation_id = id
        and p.auth_user_id = auth.uid()
    )
  );

-- direct_conversations: 참여자만 insert/update (생성/관리)
drop policy if exists "dc_insert_by_profile" on public.direct_conversations;
create policy "dc_insert_by_profile"
  on public.direct_conversations
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = created_by
        and p.auth_user_id = auth.uid()
    )
  );

drop policy if exists "dc_update_by_creator" on public.direct_conversations;
create policy "dc_update_by_creator"
  on public.direct_conversations
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = created_by
        and p.auth_user_id = auth.uid()
    )
  );

-- direct_conversation_participants: 본인 참여 정보만 수정 가능
drop policy if exists "dcp_insert_own" on public.direct_conversation_participants;
create policy "dcp_insert_own"
  on public.direct_conversation_participants
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  );

drop policy if exists "dcp_update_own" on public.direct_conversation_participants;
create policy "dcp_update_own"
  on public.direct_conversation_participants
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  );

-- 3. group_chats / group_chat_members
alter table public.group_chats enable row level security;
alter table public.group_chat_members enable row level security;

-- group_chat_members: 본인이 속한 그룹만 조회
drop policy if exists "gcm_select_member" on public.group_chat_members;
create policy "gcm_select_member"
  on public.group_chat_members
  for select
  using (
    profile_id in (
      select id from public.profiles where auth_user_id = auth.uid()
    )
  );

-- group_chats: 멤버인 경우에만 조회
drop policy if exists "gc_select_member" on public.group_chats;
create policy "gc_select_member"
  on public.group_chats
  for select
  using (
    exists (
      select 1
      from public.group_chat_members gcm
      join public.profiles p on p.id = gcm.profile_id
      where gcm.chat_id = id
        and p.auth_user_id = auth.uid()
    )
  );

-- group_chats: 방 생성 (owner_id = 현재 유저)
drop policy if exists "gc_insert_owner" on public.group_chats;
create policy "gc_insert_owner"
  on public.group_chats
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = owner_id
        and p.auth_user_id = auth.uid()
    )
  );

-- group_chat_members: 본인 참여 정보만 insert/update 가능
drop policy if exists "gcm_insert_own" on public.group_chat_members;
create policy "gcm_insert_own"
  on public.group_chat_members
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  );

drop policy if exists "gcm_update_own" on public.group_chat_members;
create policy "gcm_update_own"
  on public.group_chat_members
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  );

-- 4. messages / message_reads / typing_states
alter table public.messages enable row level security;
alter table public.message_reads enable row level security;
alter table public.typing_states enable row level security;

-- messages: 참여자만 조회 가능
drop policy if exists "messages_select_participant" on public.messages;
create policy "messages_select_participant"
  on public.messages
  for select
  using (
    case
      when target_type = 'direct' then
        exists (
          select 1
          from public.direct_conversation_participants dcp
          join public.profiles p on p.id = dcp.profile_id
          where dcp.conversation_id = direct_conversation_id
            and p.auth_user_id = auth.uid()
        )
      when target_type = 'group' then
        exists (
          select 1
          from public.group_chat_members gcm
          join public.profiles p on p.id = gcm.profile_id
          where gcm.chat_id = group_chat_id
            and p.auth_user_id = auth.uid()
        )
      else false
    end
  );

-- messages: 참여자만 메시지 전송(insert) 가능, sender_id = 현재 유저
drop policy if exists "messages_insert_participant" on public.messages;
create policy "messages_insert_participant"
  on public.messages
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = sender_id
        and p.auth_user_id = auth.uid()
    )
    and
    (
      (target_type = 'direct' and exists (
        select 1
        from public.direct_conversation_participants dcp
        where dcp.conversation_id = direct_conversation_id
          and dcp.profile_id = sender_id
      ))
      or
      (target_type = 'group' and exists (
        select 1
        from public.group_chat_members gcm
        where gcm.chat_id = group_chat_id
          and gcm.profile_id = sender_id
      ))
    )
  );

-- message_reads: 본인에 대한 읽음 정보만 insert/select
drop policy if exists "message_reads_select_own" on public.message_reads;
create policy "message_reads_select_own"
  on public.message_reads
  for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  );

drop policy if exists "message_reads_insert_own" on public.message_reads;
create policy "message_reads_insert_own"
  on public.message_reads
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  );

-- typing_states: 본인 상태만 insert/update, 참여자만 조회
drop policy if exists "typing_states_select_participant" on public.typing_states;
create policy "typing_states_select_participant"
  on public.typing_states
  for select
  using (
    case
      when target_type = 'direct' then
        exists (
          select 1
          from public.direct_conversation_participants dcp
          join public.profiles p on p.id = dcp.profile_id
          where dcp.conversation_id = direct_conversation_id
            and p.auth_user_id = auth.uid()
        )
      when target_type = 'group' then
        exists (
          select 1
          from public.group_chat_members gcm
          join public.profiles p on p.id = gcm.profile_id
          where gcm.chat_id = group_chat_id
            and p.auth_user_id = auth.uid()
        )
      else false
    end
  );

drop policy if exists "typing_states_upsert_own" on public.typing_states;
create policy "typing_states_upsert_own"
  on public.typing_states
  for insert
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  );

drop policy if exists "typing_states_update_own" on public.typing_states;
create policy "typing_states_update_own"
  on public.typing_states
  for update
  using (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = profile_id
        and p.auth_user_id = auth.uid()
    )
  );

-- 5. user_blocks
alter table public.user_blocks enable row level security;

-- user_blocks: 본인 관련(내가 차단했거나, 내가 차단당한) 관계만 조회 가능
drop policy if exists "user_blocks_select_related" on public.user_blocks;
create policy "user_blocks_select_related"
  on public.user_blocks
  for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.auth_user_id = auth.uid()
        and p.id in (blocker_id, blocked_profile_id)
    )
  );

-- user_blocks: 본인이 blocker 인 경우에만 차단 생성 가능
drop policy if exists "user_blocks_insert_own" on public.user_blocks;
create policy "user_blocks_insert_own"
  on public.user_blocks
  for insert
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = blocker_id
        and p.auth_user_id = auth.uid()
    )
  );

-- user_blocks: 본인이 만든 차단만 해제(delete) 가능
drop policy if exists "user_blocks_delete_own" on public.user_blocks;
create policy "user_blocks_delete_own"
  on public.user_blocks
  for delete
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = blocker_id
        and p.auth_user_id = auth.uid()
    )
  );

-- 6. reports
alter table public.reports enable row level security;

-- reports: 본인이 신고한 내역만 조회 가능
drop policy if exists "reports_select_own" on public.reports;
create policy "reports_select_own"
  on public.reports
  for select
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = reporter_id
        and p.auth_user_id = auth.uid()
    )
  );

-- reports: 본인 reporter_id 로만 신고 생성 가능
drop policy if exists "reports_insert_own" on public.reports;
create policy "reports_insert_own"
  on public.reports
  for insert
  with check (
    exists (
      select 1
      from public.profiles p
      where p.id = reporter_id
        and p.auth_user_id = auth.uid()
    )
  );

