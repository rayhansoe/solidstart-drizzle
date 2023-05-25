import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("user", {
	id: integer("id").primaryKey(),
	username: text("username"),
	password: text("password"),
});
