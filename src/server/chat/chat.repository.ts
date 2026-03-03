import { and, eq } from "drizzle-orm";
import {
  directConversations,
  groupChats,
  messages,
} from "../../../drizzle/schema";
import type { DbExecutor } from "../common/db-executor";
import type {
  CreateDirectConversationInput,
  CreateGroupChatInput,
  DirectConversation,
  EditMessageInput,
  GroupChat,
  Message,
  SendDirectMessageInput,
  SendGroupMessageInput,
  SoftDeleteMessageInput,
} from "./chat.types";

export class ChatRepository {
  async createDirectConversation(
    params: { executor: DbExecutor } & CreateDirectConversationInput,
  ): Promise<DirectConversation> {
    const [row] = await params.executor
      .insert(directConversations)
      .values({
        createdBy: params.createdBy,
      })
      .returning();

    return row;
  }

  async findDirectConversationById(
    executor: DbExecutor,
    id: string,
  ): Promise<DirectConversation | null> {
    const [row] = await executor
      .select()
      .from(directConversations)
      .where(eq(directConversations.id, id));

    return row ?? null;
  }

  async createGroupChat(
    params: { executor: DbExecutor } & CreateGroupChatInput,
  ): Promise<GroupChat> {
    const [row] = await params.executor
      .insert(groupChats)
      .values({
        name: params.name,
        ownerId: params.ownerId,
        description: params.description ?? null,
        isPrivate: params.isPrivate ?? false,
        avatarUrl: params.avatarUrl ?? null,
      })
      .returning();

    return row;
  }

  async findGroupChatById(
    executor: DbExecutor,
    id: string,
  ): Promise<GroupChat | null> {
    const [row] = await executor
      .select()
      .from(groupChats)
      .where(eq(groupChats.id, id));

    return row ?? null;
  }

  async sendDirectMessage(
    params: { executor: DbExecutor } & SendDirectMessageInput,
  ): Promise<Message> {
    const sentAt = params.sentAt ?? new Date();

    const [row] = await params.executor
      .insert(messages)
      .values({
        targetType: "direct",
        directConversationId: params.conversationId,
        groupChatId: null,
        senderId: params.senderId,
        content: params.content,
        sentAt,
      })
      .returning();

    await params.executor
      .update(directConversations)
      .set({ lastMessageAt: sentAt })
      .where(eq(directConversations.id, params.conversationId));

    return row;
  }

  async sendGroupMessage(
    params: { executor: DbExecutor } & SendGroupMessageInput,
  ): Promise<Message> {
    const sentAt = params.sentAt ?? new Date();

    const [row] = await params.executor
      .insert(messages)
      .values({
        targetType: "group",
        groupChatId: params.groupChatId,
        directConversationId: null,
        senderId: params.senderId,
        content: params.content,
        sentAt,
      })
      .returning();

    await params.executor
      .update(groupChats)
      .set({
        updatedAt: sentAt,
      })
      .where(eq(groupChats.id, params.groupChatId));

    return row;
  }

  async listMessagesByDirectConversationId(
    executor: DbExecutor,
    conversationId: string,
    limit = 50,
  ): Promise<Message[]> {
    return executor
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.targetType, "direct"),
          eq(messages.directConversationId, conversationId),
        ),
      )
      .orderBy(messages.createdAt)
      .limit(limit);
  }

  async listMessagesByGroupChatId(
    executor: DbExecutor,
    chatId: string,
    limit = 50,
  ): Promise<Message[]> {
    return executor
      .select()
      .from(messages)
      .where(
        and(eq(messages.targetType, "group"), eq(messages.groupChatId, chatId)),
      )
      .orderBy(messages.createdAt)
      .limit(limit);
  }

  async editMessage(
    params: { executor: DbExecutor } & EditMessageInput,
  ): Promise<Message | null> {
    const [row] = await params.executor
      .update(messages)
      .set({
        content: params.content,
        editedAt: new Date(),
      })
      .where(
        and(
          eq(messages.id, params.messageId),
          eq(messages.senderId, params.senderId),
        ),
      )
      .returning();

    return row ?? null;
  }

  async softDeleteMessage(
    params: { executor: DbExecutor } & SoftDeleteMessageInput,
  ): Promise<Message | null> {
    const [row] = await params.executor
      .update(messages)
      .set({
        deletedAt: new Date(),
      })
      .where(
        and(
          eq(messages.id, params.messageId),
          eq(messages.senderId, params.senderId),
        ),
      )
      .returning();

    return row ?? null;
  }
}
