import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const dest = process.env.OUT_DIR || path.resolve(__dirname, "../dist");
export const stylesDest = path.resolve(dest, "styles");

// Helper to get all pages
function getPages() {
	const pagesDir = path.join(__dirname, "../src/pages");
	return fs
		.readdirSync(pagesDir)
		.filter((page) => fs.existsSync(path.join(pagesDir, page, "index.ts")))
		.reduce((entries, page) => {
			entries[page] = path.join(pagesDir, page, "index.ts");
			return entries;
		}, {});
}

function getBackgroundScripts() {
	const backgroundScriptsDir = path.join(__dirname, "../src/background");
	return fs
		.readdirSync(backgroundScriptsDir)
		.filter(
			(backgroundScriptFile) =>
				backgroundScriptFile.endsWith(".ts") ||
				backgroundScriptFile.endsWith(".js"),
		)
		.reduce((entries, backgroundScriptFile) => {
			const backgroundScript = backgroundScriptFile.replace(/\.(ts|js)$/, "");
			entries[backgroundScript] = path.join(
				backgroundScriptsDir,
				backgroundScriptFile,
			);
			return entries;
		}, {});
}

export const pageInputs = getPages();
export const backgroundScriptInputs = getBackgroundScripts();

const pageScriptNames = Object.keys(pageInputs);
const backgroundScriptNames = Object.keys(backgroundScriptInputs);

export function getEntryFileFromName(name) {
	if (pageScriptNames.includes(name)) return `pages/${name}/index.js`;
	if (backgroundScriptNames.includes(name)) return `background/${name}.js`;
	return `modules/${name}.js`;
}
