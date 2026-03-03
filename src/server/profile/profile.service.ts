import type { Database } from "../common/db-executor";
import type { TransactionManager } from "../common/transaction-manager";
import { ProfileRepository } from "./profile.repository";
import type { CreateProfileInput, UpdateProfileInput } from "./profile.types";

export class ProfileService {
  constructor(
    private readonly database: Database,
    private readonly transactionManager: TransactionManager,
    private readonly profileRepository: ProfileRepository,
  ) {}

  findById(id: string) {
    return this.profileRepository.findById(this.database, id);
  }

  findByAuthUserId(authUserId: string) {
    return this.profileRepository.findByAuthUserId(this.database, authUserId);
  }

  findByUsername(username: string) {
    return this.profileRepository.findByUsername(this.database, username);
  }

  create(input: CreateProfileInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.profileRepository.create({
        executor: tx,
        ...input,
      }),
    );
  }

  updateById(input: UpdateProfileInput) {
    return this.transactionManager.inTransaction((tx) =>
      this.profileRepository.updateById({
        executor: tx,
        ...input,
      }),
    );
  }

  createBulk(inputs: CreateProfileInput[]) {
    return this.transactionManager.inTransaction(async (tx) => {
      const created = [];

      for (const input of inputs) {
        created.push(
          await this.profileRepository.create({
            executor: tx,
            ...input,
          }),
        );
      }

      return created;
    });
  }
}
