import { describe, expect, it, vi } from "vitest";
import type {
  Database,
  DatabaseTransaction,
} from "../../../src/server/common/db-executor";
import type { TransactionManager } from "../../../src/server/common/transaction-manager";
import { UserBlockRepository } from "../../../src/server/block/user-block.repository";
import { UserBlockService } from "../../../src/server/block/user-block.service";

describe("UserBlockService", () => {
  it("createBlock은 트랜잭션에서 repository를 호출한다", async () => {
    const tx = {} as DatabaseTransaction;
    const database = {} as Database;
    const transactionManager: TransactionManager = {
      inTransaction: vi.fn((callback) => callback(tx)),
    };

    const userBlockRepository = {
      createBlock: vi.fn().mockResolvedValue(undefined),
    } as unknown as UserBlockRepository;

    const service = new UserBlockService(
      database,
      transactionManager,
      userBlockRepository,
    );

    const result = await service.createBlock({
      blockerId: "p1",
      blockedProfileId: "p2",
      reason: "spam",
    });

    expect(result).toEqual({ ok: true, data: undefined });
    expect(transactionManager.inTransaction).toHaveBeenCalledTimes(1);
    expect(userBlockRepository.createBlock).toHaveBeenCalledWith({
      executor: tx,
      blockerId: "p1",
      blockedProfileId: "p2",
      reason: "spam",
    });
  });

  it("listBlocksByBlocker는 read executor로 조회한다", async () => {
    const database = {} as Database;
    const transactionManager = {} as TransactionManager;
    const rows = [{ id: 1 }];

    const userBlockRepository = {
      listBlocksByBlocker: vi.fn().mockResolvedValue(rows),
    } as unknown as UserBlockRepository;

    const service = new UserBlockService(
      database,
      transactionManager,
      userBlockRepository,
    );

    const result = await service.listBlocksByBlocker("p1", 30);

    expect(result).toEqual({ ok: true, data: rows });
    expect(userBlockRepository.listBlocksByBlocker).toHaveBeenCalledWith(
      database,
      "p1",
      30,
    );
  });
});
