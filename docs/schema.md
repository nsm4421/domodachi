## 데이터베이스 스키마 개요

이 문서는 Supabase(PostgreSQL)를 사용하는 채팅 어플의 기본 스키마를 설명합니다.  
`docs/schema.sql` 파일에는 실제 DDL이 정의되어 있습니다.

### 주요 목표

- **유저 계정 관리**: Supabase `auth.users` 와 연결되는 `profiles` 테이블
- **1:1 채팅**: 두 명의 유저만 참여하는 `direct_conversations`
- **그룹 채팅**: 여러 명이 참여하는 `group_chats`
- **메시지 공통 처리**: 1:1 / 그룹 메시지를 하나의 `messages` 테이블에서 관리

---

## 1. 유저 프로필 (`profiles`)

- **테이블**: `public.profiles`
- **역할**: Supabase 인증(`auth.users`)과 분리된, 앱 전용 유저 프로필 정보 저장

**주요 컬럼**

- **`id` (uuid, PK)**: 앱 내부에서 사용하는 프로필 ID
- **`auth_user_id` (uuid, unique, not null)**: Supabase `auth.users.id` 와 1:1 매핑되는 FK
- **`username` (text, unique, not null)**: 유저네임 (채팅에서 표시, 검색용)
- `display_name` (text): 표시 이름 (닉네임)
- `avatar_url` (text): 아바타 이미지 경로
- `bio` (text): 한 줄 소개 등
- `created_at`, `updated_at` (timestamptz): 생성/수정 시각

> 프론트엔드에서는 **항상 `profiles` 기준으로** 유저를 식별하고, 인증 토큰에서 가져온 `auth_user_id` 로 프로필을 조인하는 패턴을 사용하면 좋습니다.

---

## 2. 1:1 채팅 (`direct_conversations`, `direct_conversation_participants`)

### 2.1 `direct_conversations`

- **테이블**: `public.direct_conversations`
- **역할**: 1:1 채팅방(대화 세션) 자체를 의미

**주요 컬럼**

- **`id` (uuid, PK)**: 1:1 대화방 ID
- **`created_by` (uuid, FK → `profiles.id`)**: 이 대화를 생성한 유저
- `created_at` (timestamptz): 생성 시각
- `last_message_at` (timestamptz): 마지막 메시지 시각 (리스트 정렬용)

> 1:1 대화의 “두 사람” 정보는 별도의 참여자 테이블에서 관리합니다.

### 2.2 `direct_conversation_participants`

- **테이블**: `public.direct_conversation_participants`
- **역할**: 각 1:1 대화방의 참여자(정확히 2명)를 저장하고, 유저별 상태(읽음, 뮤트 등)를 관리

**주요 컬럼**

- **`conversation_id` (uuid, FK → `direct_conversations.id`)**
- **`profile_id` (uuid, FK → `profiles.id`)**
- **PK**: `(conversation_id, profile_id)` (한 유저는 한 대화방에 한 번만 참여)
- `last_read_at` (timestamptz): 이 유저가 마지막으로 읽은 시각
- `muted` (boolean): 알림 뮤트 여부
- `blocked` (boolean): 차단 여부 (간단한 Block 기능 구현 가능)
- `created_at` (timestamptz): 참여 생성 시각

> **1:1 유니크 보장 전략**  
> 실제로는 `(small_profile_id, big_profile_id)` 같은 방식으로 “두 유저 조합이 하나의 대화방만 갖도록” 제약을 추가할 수 있습니다.  
> 초기 버전에서는 위 테이블 구조만으로도 충분하며, 나중에 유저 수가 늘어나면 추가 제약/인덱스를 설계하면 됩니다.

---

## 3. 그룹 채팅 (`group_chats`, `group_chat_members`)

### 3.1 `group_chats`

- **테이블**: `public.group_chats`
- **역할**: 그룹 채팅방 메타데이터 (이름, 설명, 소유자 등)

**주요 컬럼**

- **`id` (uuid, PK)**: 그룹 채팅방 ID
- **`name` (text, not null)**: 방 이름
- `description` (text): 설명
- **`owner_id` (uuid, FK → `profiles.id`)**: 방장
- `is_private` (boolean, default false): 공개/비공개 여부
- `avatar_url` (text): 그룹 아바타
- `created_at`, `updated_at` (timestamptz)

### 3.2 `group_chat_members`

- **테이블**: `public.group_chat_members`
- **역할**: 그룹 채팅 참여자와 역할/상태를 관리

