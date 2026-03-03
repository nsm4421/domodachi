import { describe, it, expect } from "vitest";
import type { DbExecutor } from "../../../src/server/common/db-executor";
import { UserBlockRepository } from "../../../src/server/block/user-block.repository";

// mock DB for userBlocks
function createMockDb<T>(resultRows: T[]): DbExecutor {
  return {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(resultRows),
        }),
      }),
    }),
    insert: () => ({
      values: () => ({
        onConflictDoNothing: () => Promise.resolve(),
      }),
    }),
    delete: () => ({
      where: () => Promise.resolve(),
    }),
  } as unknown as DbExecutor;
}

describe("UserBlockRepository", () => {
  it("isBlocked는 차단 관계가 있으면 true를 반환한다", async () => {
    const mockDb = createMockDb([{ id: "1" }]);
    const repo = new UserBlockRepository();

    const result = await repo.isBlocked(mockDb, "blocker-1", "blocked-1");

    expect(result).toBe(true);
  });

  it("isBlocked는 차단 관계가 없으면 false를 반환한다", async () => {
    const mockDb = createMockDb([]);
    const repo = new UserBlockRepository();

    const result = await repo.isBlocked(mockDb, "blocker-1", "blocked-1");

    expect(result).toBe(false);
  });
});
