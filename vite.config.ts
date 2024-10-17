import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import * as fs from "fs-extra";
import path from "path";

export default defineConfig({
	plugins: [
		webExtension(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"), // Set "@" as an alias for "src"
		},
	},
	build: {
		rollupOptions: {
			input: {
				index: "src/index.ts",
			},
		},
	},
	server: {
		port: 3000,
		hmr: {
			host: "localhost"
		},
	},
});
