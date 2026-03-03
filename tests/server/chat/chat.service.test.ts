import { describe, expect, it, vi } from "vitest";
import type {
  Database,
  DatabaseTransaction,
} from "../../../src/server/common/db-executor";
import type { TransactionManager } from "../../../src/server/common/transaction-manager";
import { ChatRepository } from "../../../src/server/chat/chat.repository";
import { ChatService } from "../../../src/server/chat/chat.service";

describe("ChatService", () => {
  it("sendDirectMessage는 트랜잭션에서 repository를 호출한다", async () => {
    const tx = {} as DatabaseTransaction;
    const database = {} as Database;
    const created = { id: "m1" };
    const transactionManager: TransactionManager = {
      inTransaction: vi.fn((callback) => callback(tx)),
    };

    const chatRepository = {
      sendDirectMessage: vi.fn().mockResolvedValue(created),
    } as unknown as ChatRepository;

    const service = new ChatService(
      database,
      transactionManager,
      chatRepository,
    );

    const result = await service.sendDirectMessage({
      conversationId: "c1",
      senderId: "p1",
      content: "hello",
    });

    expect(result).toBe(created);
    expect(transactionManager.inTransaction).toHaveBeenCalledTimes(1);
    expect(chatRepository.sendDirectMessage).toHaveBeenCalledWith({
      executor: tx,
      conversationId: "c1",
      senderId: "p1",
      content: "hello",
    });
  });

  it("listMessagesByGroupChatId는 read executor로 조회한다", async () => {
    const database = {} as Database;
    const transactionManager = {} as TransactionManager;
    const rows = [{ id: "m1" }];

    const chatRepository = {
      listMessagesByGroupChatId: vi.fn().mockResolvedValue(rows),
    } as unknown as ChatRepository;

    const service = new ChatService(
      database,
      transactionManager,
      chatRepository,
    );
    const result = await service.listMessagesByGroupChatId("g1", 20);

    expect(result).toBe(rows);
    expect(chatRepository.listMessagesByGroupChatId).toHaveBeenCalledWith(
      database,
      "g1",
      20,
    );
  });
});
