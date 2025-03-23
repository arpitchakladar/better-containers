import { defineConfig } from "vite";
import eslintPlugin from "vite-plugin-eslint";
import webExtension from "vite-plugin-web-extension";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import path from "path";

export default defineConfig(({}) => {
	return {
		plugins: [
			eslintPlugin({
				fix: true,
				failOnError: false,
				failOnWarning: false,
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
			rollupOptions: {
				// external: ["hex-to-css-filter"],
			},
		},
		// optimizeDeps: {
		// 	include: ["hex-to-css-filter"], // Force Vite to optimize it
		// },
		server: {
			hmr: false,
		},
	};
});
