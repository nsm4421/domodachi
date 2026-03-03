import type { Database } from "../common/db-executor";
import { tryService, type ServiceResult } from "../common/service-result";
import type { TransactionManager } from "../common/transaction-manager";
import { UserBlockRepository } from "./user-block.repository";
import type {
  CreateUserBlockInput,
  DeleteUserBlockInput,
  UserBlock,
} from "./user-block.types";

export class UserBlockService {
  constructor(
    private readonly database: Database,
    private readonly transactionManager: TransactionManager,
    private readonly userBlockRepository: UserBlockRepository,
  ) {}

  findBlock(
    blockerId: string,
    blockedProfileId: string,
  ): Promise<ServiceResult<UserBlock | null>> {
    return tryService("userBlock.findBlock", () =>
      this.userBlockRepository.findBlock(
        this.database,
        blockerId,
        blockedProfileId,
      ),
    );
  }

  isBlocked(
    blockerId: string,
    blockedProfileId: string,
  ): Promise<ServiceResult<boolean>> {
    return tryService("userBlock.isBlocked", () =>
      this.userBlockRepository.isBlocked(
        this.database,
        blockerId,
        blockedProfileId,
      ),
    );
  }

  isEitherBlocked(
    profileAId: string,
    profileBId: string,
  ): Promise<ServiceResult<boolean>> {
    return tryService("userBlock.isEitherBlocked", () =>
      this.userBlockRepository.isEitherBlocked(
        this.database,
        profileAId,
        profileBId,
      ),
    );
  }

  listBlocksByBlocker(
    blockerId: string,
    limit = 50,
  ): Promise<ServiceResult<UserBlock[]>> {
    return tryService("userBlock.listBlocksByBlocker", () =>
      this.userBlockRepository.listBlocksByBlocker(
        this.database,
        blockerId,
        limit,
      ),
    );
  }

  createBlock(input: CreateUserBlockInput): Promise<ServiceResult<void>> {
    return tryService("userBlock.createBlock", () =>
      this.transactionManager.inTransaction((tx) =>
        this.userBlockRepository.createBlock({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  deleteBlock(
    blockerId: string,
    blockedProfileId: string,
  ): Promise<ServiceResult<void>> {
    return tryService("userBlock.deleteBlock", () =>
      this.transactionManager.inTransaction((tx) =>
        this.userBlockRepository.deleteBlock(tx, blockerId, blockedProfileId),
      ),
    );
  }

  createBlocksBulk(
    inputs: CreateUserBlockInput[],
  ): Promise<ServiceResult<void>> {
    return tryService("userBlock.createBlocksBulk", () =>
      this.transactionManager.inTransaction(async (tx) => {
        for (const input of inputs) {
          await this.userBlockRepository.createBlock({
            executor: tx,
            ...input,
          });
        }
      }),
    );
  }

  deleteBlocksBulk(
    inputs: DeleteUserBlockInput[],
  ): Promise<ServiceResult<void>> {
    return tryService("userBlock.deleteBlocksBulk", () =>
      this.transactionManager.inTransaction(async (tx) => {
        for (const input of inputs) {
          await this.userBlockRepository.deleteBlock(
            tx,
            input.blockerId,
            input.blockedProfileId,
          );
        }
      }),
    );
  }
}
