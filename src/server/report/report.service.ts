import type { Database } from "../common/db-executor";
import { tryService, type ServiceResult } from "../common/service-result";
import type { TransactionManager } from "../common/transaction-manager";
import { ReportRepository } from "./report.repository";
import type {
  CreateGroupChatReportInput,
  CreateMessageReportInput,
  CreateProfileReportInput,
  Report,
  ReportStatus,
  UpdateReportStatusInput,
} from "./report.types";

export class ReportService {
  constructor(
    private readonly database: Database,
    private readonly transactionManager: TransactionManager,
    private readonly reportRepository: ReportRepository,
  ) {}

  findById(id: number | string): Promise<ServiceResult<Report | null>> {
    return tryService("report.findById", () =>
      this.reportRepository.findById(this.database, id),
    );
  }

  listByReporterId(
    reporterId: string,
    limit = 50,
  ): Promise<ServiceResult<Report[]>> {
    return tryService("report.listByReporterId", () =>
      this.reportRepository.listByReporterId(this.database, reporterId, limit),
    );
  }

  listByStatus(
    status: ReportStatus,
    limit = 50,
  ): Promise<ServiceResult<Report[]>> {
    return tryService("report.listByStatus", () =>
      this.reportRepository.listByStatus(this.database, status, limit),
    );
  }

  createProfileReport(
    input: CreateProfileReportInput,
  ): Promise<ServiceResult<Report>> {
    return tryService("report.createProfileReport", () =>
      this.transactionManager.inTransaction((tx) =>
        this.reportRepository.createProfileReport({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  createMessageReport(
    input: CreateMessageReportInput,
  ): Promise<ServiceResult<Report>> {
    return tryService("report.createMessageReport", () =>
      this.transactionManager.inTransaction((tx) =>
        this.reportRepository.createMessageReport({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  createGroupChatReport(
    input: CreateGroupChatReportInput,
  ): Promise<ServiceResult<Report>> {
    return tryService("report.createGroupChatReport", () =>
      this.transactionManager.inTransaction((tx) =>
        this.reportRepository.createGroupChatReport({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  updateStatus(input: UpdateReportStatusInput): Promise<ServiceResult<void>> {
    return tryService("report.updateStatus", () =>
      this.transactionManager.inTransaction((tx) =>
        this.reportRepository.updateStatus({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  createProfileReportsBulk(
    inputs: CreateProfileReportInput[],
  ): Promise<ServiceResult<Report[]>> {
    return tryService("report.createProfileReportsBulk", () =>
      this.transactionManager.inTransaction(async (tx) => {
        const created: Report[] = [];

        for (const input of inputs) {
          created.push(
            await this.reportRepository.createProfileReport({
              executor: tx,
              ...input,
            }),
          );
        }

        return created;
      }),
    );
  }

  createMessageReportsBulk(
    inputs: CreateMessageReportInput[],
  ): Promise<ServiceResult<Report[]>> {
    return tryService("report.createMessageReportsBulk", () =>
      this.transactionManager.inTransaction(async (tx) => {
        const created: Report[] = [];

        for (const input of inputs) {
          created.push(
            await this.reportRepository.createMessageReport({
              executor: tx,
              ...input,
            }),
          );
        }

        return created;
      }),
    );
  }

  createGroupChatReportsBulk(
    inputs: CreateGroupChatReportInput[],
  ): Promise<ServiceResult<Report[]>> {
    return tryService("report.createGroupChatReportsBulk", () =>
      this.transactionManager.inTransaction(async (tx) => {
        const created: Report[] = [];

        for (const input of inputs) {
          created.push(
            await this.reportRepository.createGroupChatReport({
              executor: tx,
              ...input,
            }),
          );
        }

        return created;
      }),
    );
  }

  updateStatusesBulk(
    inputs: UpdateReportStatusInput[],
  ): Promise<ServiceResult<void>> {
    return tryService("report.updateStatusesBulk", () =>
      this.transactionManager.inTransaction(async (tx) => {
        for (const input of inputs) {
          await this.reportRepository.updateStatus({
            executor: tx,
            ...input,
          });
        }
      }),
    );
  }
}
