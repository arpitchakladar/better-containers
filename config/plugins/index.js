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
import { collectSvelteDependenciesPlugin } from "./collectSvelteDependenciesPlugin.js";
import { loadCssPlugin, emitCssPlugin } from "./emitCssPlugin.js";
import { runSvelteCheckPlugin } from "./runSvelteCheckPlugin.js";
import { generateHtmlPlugin } from "./generateHtmlPlugin.js";
import { manifestPlugin } from "./manifestPlugin.js";

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
	collectSvelteDependenciesPlugin(),
	svelte({
		preprocess: sveltePreprocess(),
		compilerOptions: {
			cssHash: ({ hash, filename, name }) => `bc-${hash(filename + name)}`,
		},
	}),
	// Take all the css output from svelte files
	loadCssPlugin(),
	emitCssPlugin(),
	runSvelteCheckPlugin(),
	// Generate separate HTML files per page
	...generateHtmlPlugin(),
	copy({
		targets: [{ src: "src/pages/global.css", dest: stylesDest }],
	}),
	manifestPlugin(),
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
