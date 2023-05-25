import type { Config } from "drizzle-kit";

export default {
	schema: "./src/db/schemas.ts",
	out: "./drizzle",
	connectionString: "dev.db",
} satisfies Config;
