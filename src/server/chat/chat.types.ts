import type { InferSelectModel } from "drizzle-orm";
import {
  directConversations,
  groupChats,
  messages,
} from "../../../drizzle/schema";

export type DirectConversation = InferSelectModel<typeof directConversations>;
export type GroupChat = InferSelectModel<typeof groupChats>;
export type Message = InferSelectModel<typeof messages>;

export type CreateDirectConversationInput = {
  createdBy: string;
};

export type CreateGroupChatInput = {
  name: string;
  ownerId: string;
  description?: string | null;
  isPrivate?: boolean;
  avatarUrl?: string | null;
};

export type SendDirectMessageInput = {
  conversationId: string;
  senderId: string;
  content: string;
  sentAt?: Date;
};

export type SendGroupMessageInput = {
  groupChatId: string;
  senderId: string;
  content: string;
  sentAt?: Date;
};

export type EditMessageInput = {
  messageId: string;
  senderId: string;
  content: string;
};

export type SoftDeleteMessageInput = {
  messageId: string;
  senderId: string;
};
