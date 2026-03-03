import { describe, it, expect } from "vitest";
import type { DbExecutor } from "../../../src/server/common/db-executor";
import { ReportRepository } from "../../../src/server/report/report.repository";

// mock DB for reports
function createMockDb<T>(resultRows: T[]): DbExecutor {
  return {
    insert: () => ({
      values: () => ({
        returning: () => Promise.resolve(resultRows),
      }),
    }),
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => Promise.resolve(resultRows),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => Promise.resolve(),
      }),
    }),
  } as unknown as DbExecutor;
}

describe("ReportRepository", () => {
  it("createProfileReport는 생성된 신고를 반환한다", async () => {
    const mockReport = {
      id: "1",
      reporterId: "reporter-1",
      targetType: "profile",
      targetProfileId: "target-1",
      category: "spam",
      description: "스팸입니다.",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockDb = createMockDb([mockReport]);
    const repo = new ReportRepository();

    const result = await repo.createProfileReport({
      executor: mockDb,
      reporterId: "reporter-1",
      targetProfileId: "target-1",
      category: "spam",
      description: "스팸입니다.",
    });

    expect(result).toEqual(mockReport);
  });
});
