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
import { dest, pageInputs, stylesDest, getCssFileOutput } from "../paths.js";
import { moduleMap, production, writeFileRecursive } from "../helpers.js";
import { collectDependencies } from "./collectDependencies.js";
import { runSvelteCheck } from "./runSvelteCheck.js";
import { generateHtml } from "./generateHtml.js";

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
		exportConditions: ["svelte"],
		extensions: [".svelte"],
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
			Object.keys(styleNodes).forEach((entryCssFile) => {
				Object.keys(moduleMap).forEach((entryModule) => {
					moduleMap[entryModule] = [...new Set(moduleMap[entryModule])];
				});
				const outputCssFile = getCssFileOutput(entryCssFile);
				writeFileRecursive(outputCssFile, styleNodes[entryCssFile]);
			});
		},
	}),
	runSvelteCheck(),
	// Generate separate HTML files per page
	...generateHtml(),
	copy({
		targets: [
			{ src: "src/manifest.json", dest },
			{ src: "src/pages/global.css", dest: stylesDest },
		],
	}),
	production && terser(),
];
