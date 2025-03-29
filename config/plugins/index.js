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
import { minifyHTML } from "rollup-plugin-minify-html";
import { dest, pageInputs, stylesDest, getCssFilePath } from "../paths.js";
import { production } from "../env.js";
import { collectDependencies } from "./collectDependencies.js";
import { emitCss } from "./emitCss.js";
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
		compilerOptions: {
			cssHash: ({ hash, filename, name }) => `bc-${hash(filename + name)}`,
		},
	}),
	// Take all the css output from svelte files
	emitCss(),
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
