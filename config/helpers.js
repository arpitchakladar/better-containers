import path from "path";
import fs from "fs";
import html from "@rollup/plugin-html";
import {
	dest,
	pageInputs,
	backgroundScriptInputs,
	stylesDest,
	getEntryFileFromName,
} from "./paths.js";

export const production = process.env.NODE_ENV === "production";
export let moduleMap = {};

export function writeFileRecursive(filePath, data) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.appendFileSync(filePath, data, "utf8");
}

// Generate CSS file output paths
export function getCssFileOutput(cssPath) {
	return path.resolve(stylesDest, path.basename(cssPath));
}

export function generateHtmlPlugins() {
	return Object.entries(pageInputs).map(([page, scriptPath]) =>
		html({
			title: `Better Containers`,
			fileName: `pages/${page}/index.html`,
			template: () => {
				const linkCssTags = moduleMap[pageInputs[page]]
					.map(
						(sveltePath) =>
							`<link rel="stylesheet" href="/${path.relative(dest, getCssFileOutput(sveltePath.replace(/\.svelte$/, ".css")))}" type="text/css"/>`,
					)
					.join("\n\t\t");

				return `\
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="/${path.relative(dest, getCssFileOutput("global.css"))}" type="text/css" />
		${linkCssTags}
	</head>
	<body>
		<div id="better-containers"></div>
		<script src="/${getEntryFileFromName(page)}" type="module"></script>
	</body>
</html>`;
			},
		}),
	);
}