**주요 컬럼**

- **`chat_id` (uuid, FK → `group_chats.id`)**
- **`profile_id` (uuid, FK → `profiles.id`)**
- **PK**: `(chat_id, profile_id)`
- `role` (text, default `'member'`): `owner`, `admin`, `member` 등
- `joined_at` (timestamptz): 입장 시각
- `last_read_at` (timestamptz): 각 유저 기준 마지막 읽은 시각
- `muted` (boolean): 알림 뮤트 여부

> 권한 체크는 `role` 값을 기반으로 구현할 수 있습니다. 예: `owner`/`admin`만 초대, 강퇴, 이름 변경 가능 등.

---

## 4. 메시지 공통 구조 (`messages`)

- **테이블**: `public.messages`
- **역할**: 1:1 / 그룹 채팅에서 발생하는 모든 메시지를 단일 테이블에 저장

### 4.1 메시지 타깃 구분

- **타입**: `message_target_type` (enum)
  - `'direct'`: 1:1 채팅
  - `'group'`: 그룹 채팅

**주요 컬럼**

- **`id` (uuid, PK)**: 메시지 ID
- **`target_type` (enum)**: `'direct'` or `'group'`
- `direct_conversation_id` (uuid, FK → `direct_conversations.id`): 1:1 메시지일 때 사용
- `group_chat_id` (uuid, FK → `group_chats.id`): 그룹 메시지일 때 사용
- **`sender_id` (uuid, FK → `profiles.id`)**: 보낸 유저
- **`content` (text, not null)**: 메시지 텍스트
- `created_at` (timestamptz): 생성 시각
- `edited_at` (timestamptz): 수정 시각
- `deleted_at` (timestamptz): 삭제(소프트 삭제) 시각
- `sent_at` (timestamptz): 정렬/페이지네이션용 전송 시각

**제약 조건**

- `messages_target_consistency` 체크 제약:
  - `target_type = 'direct'` 이면 `direct_conversation_id`는 not null, `group_chat_id`는 null
  - `target_type = 'group'` 이면 `group_chat_id`는 not null, `direct_conversation_id`는 null

**인덱스**

- 1:1 대화 메시지 조회:
  - `idx_messages_direct_conversation_id_created_at`
- 그룹 채팅 메시지 조회:
  - `idx_messages_group_chat_id_created_at`

---

## 5. 읽음 처리 / 읽음 표시 (`message_reads`)

- **테이블**: `public.message_reads`
- **역할**: “누가 어떤 메시지를 언제 읽었는지”를 저장

**주요 컬럼**

- **`message_id` (uuid, FK → `messages.id`)**
- **`profile_id` (uuid, FK → `profiles.id`)**
- **PK**: `(message_id, profile_id)`
- `read_at` (timestamptz): 읽은 시각

> 단순히 “마지막 읽은 메시지 ID”만 필요하다면,  
> `direct_conversation_participants.last_read_at` / `group_chat_members.last_read_at` 만으로도 충분하지만,  
> **정확한 읽음 표시(메시지 단위)** 가 필요하면 `message_reads` 와 함께 쓰는 것을 추천합니다.

---

## 6. 타이핑 상태 (`typing_states`)

- **테이블**: `public.typing_states`
- **역할**: “누가 어디에서 타이핑 중인지” 상태를 저장 (일반적으로 아주 짧게 유지되거나, Realtime 전용으로 사용)

**주요 컬럼**

- **`id` (uuid, PK)**
- **`target_type` (enum)**: `'direct'` or `'group'`
- `direct_conversation_id` (uuid, FK → `direct_conversations.id`)
- `group_chat_id` (uuid, FK → `group_chats.id`)
- **`profile_id` (uuid, FK → `profiles.id`)**
- `is_typing` (boolean, default true): 현재 타이핑 중인지 여부
- `updated_at` (timestamptz): 마지막 업데이트 시각

**제약 조건**

- `typing_states_target_consistency` 체크 제약:
  - `target_type = 'direct'` → `direct_conversation_id` not null, `group_chat_id` null
  - `target_type = 'group'` → `group_chat_id` not null, `direct_conversation_id` null

> 실서비스에서는 이 테이블을 짧은 TTL을 가진 캐시 또는 Realtime 채널 상태 등으로 대체하기도 합니다.  
> Supabase Realtime 이벤트와 조합해서, 특정 시간이 지나면 클라이언트에서 상태를 자동으로 끄도록 구현하면 좋습니다.

---

