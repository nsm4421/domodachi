import type { db } from "../../../drizzle/client";

export type Database = typeof db;
export type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];
export type DbExecutor = Database | DatabaseTransaction;
