import type { Database, DatabaseTransaction } from "./db-executor";

export interface TransactionManager {
  inTransaction<T>(
    callback: (tx: DatabaseTransaction) => Promise<T>,
  ): Promise<T>;
}

export class DrizzleTransactionManager implements TransactionManager {
  constructor(private readonly database: Database) {}

  inTransaction<T>(
    callback: (tx: DatabaseTransaction) => Promise<T>,
  ): Promise<T> {
    return this.database.transaction((tx) => callback(tx));
  }
}
