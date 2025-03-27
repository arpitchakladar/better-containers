import path from "path";
import html from "@rollup/plugin-html";
import { cssDependencyMap } from "../helpers.js";
import {
	dest,
	pageInputs,
	getEntryFileFromName,
	getCssFilePath,
} from "../paths.js";

export function generateHtml() {
	return Object.entries(pageInputs).map(([page, scriptPath]) =>
		html({
			title: `Better Containers`,
			fileName: `pages/${page}/index.html`,
			template: () => {
				const mainStyle = getCssFilePath(pageInputs[page]);
				const linkCssTags = [mainStyle]
					.concat(cssDependencyMap[mainStyle] || [])
					.map(
						(cssPath) =>
							cssPath in cssDependencyMap &&
							`<link rel="stylesheet" href="/${path.relative(dest, cssPath)}" type="text/css"/>`,
					)
					.filter(Boolean)
					.join("\n\t\t");

				return `\
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="/${path.relative(dest, getCssFilePath("global.css"))}" type="text/css" />
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