## 7. 차단 및 신고 (`user_blocks`, `reports`)

### 7.1 유저 차단 (`user_blocks`)

- **테이블**: `public.user_blocks`
- **역할**: “어떤 유저가 다른 유저를 전역적으로 차단했는지”를 저장

**주요 컬럼**

- **`id` (bigserial, PK)**: 차단 레코드 ID
- **`blocker_id` (uuid, FK → `profiles.id`)**: 차단한 유저
- **`blocked_profile_id` (uuid, FK → `profiles.id`)**: 차단당한 유저
- `reason` (text): (선택) 유저가 적는 차단 사유
- `created_at` (timestamptz): 차단 시각

**제약/인덱스**

- 자기 자신 차단 방지: `check (blocker_id <> blocked_profile_id)`
- **UNIQUE**: `(blocker_id, blocked_profile_id)` — 같은 상대를 중복 차단 불가
- 인덱스:
  - `idx_user_blocks_blocker_id` (내가 차단한 목록 조회용)
  - `idx_user_blocks_blocked_profile_id` (특정 유저가 얼마나 차단됐는지 조회용)

> **사용 패턴**
>
> - 메시지/대화 목록 조회 시, `where not exists (select 1 from user_blocks ...)` 형태로 차단된 상대의 컨텐츠를 숨깁니다.
> - 1:1 대화 내에서의 임시 차단/뮤트는 `direct_conversation_participants.blocked`, `muted` 로 처리하고,  
>   여러 대화/그룹 전체에서 상대를 안 보고 싶을 때는 `user_blocks` 를 사용한다고 생각하면 됩니다.

### 7.2 신고 (`reports`)

- **테이블**: `public.reports`
- **역할**: “누가 무엇을 왜 신고했고, 어떻게 처리되었는지”까지 추적

**관련 enum 타입**

- `report_target_type`: `'profile'`, `'message'`, `'group_chat'`
- `report_status`: `'pending'`, `'reviewing'`, `'resolved'`, `'rejected'`
- `report_category`: `'spam'`, `'abuse'`, `'nudity'`, `'hate'`, `'others'`

**주요 컬럼**

- **`id` (bigserial, PK)**: 신고 레코드 ID
- **`reporter_id` (uuid, FK → `profiles.id`)**: 신고한 유저
- **`target_type` (enum)**: 신고 대상 종류
- `target_profile_id` (uuid, FK → `profiles.id`): `target_type = 'profile'` 일 때
- `target_message_id` (uuid, FK → `messages.id`): `target_type = 'message'` 일 때
- `target_group_chat_id` (uuid, FK → `group_chats.id`): `target_type = 'group_chat'` 일 때
- **`category` (enum)**: 신고 카테고리
- `description` (text): 상세 사유 (자유 입력)
- **`status` (enum)**: 처리 상태 (`'pending'` 기본값)
- `reviewed_by` (uuid, FK → `profiles.id`): 처리한 관리자/모더레이터
- `reviewed_at` (timestamptz): 처리 시각
- `resolution_note` (text): 처리 결과/메모
- `created_at`, `updated_at` (timestamptz)

**제약/인덱스**

- 타깃 일관성 체크:
  - `target_type = 'profile'` → `target_profile_id` not null, 나머지 null
  - `target_type = 'message'` → `target_message_id` not null, 나머지 null
  - `target_type = 'group_chat'` → `target_group_chat_id` not null, 나머지 null
- 인덱스:
  - `idx_reports_status` (대기/처리 중 신고 대시보드용)
  - `idx_reports_target_profile`
  - `idx_reports_target_message`
  - `idx_reports_target_group_chat`

> **사용 패턴**
>
> - 프론트에서 신고 모달에 “카테고리 선택 + 사유 입력”을 받아 `reports` 에 insert.
> - 관리자용 화면에서는 `status = 'pending'` 인 항목을 중심으로 리스트를 보여주고,  
>   처리 후 `status`, `reviewed_by`, `reviewed_at`, `resolution_note` 를 업데이트하는 식으로 운영합니다.

---

## 8. 확장 아이디어

- 메시지에 파일/이미지 첨부용 `message_attachments` 테이블 추가
- 그룹 초대 링크 / 초대 코드 관리 테이블
- 고정 메시지(pinned messages) 기능
- 채널/스레드(thread) 구조 (Slack 스타일) 추가

이 스키마를 기반으로, 다음 단계에서 Supabase RLS 정책과 Next.js API 레이어를 함께 설계하면 됩니다.
