import { describe, expect, it, vi } from "vitest";
import type {
  Database,
  DatabaseTransaction,
} from "../../../src/server/common/db-executor";
import type { TransactionManager } from "../../../src/server/common/transaction-manager";
import { ReportRepository } from "../../../src/server/report/report.repository";
import { ReportService } from "../../../src/server/report/report.service";

describe("ReportService", () => {
  it("createProfileReport는 트랜잭션에서 repository를 호출한다", async () => {
    const tx = {} as DatabaseTransaction;
    const created = { id: 1 };
    const database = {} as Database;

    const transactionManager: TransactionManager = {
      inTransaction: vi.fn((callback) => callback(tx)),
    };

    const reportRepository = {
      createProfileReport: vi.fn().mockResolvedValue(created),
    } as unknown as ReportRepository;

    const service = new ReportService(
      database,
      transactionManager,
      reportRepository,
    );

    const result = await service.createProfileReport({
      reporterId: "reporter-1",
      targetProfileId: "profile-1",
      category: "spam",
      description: null,
    });

    expect(result).toBe(created);
    expect(transactionManager.inTransaction).toHaveBeenCalledTimes(1);
    expect(reportRepository.createProfileReport).toHaveBeenCalledWith({
      executor: tx,
      reporterId: "reporter-1",
      targetProfileId: "profile-1",
      category: "spam",
      description: null,
    });
  });

  it("createProfileReportsBulk는 하나의 트랜잭션으로 다건 생성한다", async () => {
    const tx = {} as DatabaseTransaction;
    const database = {} as Database;
    const createdRows = [{ id: 1 }, { id: 2 }];

    const transactionManager: TransactionManager = {
      inTransaction: vi.fn((callback) => callback(tx)),
    };

    const reportRepository = {
      createProfileReport: vi
        .fn()
        .mockResolvedValueOnce(createdRows[0])
        .mockResolvedValueOnce(createdRows[1]),
    } as unknown as ReportRepository;

    const service = new ReportService(
      database,
      transactionManager,
      reportRepository,
    );

    const result = await service.createProfileReportsBulk([
      {
        reporterId: "reporter-1",
        targetProfileId: "profile-1",
        category: "spam",
      },
      {
        reporterId: "reporter-2",
        targetProfileId: "profile-2",
        category: "abuse",
      },
    ]);

    expect(result).toEqual(createdRows);
    expect(transactionManager.inTransaction).toHaveBeenCalledTimes(1);
    expect(reportRepository.createProfileReport).toHaveBeenNthCalledWith(1, {
      executor: tx,
      reporterId: "reporter-1",
      targetProfileId: "profile-1",
      category: "spam",
    });
    expect(reportRepository.createProfileReport).toHaveBeenNthCalledWith(2, {
      executor: tx,
      reporterId: "reporter-2",
      targetProfileId: "profile-2",
      category: "abuse",
    });
  });
});
