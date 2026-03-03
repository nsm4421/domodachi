## 서버 레이어 테스트 개요

현재 `tests/server` 폴더에는 Drizzle 기반 서버 레이어(Repository/Service)들에 대한 **단위 테스트**가 포함되어 있습니다. 모두 Vitest로 실행되며, DB에 실제로 접속하지 않고 **간단한 mock DB 객체** 또는 mock `TransactionManager`로 동작을 검증합니다.

### 1. ProfileRepository 테스트

- **파일**: `tests/server/profile/profile.repository.test.ts`
- **대상 코드**: `src/server/profile/profile.repository.ts`
- **검증 내용**
  - `findById(executor, id)`가:
    - mock DB에서 `id = "profile-1"` 데이터를 반환하도록 설정했을 때,
    - `null`이 아닌 결과를 반환하고, `result.id`가 `"profile-1"`인지 확인.
- **의미**
  - Drizzle `profiles` 테이블을 사용해 단일 프로필을 조회하는 기본 쿼리 로직이 정상적으로 동작하는지 확인합니다.

### 2. ChatRepository 테스트

- **파일**: `tests/server/chat/chat.repository.test.ts`
- **대상 코드**: `src/server/chat/chat.repository.ts`
- **검증 내용**
  - `listMessagesByDirectConversationId(executor, conversationId)`가:
    - mock DB에서 `directConversationId = "conv-1"`인 메시지 1개를 반환하도록 했을 때,
    - 결과 배열 길이가 `1`이고, 첫 번째 메시지의 `id`가 `"msg-1"`인지 확인.
- **의미**
  - `messages` 테이블에서:
    - `target_type = 'direct'`
    - 해당 `direct_conversation_id`
    - 생성 시각 오름차순 정렬
  - 조건으로 메시지 목록을 조회하는 기본 쿼리 로직이 올바르게 체이닝되어 있는지 검증합니다.

### 3. UserBlockRepository 테스트 (유저 차단)

- **파일**: `tests/server/block/user-block.repository.test.ts`
- **대상 코드**: `src/server/block/user-block.repository.ts`
- **검증 내용**
  - `isBlocked(executor, blockerId, blockedProfileId)`:
    - mock DB가 `[{ id: "1" }]`을 반환할 때 → `true`를 반환해야 함.
    - mock DB가 `[]`를 반환할 때 → `false`를 반환해야 함.
- **의미**
  - `user_blocks` 테이블을 조회해 **차단 관계의 존재 여부**를 boolean으로 판단하는 로직이 기대대로 동작하는지 확인합니다.
  - `createBlock`, `deleteBlock`은 부수효과만 있고 반환 값을 사용하지 않으므로, 현재는 호출이 예외 없이 수행될 수 있는 구조로 mock 되어 있습니다.

### 4. ReportRepository 테스트 (신고)

- **파일**: `tests/server/report/report.repository.test.ts`
- **대상 코드**: `src/server/report/report.repository.ts`
- **검증 내용**
  - `createProfileReport({ executor, reporterId, targetProfileId, category, description })`가:
    - mock DB의 `insert().values().returning()`이 `mockReport` 1개를 반환하도록 했을 때,
    - 결과가 `mockReport`와 완전히 동일한지(`toEqual`) 확인.
- **의미**
  - `reports` 테이블에 **프로필 대상 신고를 생성하는 insert + returning 흐름**이 올바르게 연결되어 있는지 검증합니다.
  - 상태/리뷰 관련 업데이트(`updateStatus`)는 현재 부수효과 위주의 메서드로, 필요 시 별도 테스트 케이스를 추가할 수 있습니다.

### 5. ReportService 테스트 (트랜잭션 경계)

- **파일**: `tests/server/report/report.service.test.ts`
- **대상 코드**: `src/server/report/report.service.ts`
- **검증 내용**
  - `createProfileReport(input)`이:
    - `transactionManager.inTransaction(...)` 내부에서,
    - repository 메서드에 `executor: tx`를 전달해 호출되는지 확인.
- **의미**
  - Service layer가 트랜잭션 경계를 책임지고, Repository는 `db|tx` 실행기만 받아 쿼리를 수행하는 구조를 보장합니다.

### 6. TransactionManager 테스트

- **파일**: `tests/server/common/transaction-manager.test.ts`
- **대상 코드**: `src/server/common/transaction-manager.ts`
- **검증 내용**
  - `DrizzleTransactionManager.inTransaction`이 `db.transaction`을 위임 호출하는지 확인.
- **의미**
  - 트랜잭션 인프라 추상화가 올바르게 동작하는지 단위 수준에서 검증합니다.

---

## 테스트 실행 방법

### 전체 테스트 실행

- **명령어**

```bash
npm test
```

- **동작**
  - `vitest`가 실행되며 `tests/**/*.test.ts` 패턴에 매칭되는 모든 테스트 파일을 실행합니다.

### 특정 파일만 테스트 실행

예를 들어, `ChatRepository` 관련 테스트만 실행하고 싶다면:

```bash
npm test -- tests/server/chat/chat.repository.test.ts
```

### 워치 모드로 테스트 실행

로컬 개발 시 파일 변경을 감지하면서 반복 실행하고 싶다면:

```bash
npm test -- --watch
```

혹은 특정 테스트 파일만 워치 모드로:

```bash
npm test -- tests/server/profile/profile.repository.test.ts --watch
```

---

이 문서는 서버 레이어의 단위 테스트들이 **어떤 동작을 검증하는지**와 **어떤 명령어로 실행할 수 있는지**를 빠르게 파악하기 위한 요약입니다. 신규 Repository를 추가할 때는, 같은 패턴으로 `tests/server/...`에 테스트 파일을 추가하고 이 문서를 함께 업데이트하는 것을 권장합니다.
