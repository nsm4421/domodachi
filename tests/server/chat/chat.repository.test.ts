import { describe, it, expect } from "vitest";
import type { DbExecutor } from "../../../src/server/common/db-executor";
import { ChatRepository } from "../../../src/server/chat/chat.repository";

// 간단한 mock DB: 필요한 메서드 체인만 흉내냄
function createMockDb<T>(resultRows: T[]): DbExecutor {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          orderBy: () => ({
            limit: () => Promise.resolve(resultRows),
          }),
        }),
      }),
    }),
  } as unknown as DbExecutor;
}

describe("ChatRepository", () => {
  it("listMessagesByDirectConversationId는 지정한 대화방의 메시지들을 반환한다", async () => {
    const mockMessages = [
      {
        id: "msg-1",
        targetType: "direct",
        directConversationId: "conv-1",
        groupChatId: null,
        senderId: "profile-1",
        content: "hello",
        createdAt: new Date(),
        editedAt: null,
        deletedAt: null,
        sentAt: new Date(),
      },
    ];

    const mockDb = createMockDb(mockMessages);
    const repo = new ChatRepository();

    const result = await repo.listMessagesByDirectConversationId(
      mockDb,
      "conv-1",
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("msg-1");
  });
});
