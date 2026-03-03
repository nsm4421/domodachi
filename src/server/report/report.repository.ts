import { desc, eq } from "drizzle-orm";
import { reports, reportTargetType } from "../../../drizzle/schema";
import type { DbExecutor } from "../common/db-executor";
import type {
  CreateGroupChatReportInput,
  CreateMessageReportInput,
  CreateProfileReportInput,
  Report,
  ReportStatus,
  UpdateReportStatusInput,
} from "./report.types";

export class ReportRepository {
  private toReportId(id: number | string): number {
    if (typeof id === "number") {
      return id;
    }

    const parsed = Number(id);
    if (!Number.isInteger(parsed)) {
      throw new Error(`Invalid report id: ${id}`);
    }

    return parsed;
  }

  async createProfileReport(
    params: { executor: DbExecutor } & CreateProfileReportInput,
  ): Promise<Report> {
    const [row] = await params.executor
      .insert(reports)
      .values({
        reporterId: params.reporterId,
        targetType: reportTargetType.enumValues[0], // 'profile'
        targetProfileId: params.targetProfileId,
        category: params.category,
        description: params.description ?? null,
      })
      .returning();

    return row;
  }

  async createMessageReport(
    params: { executor: DbExecutor } & CreateMessageReportInput,
  ): Promise<Report> {
    const [row] = await params.executor
      .insert(reports)
      .values({
        reporterId: params.reporterId,
        targetType: reportTargetType.enumValues[1], // 'message'
        targetMessageId: params.targetMessageId,
        category: params.category,
        description: params.description ?? null,
      })
      .returning();

    return row;
  }

  async createGroupChatReport(
    params: { executor: DbExecutor } & CreateGroupChatReportInput,
  ): Promise<Report> {
    const [row] = await params.executor
      .insert(reports)
      .values({
        reporterId: params.reporterId,
        targetType: reportTargetType.enumValues[2], // 'group_chat'
        targetGroupChatId: params.targetGroupChatId,
        category: params.category,
        description: params.description ?? null,
      })
      .returning();

    return row;
  }

  async findById(
    executor: DbExecutor,
    id: number | string,
  ): Promise<Report | null> {
    const reportId = this.toReportId(id);

    const [row] = await executor
      .select()
      .from(reports)
      .where(eq(reports.id, reportId))
      .limit(1);

    return row ?? null;
  }

  async listByReporterId(
    executor: DbExecutor,
    reporterId: string,
    limit = 50,
  ): Promise<Report[]> {
    return executor
      .select()
      .from(reports)
      .where(eq(reports.reporterId, reporterId))
      .orderBy(desc(reports.createdAt))
      .limit(limit);
  }

  async listByStatus(
    executor: DbExecutor,
    status: ReportStatus,
    limit = 50,
  ): Promise<Report[]> {
    return executor
      .select()
      .from(reports)
      .where(eq(reports.status, status))
      .orderBy(desc(reports.createdAt))
      .limit(limit);
  }

  async updateStatus(
    params: { executor: DbExecutor } & UpdateReportStatusInput,
  ): Promise<void> {
    const reportId = this.toReportId(params.id);

    await params.executor
      .update(reports)
      .set({
        status: params.status,
        reviewedBy: params.reviewedBy,
        reviewedAt: new Date(),
        resolutionNote: params.resolutionNote ?? null,
      })
      .where(eq(reports.id, reportId));
  }
}
