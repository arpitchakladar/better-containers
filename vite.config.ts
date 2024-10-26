import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import { createHtmlPlugin } from "vite-plugin-html";
import fs from "fs";
import path from "path";

async function copyDirectory(src: string, dest: string) {
	// Ensure destination directory exists
	if (!fs.existsSync(dest)) {
		fs.mkdirSync(dest, { recursive: true });
	}

	// Read all files and directories in the source
	const entries = await fs.promises.readdir(src, { withFileTypes: true });

	// Iterate over each entry
	for (const entry of entries) {
		const srcPath = path.join(src, entry.name);
		const destPath = path.join(dest, entry.name.replace(/:/g, "_")); // Replace colons with underscores

		if (entry.isDirectory()) {
			// Recursively copy directories
			await copyDirectory(srcPath, destPath);
		} else {
			// Copy files
			await fs.promises.copyFile(srcPath, destPath);
		}
	}
}

export default defineConfig(({ mode }) => ({
	plugins: [
		svelte({
			compilerOptions: mode === "production"
				? {
					cssHash: ({ hash, css }) => `better-containers-${hash(css)}`
				}
				: {}
		}),
		webExtension({
			disableAutoLaunch: true
		}),
		createHtmlPlugin({
			minify:  mode === "production",
		}),
		{
			name: "copy-to-vmshare",
			closeBundle() {
				const destPath = "/vmshare/better-containers";
				const srcPath = path.resolve(__dirname, "dist");
				fs.rmSync(destPath, { recursive: true });
				copyDirectory(srcPath, destPath);
				console.log(`Copied file: ${srcPath} to ${destPath}`);
			},
		},
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src"), // Set "@" as an alias for "src"
			"@assets": path.resolve(__dirname, "assets"), // Set "@" as an alias for "src"
		},
	},
	server: {
		port: 3000,
		hmr: false,
		open: false
	},
}));
