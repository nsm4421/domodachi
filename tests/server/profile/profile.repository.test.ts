import { describe, it, expect } from "vitest";
import type { DbExecutor } from "../../../src/server/common/db-executor";
import { ProfileRepository } from "../../../src/server/profile/profile.repository";

// 아주 단순한 mock DB: select().from().where() 체인을 흉내 내고, 준비된 rows를 반환한다.
function createMockDb<T>(rows: T[]): DbExecutor {
  return {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve(rows),
      }),
    }),
  } as unknown as DbExecutor;
}

describe("ProfileRepository", () => {
  it("findById는 존재하는 프로필을 반환한다", async () => {
    const mockProfile = {
      id: "profile-1",
      authUserId: "auth-1",
      username: "user1",
      displayName: "User 1",
      avatarUrl: null,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDb = createMockDb([mockProfile]);
    const repo = new ProfileRepository();

    const result = await repo.findById(mockDb, "profile-1");

    expect(result).not.toBeNull();
    expect(result?.id).toBe("profile-1");
  });
});
