import path from "path";
import { fileURLToPath } from "url";
import svelte from "rollup-plugin-svelte";
import sveltePreprocess from "svelte-preprocess";
import typescript from "rollup-plugin-typescript2";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import html from "@rollup/plugin-html";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import alias from "@rollup/plugin-alias";
import css from "rollup-plugin-css-only";
import fs from "fs";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dest = process.env.OUT_DIR || path.resolve(__dirname, "dist");

const production = process.env.NODE_ENV === "production";

// Helper to get all pages
function getPages() {
	const pagesDir = path.join(__dirname, "src", "pages");
	const pages = fs
		.readdirSync(pagesDir)
		.filter((page) => fs.existsSync(path.join(pagesDir, page, "index.ts")));

	return pages.reduce((entries, page) => {
		entries[page] = path.join(pagesDir, page, "index.ts");
		return entries;
	}, {});
}

const pageInputs = getPages();
const pageScriptPaths = Object.values(pageInputs);
const pageScriptNames = Object.keys(pageInputs);

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
					if (code !== 0) {
						console.error("svelte-check failed!");
						process.exit(1);
					}
				});
			}
		},
	};
}

const moduleMap = {};
function collectDependencies() {

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

function getCssFileOutput(cssPath) {
	const regex = /src\/pages\/([^/]+)\/[^/]+\.css/;
	const match = cssPath.match(regex);
	return path.resolve(
		dest,
		`styles/${path.basename(cssPath)}`,
	);
}

// Get all page inputs
const backgroundScriptInputs = {
	container: "src/background/container.ts",
	cookies: "src/background/cookies.ts",
};

const backgroundScriptNames = Object.keys(backgroundScriptInputs);

export default {
	input: {
		...backgroundScriptInputs,
		...pageInputs, // Add dynamic page inputs
	},
	output: {
		dir: dest,
		format: "esm",
		sourcemap: !production,
		entryFileNames({ name }) {
			if (pageScriptNames.includes(name)) {
				return "pages/[name]/index.js";
			} else if (backgroundScriptNames.includes(name)) {
				return "background/[name].js";
			}

			return "modules/[name].js";
		},
		chunkFileNames: "modules/[name].js",
	},
	plugins: [
		alias({
			entries: {
				"@": path.resolve(__dirname, "src"),
				"@assets": path.resolve(__dirname, "assets"),
			},
		}),
		resolve({
			browser: true, // Force browser version of dependencies
			dedupe: ["svelte"], // Prevent multiple Svelte versions
		}),
		commonjs(),
		typescript({
			check: true, // Type checking handled by svelte-check
			tsconfig: "./tsconfig.json",
		}),
		collectDependencies(),
		svelte({
			preprocess: sveltePreprocess(), // Ensure styles inside Svelte files are processed
		}),
		css({
			output: (styles, styleNodes) => {
				// Creates separate CSS files per input
				Object.keys(styleNodes).forEach((file) => {
					const outputFile = getCssFileOutput(file);
					fs.mkdirSync(path.dirname(outputFile), {
						recursive: true,
					});
					fs.appendFileSync(outputFile, styleNodes[file], "utf8");
				});
			},
		}),
		runSvelteCheck(),
		// Generate separate HTML files for each page
		...Object.entries(pageInputs).map(([page, scriptPath]) =>
			html({
				title: `Better Containers`,
				fileName: `pages/${page}/index.html`,
				template: () => {
					const linkCssTags = [...new Set(moduleMap[pageInputs[page]])]
						.map(
							(sveltePath) =>
								`<link rel="stylesheet" href="/${path.relative(dest, getCssFileOutput(sveltePath.replace(/\.svelte$/, ".css")))}" type="text/css"/>`,
						)
						.join("\n		");
					return `<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="/styles/global.css" type="text/css" />
		${linkCssTags}
	</head>
	<body>
		<div id="better-containers"></div>
		<script src="/pages/${page}/index.js" type="module"></script>
	</body>
</html>`;
				},
			}),
		),
		copy({
			targets: [
				{
					src: "src/manifest.json",
					dest,
				},
				{
					src: "src/pages/global.css",
					dest: path.resolve(dest, "styles"),
				},
			],
		}),
		production && terser(),
	],
	watch: {
		clearScreen: false,
	},
};
