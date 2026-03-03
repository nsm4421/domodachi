import type { Database } from "../common/db-executor";
import type { TransactionManager } from "../common/transaction-manager";
import { ChatRepository } from "./chat.repository";
import type {
  CreateDirectConversationInput,
  CreateGroupChatInput,
  EditMessageInput,
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

  findDirectConversationById(id: string) {
    return this.chatRepository.findDirectConversationById(this.database, id);
  }

  findGroupChatById(id: string) {
    return this.chatRepository.findGroupChatById(this.database, id);
  }

  listMessagesByDirectConversationId(conversationId: string, limit = 50) {
    return this.chatRepository.listMessagesByDirectConversationId(
      this.database,
      conversationId,
      limit,
    );
  }

  listMessagesByGroupChatId(chatId: string, limit = 50) {
    return this.chatRepository.listMessagesByGroupChatId(
      this.database,
      chatId,
      limit,
    );
  }

  createDirectConversation(input: CreateDirectConversationInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.chatRepository.createDirectConversation({
        executor: tx,
        ...input,
      }),
    );
  }

  createGroupChat(input: CreateGroupChatInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.chatRepository.createGroupChat({
        executor: tx,
        ...input,
      }),
    );
  }

  sendDirectMessage(input: SendDirectMessageInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.chatRepository.sendDirectMessage({
        executor: tx,
        ...input,
      }),
    );
  }

  sendGroupMessage(input: SendGroupMessageInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.chatRepository.sendGroupMessage({
        executor: tx,
        ...input,
      }),
    );
  }

  editMessage(input: EditMessageInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.chatRepository.editMessage({
        executor: tx,
        ...input,
      }),
    );
  }

  softDeleteMessage(input: SoftDeleteMessageInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.chatRepository.softDeleteMessage({
        executor: tx,
        ...input,
      }),
    );
  }

  sendDirectMessagesBulk(inputs: SendDirectMessageInput[]) {
    return this.transactionManager.inTransaction(async (tx) => {
      const created = [];

      for (const input of inputs) {
        created.push(
          await this.chatRepository.sendDirectMessage({
            executor: tx,
            ...input,
          }),
        );
      }

      return created;
    });
  }

  sendGroupMessagesBulk(inputs: SendGroupMessageInput[]) {
    return this.transactionManager.inTransaction(async (tx) => {
      const created = [];

      for (const input of inputs) {
        created.push(
          await this.chatRepository.sendGroupMessage({
            executor: tx,
            ...input,
          }),
        );
      }

      return created;
    });
  }
}
