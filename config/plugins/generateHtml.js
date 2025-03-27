import path from "path";
import html from "@rollup/plugin-html";
import { dependencyMap } from "../helpers.js";
import {
	dest,
	pageInputs,
	getEntryFileFromName,
	getCssFileOutput,
} from "../paths.js";

export function generateHtml() {
	return Object.entries(pageInputs).map(([page, scriptPath]) =>
		html({
			title: `Better Containers`,
			fileName: `pages/${page}/index.html`,
			template: () => {
				const linkCssTags = dependencyMap[pageInputs[page]]
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
