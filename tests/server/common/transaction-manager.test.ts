import { describe, expect, it, vi } from "vitest";
import type {
  Database,
  DatabaseTransaction,
} from "../../../src/server/common/db-executor";
import { DrizzleTransactionManager } from "../../../src/server/common/transaction-manager";

describe("DrizzleTransactionManager", () => {
  it("inTransaction은 db.transaction을 위임한다", async () => {
    const tx = { token: "tx" } as unknown as DatabaseTransaction;
    const db = {
      transaction: vi.fn(
        <T>(callback: (client: DatabaseTransaction) => Promise<T>) =>
          callback(tx),
      ),
    } as unknown as Database;

    const manager = new DrizzleTransactionManager(db);
    const result = await manager.inTransaction(async (client) => {
      expect(client).toBe(tx);
      return "done";
    });

    expect(result).toBe("done");
    expect(db.transaction).toHaveBeenCalledTimes(1);
  });
});
