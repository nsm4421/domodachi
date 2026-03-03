import type { Database } from "../common/db-executor";
import { tryService, type ServiceResult } from "../common/service-result";
import type { TransactionManager } from "../common/transaction-manager";
import { ChatRepository } from "./chat.repository";
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

export class ChatService {
  constructor(
    private readonly database: Database,
    private readonly transactionManager: TransactionManager,
    private readonly chatRepository: ChatRepository,
  ) {}

  findDirectConversationById(
    id: string,
  ): Promise<ServiceResult<DirectConversation | null>> {
    return tryService("chat.findDirectConversationById", () =>
      this.chatRepository.findDirectConversationById(this.database, id),
    );
  }

  findGroupChatById(id: string): Promise<ServiceResult<GroupChat | null>> {
    return tryService("chat.findGroupChatById", () =>
      this.chatRepository.findGroupChatById(this.database, id),
    );
  }

  listMessagesByDirectConversationId(
    conversationId: string,
    limit = 50,
  ): Promise<ServiceResult<Message[]>> {
    return tryService("chat.listMessagesByDirectConversationId", () =>
      this.chatRepository.listMessagesByDirectConversationId(
        this.database,
        conversationId,
        limit,
      ),
    );
  }

  listMessagesByGroupChatId(
    chatId: string,
    limit = 50,
  ): Promise<ServiceResult<Message[]>> {
    return tryService("chat.listMessagesByGroupChatId", () =>
      this.chatRepository.listMessagesByGroupChatId(
        this.database,
        chatId,
        limit,
      ),
    );
  }

  createDirectConversation(
    input: CreateDirectConversationInput,
  ): Promise<ServiceResult<DirectConversation>> {
    return tryService("chat.createDirectConversation", () =>
      this.transactionManager.inTransaction((tx) =>
        this.chatRepository.createDirectConversation({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  createGroupChat(
    input: CreateGroupChatInput,
  ): Promise<ServiceResult<GroupChat>> {
    return tryService("chat.createGroupChat", () =>
      this.transactionManager.inTransaction((tx) =>
        this.chatRepository.createGroupChat({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  sendDirectMessage(
    input: SendDirectMessageInput,
  ): Promise<ServiceResult<Message>> {
    return tryService("chat.sendDirectMessage", () =>
      this.transactionManager.inTransaction((tx) =>
        this.chatRepository.sendDirectMessage({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  sendGroupMessage(
    input: SendGroupMessageInput,
  ): Promise<ServiceResult<Message>> {
    return tryService("chat.sendGroupMessage", () =>
      this.transactionManager.inTransaction((tx) =>
        this.chatRepository.sendGroupMessage({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  editMessage(input: EditMessageInput): Promise<ServiceResult<Message | null>> {
    return tryService("chat.editMessage", () =>
      this.transactionManager.inTransaction((tx) =>
        this.chatRepository.editMessage({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  softDeleteMessage(
    input: SoftDeleteMessageInput,
  ): Promise<ServiceResult<Message | null>> {
    return tryService("chat.softDeleteMessage", () =>
      this.transactionManager.inTransaction((tx) =>
        this.chatRepository.softDeleteMessage({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  sendDirectMessagesBulk(
    inputs: SendDirectMessageInput[],
  ): Promise<ServiceResult<Message[]>> {
    return tryService("chat.sendDirectMessagesBulk", () =>
      this.transactionManager.inTransaction(async (tx) => {
        const created: Message[] = [];

        for (const input of inputs) {
          created.push(
            await this.chatRepository.sendDirectMessage({
              executor: tx,
              ...input,
            }),
          );
        }

        return created;
      }),
    );
  }

  sendGroupMessagesBulk(
    inputs: SendGroupMessageInput[],
  ): Promise<ServiceResult<Message[]>> {
    return tryService("chat.sendGroupMessagesBulk", () =>
      this.transactionManager.inTransaction(async (tx) => {
        const created: Message[] = [];

        for (const input of inputs) {
          created.push(
            await this.chatRepository.sendGroupMessage({
              executor: tx,
              ...input,
            }),
          );
        }

        return created;
      }),
    );
  }
}
