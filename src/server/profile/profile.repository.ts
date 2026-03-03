import { eq } from "drizzle-orm";
import { profiles } from "../../../drizzle/schema";
import type { DbExecutor } from "../common/db-executor";
import type {
  CreateProfileInput,
  Profile,
  UpdateProfileInput,
} from "./profile.types";

export class ProfileRepository {
  async create(
    params: { executor: DbExecutor } & CreateProfileInput,
  ): Promise<Profile> {
    const [row] = await params.executor
      .insert(profiles)
      .values({
        authUserId: params.authUserId,
        username: params.username,
        displayName: params.displayName ?? null,
        avatarUrl: params.avatarUrl ?? null,
        bio: params.bio ?? null,
      })
      .returning();

    return row;
  }

  async findById(executor: DbExecutor, id: string): Promise<Profile | null> {
    const [row] = await executor
      .select()
      .from(profiles)
      .where(eq(profiles.id, id));

    return row ?? null;
  }

  async findByAuthUserId(
    executor: DbExecutor,
    authUserId: string,
  ): Promise<Profile | null> {
    const [row] = await executor
      .select()
      .from(profiles)
      .where(eq(profiles.authUserId, authUserId));

    return row ?? null;
  }

  async findByUsername(
    executor: DbExecutor,
    username: string,
  ): Promise<Profile | null> {
    const [row] = await executor
      .select()
      .from(profiles)
      .where(eq(profiles.username, username));

    return row ?? null;
  }

  async updateById(
    params: { executor: DbExecutor } & UpdateProfileInput,
  ): Promise<Profile | null> {
    const [row] = await params.executor
      .update(profiles)
      .set({
        ...(params.username !== undefined ? { username: params.username } : {}),
        ...(params.displayName !== undefined
          ? { displayName: params.displayName }
          : {}),
        ...(params.avatarUrl !== undefined
          ? { avatarUrl: params.avatarUrl }
          : {}),
        ...(params.bio !== undefined ? { bio: params.bio } : {}),
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, params.id))
      .returning();

    return row ?? null;
  }
}
