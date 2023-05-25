import { redirect } from "solid-start/server";
import { createCookieSessionStorage } from "solid-start/session";
import { eq } from "drizzle-orm";
import { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { db } from "~/db";
import { users } from "~/db/schemas";
type LoginForm = {
	username: string;
	password: string;
};

export async function getUserByUsername({ username }: { username: string }) {
	return await db.select().from(users).where(eq(users.username, username)).get();
}

export async function register({ username, password }: LoginForm) {
	return await db
		.insert(users)
		.values({
			username: username,
			password,
		})
		.returning();
}

export async function login({ username, password }: LoginForm) {
	const user = await db.select().from(users).where(eq(users.username, username)).get();
	if (!user) return null;
	const isCorrectPassword = password === user.password;
	if (!isCorrectPassword) return null;
	return user;
}

const storage = createCookieSessionStorage({
	cookie: {
		name: "RJ_session",
		// secure doesn't work on localhost for Safari
		// https://web.dev/when-to-use-local-https/
		secure: true,
		secrets: ["hello"],
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30,
		httpOnly: true,
	},
});

export function getUserSession(request: Request) {
	return storage.getSession(request.headers.get("Cookie"));
}

export async function getUserId(request: Request) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") return null;
	return userId;
}

export async function requireUserId(
	request: Request,
	redirectTo: string = new URL(request.url).pathname
) {
	const session = await getUserSession(request);
	const userId = session.get("userId");
	if (!userId || typeof userId !== "string") {
		const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}
	return userId;
}

export async function getUser(db: BetterSQLite3Database, request: Request) {
	const userId = await getUserId(request);
	if (typeof userId !== "string") {
		return null;
	}

	try {
		const user = await db
			.select({ username: users.username, id: users.id })
			.from(users)
			.where(eq(users.id, Number(userId)))
			.get();
		return user;
	} catch {
		throw logout(request);
	}
}

export async function logout(request: Request) {
	const session = await storage.getSession(request.headers.get("Cookie"));
	return redirect("/login", {
		headers: {
			"Set-Cookie": await storage.destroySession(session),
		},
	});
}

export async function createUserSession(userId: string, redirectTo: string) {
	const session = await storage.getSession();
	session.set("userId", userId);
	return redirect(redirectTo, {
		headers: {
			"Set-Cookie": await storage.commitSession(session),
		},
	});
}
