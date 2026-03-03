import { describe, expect, it, vi } from "vitest";
import type {
  Database,
  DatabaseTransaction,
} from "../../../src/server/common/db-executor";
import type { TransactionManager } from "../../../src/server/common/transaction-manager";
import { ProfileRepository } from "../../../src/server/profile/profile.repository";
import { ProfileService } from "../../../src/server/profile/profile.service";

describe("ProfileService", () => {
  it("findById는 read executor로 repository를 호출한다", async () => {
    const database = {} as Database;
    const transactionManager = {} as TransactionManager;
    const row = { id: "profile-1" };

    const profileRepository = {
      findById: vi.fn().mockResolvedValue(row),
    } as unknown as ProfileRepository;

    const service = new ProfileService(
      database,
      transactionManager,
      profileRepository,
    );

    const result = await service.findById("profile-1");

    expect(result).toEqual({ ok: true, data: row });
    expect(profileRepository.findById).toHaveBeenCalledWith(
      database,
      "profile-1",
    );
  });

  it("createBulk는 트랜잭션으로 다건 생성한다", async () => {
    const tx = {} as DatabaseTransaction;
    const database = {} as Database;
    const transactionManager: TransactionManager = {
      inTransaction: vi.fn((callback) => callback(tx)),
    };

    const profileRepository = {
      create: vi
        .fn()
        .mockResolvedValueOnce({ id: "profile-1" })
        .mockResolvedValueOnce({ id: "profile-2" }),
    } as unknown as ProfileRepository;

    const service = new ProfileService(
      database,
      transactionManager,
      profileRepository,
    );

    const result = await service.createBulk([
      { authUserId: "auth-1", username: "user1" },
      { authUserId: "auth-2", username: "user2" },
    ]);

    expect(result).toEqual({
      ok: true,
      data: [{ id: "profile-1" }, { id: "profile-2" }],
    });
    expect(transactionManager.inTransaction).toHaveBeenCalledTimes(1);
    expect(profileRepository.create).toHaveBeenNthCalledWith(1, {
      executor: tx,
      authUserId: "auth-1",
      username: "user1",
    });
    expect(profileRepository.create).toHaveBeenNthCalledWith(2, {
      executor: tx,
      authUserId: "auth-2",
      username: "user2",
    });
  });
});
