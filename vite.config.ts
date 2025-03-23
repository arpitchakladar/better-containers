import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import checker from "vite-plugin-checker";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig(({}) => {
	return {
		plugins: [
			checker({
				typescript: true, // Enables `tsc --noEmit`
				svelte: true,
			}),
			svelte(),
			webExtension({
				disableAutoLaunch: true,
				additionalInputs: [
					path.relative(
						process.cwd(),
						path.join(__dirname, "src", "pages", "select-container", "index.html"),
					),
				],
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
