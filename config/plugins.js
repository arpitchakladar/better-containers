import path from "path";
import fs from "fs";
import svelte from "rollup-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import css from "rollup-plugin-css-only";
import { spawn } from "child_process";
import { dest, pageInputs, stylesDest } from "./paths.js";
import {
	getCssFileOutput,
	generateHtmlPlugins,
	moduleMap,
	production,
} from "./helpers.js";

// Run Svelte Type Checking
function runSvelteCheck() {
	return {
		name: "svelte-check",
		buildStart() {
			if (!production) {
				const checker = spawn(
					"npx",
					["svelte-check", "--tsconfig", "./tsconfig.json"],
					{
						stdio: "inherit",
						shell: true,
					},
				);
				checker.on("close", (code) => {
					if (code !== 0) console.error("svelte-check failed!");
				});
			}
		},
	};
}

// Collect dependencies for each module
export function collectDependencies() {
	const pageScriptPaths = Object.values(pageInputs);
	return {
		name: "collect-dependencies",
		resolveId(source, importer) {
			if (importer && source.endsWith(".svelte")) {
				if (pageScriptPaths.includes(importer)) {
					if (!moduleMap[importer]) moduleMap[importer] = [];
					moduleMap[importer].push(source);
				} else {
					for (const modules of Object.values(moduleMap)) {
						if (modules.includes(importer)) {
							modules.push(source);
						}
					}
				}
			}
			return null; // Continue resolving normally
		},
	};
}

export default [
	alias({
		entries: {
			"@": path.resolve("src"),
			"@assets": path.resolve("assets"),
		},
	}),
	resolve({
		browser: true,
		dedupe: ["svelte"],
	}),
	commonjs(),
	typescript({
		check: true,
		tsconfig: "./tsconfig.json",
	}),
	collectDependencies(),
	svelte({
		preprocess: sveltePreprocess(),
	}),
	css({
		output: (styles, styleNodes) => {
			Object.keys(styleNodes).forEach((file) => {
				const outputFile = getCssFileOutput(file);
				fs.mkdirSync(path.dirname(outputFile), { recursive: true });
				fs.appendFileSync(outputFile, styleNodes[file], "utf8");
			});
		},
	}),
	runSvelteCheck(),
	// Generate separate HTML files per page
	...generateHtmlPlugins(),
	copy({
		targets: [
			{ src: "src/manifest.json", dest },
			{ src: "src/pages/global.css", dest: stylesDest },
		],
	}),
	production && terser(),
];
