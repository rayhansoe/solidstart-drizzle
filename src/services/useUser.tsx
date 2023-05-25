import { createServerData$, redirect } from "solid-start/server";
import { getUser } from "./session";
// import { db } from "~/db";
import Database from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";

export const useUser = () =>
	createServerData$(async (_, { request }) => {
		const sqlite = new Database("dev.db");
		const db: BetterSQLite3Database = drizzle(sqlite);
		const user = await getUser(db, request);

		if (!user) {
			throw redirect("/login");
		}

		return user;
	});
