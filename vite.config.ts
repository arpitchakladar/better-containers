import { defineConfig } from "vite";
import webExtension from "vite-plugin-web-extension";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import fs from "fs";
import path from "path";

import os from "os";

function getLocalIps(): string[] {
	const interfaces = os.networkInterfaces();
	const ips: string[] = ["127.0.0.1"];

	for (const key in interfaces) {
		for (const net of interfaces[key] || []) {
			if (net.family === "IPv4" && !net.internal) {
				ips.push(net.address);
			}
		}
	}
	return ips;
}

const localIps = getLocalIps();
const hmrPort = 8081;

export default defineConfig(({ command }) => {
	const DEV = process.env.NODE_ENV === "development";
	return {
		plugins: [
			svelte(DEV
				? undefined
				: {
					cssHash: ({ hash, css }) => `bc-${hash(css)}`
				}
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
			host: "0.0.0.0",
			port: 8080,
			strictPort: true,
			hmr: {
				protocol: "ws",
				host: "0.0.0.0",
				port: hmrPort,
			},
		},
	};
});
