import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig(({}) => {
	const DEV = process.env.NODE_ENV === "development";
	return {
		plugins: [
			svelte(DEV
				? undefined
				: {
					cssHash: ({ hash, css }) => `bc-${hash(css)}`
				} as any
			),
			webExtension({
				disableAutoLaunch: true,
			}),
		],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "src"),
				"@assets": path.resolve(__dirname, "assets"),
			},
		},
		build: {
			outDir: process.env.OUT_DIR || "dist",
		},
		server: {
			hmr: false,
		},
	};
});
