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
import { minifyHTML } from "rollup-plugin-minify-html";
import {
	dest,
	pageInputs,
	stylesDest,
	getCssFilePath,
} from "../paths.js";
import {
	dependencyMap,
	cssDependencyMap,
	production,
	appendFileRecursive,
	resolveDependencies,
	transformDependencies,
} from "../helpers.js";
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
			resolveDependencies();
			transformDependencies();
			const cssDependencyKeys = Object.keys(cssDependencyMap);
			const cssDependencyEntries = Object.entries(cssDependencyMap);
			Object.keys(styleNodes).forEach((entryCssFile) => {
				Object.keys(dependencyMap).forEach((entryModule) => {
					dependencyMap[entryModule] = [...new Set(dependencyMap[entryModule])];
				});
				const moduleOutputCssFile = getCssFilePath(entryCssFile);
				const targetOutputCssFile = cssDependencyKeys.includes(
					moduleOutputCssFile,
				)
					? moduleOutputCssFile
					: cssDependencyEntries.find(([_, cssDependencies]) =>
							cssDependencies.includes(moduleOutputCssFile),
					)[0];
				appendFileRecursive(targetOutputCssFile, styleNodes[entryCssFile]);
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
	minifyHTML({
		minifyOutput: production,
		minifierOptions: {
			collapseWhitespace: true,
			minifyCSS: true,
			minifyJS: true,
			minifyURLs: true,
		},
	}),
	production && terser(),
];
