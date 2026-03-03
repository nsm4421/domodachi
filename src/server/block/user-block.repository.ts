import { and, desc, eq, or } from "drizzle-orm";
import { userBlocks } from "../../../drizzle/schema";
import type { DbExecutor } from "../common/db-executor";
import type { CreateUserBlockInput, UserBlock } from "./user-block.types";

export class UserBlockRepository {
  async findBlock(
    executor: DbExecutor,
    blockerId: string,
    blockedProfileId: string,
  ): Promise<UserBlock | null> {
    const [row] = await executor
      .select()
      .from(userBlocks)
      .where(
        and(
          eq(userBlocks.blockerId, blockerId),
          eq(userBlocks.blockedProfileId, blockedProfileId),
        ),
      )
      .limit(1);

    return row ?? null;
  }

  async isBlocked(
    executor: DbExecutor,
    blockerId: string,
    blockedProfileId: string,
  ): Promise<boolean> {
    const [row] = await executor
      .select({ id: userBlocks.id })
      .from(userBlocks)
      .where(
        and(
          eq(userBlocks.blockerId, blockerId),
          eq(userBlocks.blockedProfileId, blockedProfileId),
        ),
      )
      .limit(1);

    return Boolean(row);
  }

  async isEitherBlocked(
    executor: DbExecutor,
    profileAId: string,
    profileBId: string,
  ): Promise<boolean> {
    const [row] = await executor
      .select({ id: userBlocks.id })
      .from(userBlocks)
      .where(
        or(
          and(
            eq(userBlocks.blockerId, profileAId),
            eq(userBlocks.blockedProfileId, profileBId),
          ),
          and(
            eq(userBlocks.blockerId, profileBId),
            eq(userBlocks.blockedProfileId, profileAId),
          ),
        ),
      )
      .limit(1);

    return Boolean(row);
  }

  async createBlock(
    params: { executor: DbExecutor } & CreateUserBlockInput,
  ): Promise<void> {
    await params.executor
      .insert(userBlocks)
      .values({
        blockerId: params.blockerId,
        blockedProfileId: params.blockedProfileId,
        reason: params.reason ?? null,
      })
      .onConflictDoNothing();
  }

  async listBlocksByBlocker(
    executor: DbExecutor,
    blockerId: string,
    limit = 50,
  ): Promise<UserBlock[]> {
    return executor
      .select()
      .from(userBlocks)
      .where(eq(userBlocks.blockerId, blockerId))
      .orderBy(desc(userBlocks.createdAt))
      .limit(limit);
  }

  async deleteBlock(
    executor: DbExecutor,
    blockerId: string,
    blockedProfileId: string,
  ): Promise<void> {
    await executor
      .delete(userBlocks)
      .where(
        and(
          eq(userBlocks.blockerId, blockerId),
          eq(userBlocks.blockedProfileId, blockedProfileId),
        ),
      );
  }
}
