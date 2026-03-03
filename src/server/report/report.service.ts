import type { Database } from "../common/db-executor";
import type { TransactionManager } from "../common/transaction-manager";
import { ReportRepository } from "./report.repository";
import type {
  CreateGroupChatReportInput,
  CreateMessageReportInput,
  CreateProfileReportInput,
  ReportStatus,
  UpdateReportStatusInput,
} from "./report.types";

export class ReportService {
  constructor(
    private readonly database: Database,
    private readonly transactionManager: TransactionManager,
    private readonly reportRepository: ReportRepository,
  ) {}

  findById(id: number | string) {
    return this.reportRepository.findById(this.database, id);
  }

  listByReporterId(reporterId: string, limit = 50) {
    return this.reportRepository.listByReporterId(
      this.database,
      reporterId,
      limit,
    );
  }

  listByStatus(status: ReportStatus, limit = 50) {
    return this.reportRepository.listByStatus(this.database, status, limit);
  }

  createProfileReport(input: CreateProfileReportInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.reportRepository.createProfileReport({
        executor: tx,
        ...input,
      }),
    );
  }

  createMessageReport(input: CreateMessageReportInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.reportRepository.createMessageReport({
        executor: tx,
        ...input,
      }),
    );
  }

  createGroupChatReport(input: CreateGroupChatReportInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.reportRepository.createGroupChatReport({
        executor: tx,
        ...input,
      }),
    );
  }

  updateStatus(input: UpdateReportStatusInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.reportRepository.updateStatus({
        executor: tx,
        ...input,
      }),
    );
  }

  createProfileReportsBulk(inputs: CreateProfileReportInput[]) {
    return this.transactionManager.inTransaction(async (tx) => {
      const created = [];

      for (const input of inputs) {
        created.push(
          await this.reportRepository.createProfileReport({
            executor: tx,
            ...input,
          }),
        );
      }

      return created;
    });
  }

  createMessageReportsBulk(inputs: CreateMessageReportInput[]) {
    return this.transactionManager.inTransaction(async (tx) => {
      const created = [];

      for (const input of inputs) {
        created.push(
          await this.reportRepository.createMessageReport({
            executor: tx,
            ...input,
          }),
        );
      }

      return created;
    });
  }

  createGroupChatReportsBulk(inputs: CreateGroupChatReportInput[]) {
    return this.transactionManager.inTransaction(async (tx) => {
      const created = [];

      for (const input of inputs) {
        created.push(
          await this.reportRepository.createGroupChatReport({
            executor: tx,
            ...input,
          }),
        );
      }

      return created;
    });
  }

  updateStatusesBulk(inputs: UpdateReportStatusInput[]) {
    return this.transactionManager.inTransaction(async (tx) => {
      for (const input of inputs) {
        await this.reportRepository.updateStatus({
          executor: tx,
          ...input,
        });
      }
    });
  }
}
