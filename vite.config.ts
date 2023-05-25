import solid from "solid-start/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [solid()],
	ssr: { external: ["better-sqlite3"] },
});
