import path from "path";
import svelte from "rollup-plugin-svelte";
import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import { minifyHTML } from "rollup-plugin-minify-html";
import { stylesDestPath } from "../paths.js";
import { production } from "../env.js";
import { collectSvelteDependenciesPlugin } from "./collectSvelteDependenciesPlugin.js";
import { loadCssPlugin, emitCssPlugin } from "./emitCssPlugin.js";
import { runSvelteCheckPlugin } from "./runSvelteCheckPlugin.js";
import { generateHtmlPlugin } from "./generateHtmlPlugin.js";
import { manifestPlugin } from "./manifestPlugin.js";
import { babelPlugin } from "./babelPlugin.js";

export default [
	resolve({
		browser: true,
		dedupe: ["svelte"],
		exportConditions: ["svelte"],
		extensions: [".svelte"],
	}),
	commonjs(),
	alias({
		entries: {
			"@": path.resolve("src"),
			"@assets": path.resolve("assets"),
		},
	}),
	typescript({
		check: true,
		tsconfig: "./tsconfig.json",
	}),
	collectSvelteDependenciesPlugin(),
	svelte({
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
		targets: [{ src: "src/pages/global.css", dest: stylesDestPath }],
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
	babelPlugin(),
	production && terser(),
];
