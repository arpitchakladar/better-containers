import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createHtmlPlugin } from "vite-plugin-html";
import fs from "fs";
import path from "path";

function mergeObjects(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, any> {
	// Create a new object to hold the merged result
	const result = { ...obj1 };

	// Iterate over all keys of obj2
	for (const key in obj2) {
		if (obj2.hasOwnProperty(key)) {
			const val1 = result[key];
			const val2 = obj2[key];

			// Handle arrays separately
			if (Array.isArray(val1) && Array.isArray(val2)) {
				result[key] = [...val1, ...val2]; // Merge arrays instead of deep merging
			}
			// If both are objects, merge them recursively
			else if (typeof val2 === "object" && val2 !== null && typeof val1 === "object" && val1 !== null) {
				result[key] = mergeObjects(val1, val2);
			}
			// Otherwise, overwrite the value
			else {
				result[key] = val2;
			}
		}
	}

	return result;
}

export default defineConfig(({ mode }) => {
	return {
		plugins: [
			svelte({
				compilerOptions: mode === "production"
					? {
						cssHash: ({ hash, css }) => `better-containers-${hash(css)}`
					}
					: {}
			}),
			createHtmlPlugin({
				minify: mode === "production",
			}),
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
			rollupOptions: {
				input: {
					"pages": "src/pages/index.html",
				},
			},
		},
	};
});
