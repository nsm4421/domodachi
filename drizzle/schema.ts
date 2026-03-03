import {
  bigserial,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const messageTargetType = pgEnum("message_target_type", [
  "direct",
  "group",
]);

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  authUserId: uuid("auth_user_id").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const directConversations = pgTable("direct_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  createdBy: uuid("created_by")
    .notNull()
    .references(() => profiles.id),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }),
});

export const groupChats = pgTable("group_chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ownerId: uuid("owner_id")
    .notNull()
    .references(() => profiles.id),
  isPrivate: boolean("is_private").notNull().default(false),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  targetType: messageTargetType("target_type").notNull(),
  directConversationId: uuid("direct_conversation_id"),
  groupChatId: uuid("group_chat_id"),
  senderId: uuid("sender_id")
    .notNull()
    .references(() => profiles.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  editedAt: timestamp("edited_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  sentAt: timestamp("sent_at", { withTimezone: true }).notNull().defaultNow(),
});

export const userBlocks = pgTable("user_blocks", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  blockerId: uuid("blocker_id")
    .notNull()
    .references(() => profiles.id),
  blockedProfileId: uuid("blocked_profile_id")
    .notNull()
    .references(() => profiles.id),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const reportTargetType = pgEnum("report_target_type", [
  "profile",
  "message",
  "group_chat",
]);

export const reportStatus = pgEnum("report_status", [
  "pending",
  "reviewing",
  "resolved",
  "rejected",
]);

export const reportCategory = pgEnum("report_category", [
  "spam",
  "abuse",
  "nudity",
  "hate",
  "others",
]);

export const reports = pgTable("reports", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  reporterId: uuid("reporter_id")
    .notNull()
    .references(() => profiles.id),
  targetType: reportTargetType("target_type").notNull(),
  targetProfileId: uuid("target_profile_id"),
  targetMessageId: uuid("target_message_id"),
  targetGroupChatId: uuid("target_group_chat_id"),
  category: reportCategory("category").notNull(),
  description: text("description"),
  status: reportStatus("status").notNull().default("pending"),
  reviewedBy: uuid("reviewed_by"),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
  resolutionNote: text("resolution_note"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
