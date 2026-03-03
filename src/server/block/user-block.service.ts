import type { Database } from "../common/db-executor";
import type { TransactionManager } from "../common/transaction-manager";
import { UserBlockRepository } from "./user-block.repository";
import type {
  CreateUserBlockInput,
  DeleteUserBlockInput,
} from "./user-block.types";

export class UserBlockService {
  constructor(
    private readonly database: Database,
    private readonly transactionManager: TransactionManager,
    private readonly userBlockRepository: UserBlockRepository,
  ) {}

  findBlock(blockerId: string, blockedProfileId: string) {
    return this.userBlockRepository.findBlock(
      this.database,
      blockerId,
      blockedProfileId,
    );
  }

  isBlocked(blockerId: string, blockedProfileId: string) {
    return this.userBlockRepository.isBlocked(
      this.database,
      blockerId,
      blockedProfileId,
    );
  }

  isEitherBlocked(profileAId: string, profileBId: string) {
    return this.userBlockRepository.isEitherBlocked(
      this.database,
      profileAId,
      profileBId,
    );
  }

  listBlocksByBlocker(blockerId: string, limit = 50) {
    return this.userBlockRepository.listBlocksByBlocker(
      this.database,
      blockerId,
      limit,
    );
  }

  createBlock(input: CreateUserBlockInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.userBlockRepository.createBlock({
        executor: tx,
        ...input,
      }),
    );
  }

  deleteBlock(blockerId: string, blockedProfileId: string) {
    return this.transactionManager.inTransaction((tx) =>
      this.userBlockRepository.deleteBlock(tx, blockerId, blockedProfileId),
    );
  }

  createBlocksBulk(inputs: CreateUserBlockInput[]) {
    return this.transactionManager.inTransaction(async (tx) => {
      for (const input of inputs) {
        await this.userBlockRepository.createBlock({
          executor: tx,
          ...input,
        });
      }
    });
  }

  deleteBlocksBulk(inputs: DeleteUserBlockInput[]) {
    return this.transactionManager.inTransaction(async (tx) => {
      for (const input of inputs) {
        await this.userBlockRepository.deleteBlock(
          tx,
          input.blockerId,
          input.blockedProfileId,
        );
      }
    });
  }
}
