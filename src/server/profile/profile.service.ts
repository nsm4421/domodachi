import type { Database } from "../common/db-executor";
import { tryService, type ServiceResult } from "../common/service-result";
import type { TransactionManager } from "../common/transaction-manager";
import { ProfileRepository } from "./profile.repository";
import type {
  CreateProfileInput,
  Profile,
  UpdateProfileInput,
} from "./profile.types";

export class ProfileService {
  constructor(
    private readonly database: Database,
    private readonly transactionManager: TransactionManager,
    private readonly profileRepository: ProfileRepository,
  ) {}

  findById(id: string): Promise<ServiceResult<Profile | null>> {
    return tryService("profile.findById", () =>
      this.profileRepository.findById(this.database, id),
    );
  }

  findByAuthUserId(authUserId: string): Promise<ServiceResult<Profile | null>> {
    return tryService("profile.findByAuthUserId", () =>
      this.profileRepository.findByAuthUserId(this.database, authUserId),
    );
  }

  findByUsername(username: string): Promise<ServiceResult<Profile | null>> {
    return tryService("profile.findByUsername", () =>
      this.profileRepository.findByUsername(this.database, username),
    );
  }

  create(input: CreateProfileInput): Promise<ServiceResult<Profile>> {
    return tryService("profile.create", () =>
      this.transactionManager.inTransaction((tx) =>
        this.profileRepository.create({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  updateById(
    input: UpdateProfileInput,
  ): Promise<ServiceResult<Profile | null>> {
    return tryService("profile.updateById", () =>
      this.transactionManager.inTransaction((tx) =>
        this.profileRepository.updateById({
          executor: tx,
          ...input,
        }),
      ),
    );
  }

  createBulk(inputs: CreateProfileInput[]): Promise<ServiceResult<Profile[]>> {
    return tryService("profile.createBulk", () =>
      this.transactionManager.inTransaction(async (tx) => {
        const created: Profile[] = [];

        for (const input of inputs) {
          created.push(
            await this.profileRepository.create({
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
