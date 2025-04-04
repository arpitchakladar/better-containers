import * as R from "remeda";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export const srcPath = path.resolve(__dirname, "../src");

export const destPath =
	process.env.OUT_DIR || path.resolve(__dirname, "../dist");
export const stylesDestPath = path.resolve(destPath, "styles");

// Helper to get all pages
function getPages() {
	const pagesDir = path.join(__dirname, "../src/pages");

	return R.pipe(
		fs.readdirSync(pagesDir),
		R.filter((page) => fs.existsSync(path.join(pagesDir, page, "index.ts"))),
		R.map((page) => [page, path.join(pagesDir, page, "index.ts")]),
		R.fromEntries(),
	);
}

function getBackgroundScripts() {
	const backgroundScriptsDir = path.join(__dirname, "../src/background");

	return R.pipe(
		fs.readdirSync(backgroundScriptsDir),
		R.map((backgroundScript) => {
			const nestedScriptPath = path.join(
				backgroundScriptsDir,
				backgroundScript,
				"index.ts",
			);
			return R.conditional(
				backgroundScript,
				[
					(fileOrFolder) =>
						fileOrFolder.endsWith(".ts") || fileOrFolder.endsWith(".js"),
					(file) => [
						file.replace(/\.(ts|js)$/, ""),
						path.join(backgroundScriptsDir, file),
					],
				],
				[
					(_fileOrFolder) => fs.existsSync(nestedScriptPath),
					(file) => [file, nestedScriptPath],
				],
				R.conditional.defaultCase((_fileOrFolder) => null),
			);
		}),
		R.filter(R.isNonNullish),
		R.fromEntries(),
	);
}

export const pageInputs = getPages();
export const backgroundScriptInputs = getBackgroundScripts();

export const pageScriptNames = Object.keys(pageInputs);
export const backgroundScriptNames = Object.keys(backgroundScriptInputs);
export const pageScriptPaths = Object.values(pageInputs);

export const getRelativeDestPath = R.partialBind(path.relative, destPath);

export const getEntryFileFromName = R.conditional(
	[R.isIncludedIn(pageScriptNames), (name) => `pages/${name}/index.js`],
	[R.isIncludedIn(backgroundScriptNames), (name) => `background/${name}.js`],
	R.conditional.defaultCase((name) => `modules/${name}.js`),
);

export function getCssFilePath(filePath) {
	const pageName = R.pathOr(
		filePath.match(/\/pages\/([^/]+)\/index\.ts$/),
		"1",
		null,
	);
	return pageName
		? path.resolve(destPath, "pages", pageName, "style.css")
		: path.resolve(
				stylesDestPath,
				path.basename(filePath).replace(/\.[^/.]+$/, "") + ".css",
			);
}
