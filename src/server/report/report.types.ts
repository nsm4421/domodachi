import type { InferSelectModel } from "drizzle-orm";
import { reportCategory, reports, reportStatus } from "../../../drizzle/schema";

export type Report = InferSelectModel<typeof reports>;

export type ReportCategory = (typeof reportCategory.enumValues)[number];
export type ReportStatus = (typeof reportStatus.enumValues)[number];

export type CreateProfileReportInput = {
  reporterId: string;
  targetProfileId: string;
  category: ReportCategory;
  description?: string | null;
};

export type CreateMessageReportInput = {
  reporterId: string;
  targetMessageId: string;
  category: ReportCategory;
  description?: string | null;
};

export type CreateGroupChatReportInput = {
  reporterId: string;
  targetGroupChatId: string;
  category: ReportCategory;
  description?: string | null;
};

export type UpdateReportStatusInput = {
  id: number | string;
  status: ReportStatus;
  reviewedBy: string;
  resolutionNote?: string | null;
};
