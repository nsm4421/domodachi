import type { InferSelectModel } from "drizzle-orm";
import { userBlocks } from "../../../drizzle/schema";

export type UserBlock = InferSelectModel<typeof userBlocks>;

export type CreateUserBlockInput = {
  blockerId: string;
  blockedProfileId: string;
  reason?: string | null;
};

export type DeleteUserBlockInput = {
  blockerId: string;
  blockedProfileId: string;
};
