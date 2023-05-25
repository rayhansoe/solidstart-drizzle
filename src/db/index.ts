import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const sqlite = new Database("dev.db");
export const db: BetterSQLite3Database = drizzle(sqlite);

await migrate(db, { migrationsFolder: "drizzle" });
