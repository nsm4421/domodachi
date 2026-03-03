import type { InferSelectModel } from "drizzle-orm";
import { profiles } from "../../../drizzle/schema";

export type Profile = InferSelectModel<typeof profiles>;

export type CreateProfileInput = {
  authUserId: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
};

export type UpdateProfileInput = {
  id: string;
  username?: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
};
