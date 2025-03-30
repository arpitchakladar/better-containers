import html from "@rollup/plugin-html";
import { svelteEmitCssDependencies } from "../helpers.js";
import {
	pageInputs,
	getEntryFileFromName,
	getCssFilePath,
	getRelativeDestPath,
} from "../paths.js";

export function generateHtmlPlugin() {
	return Object.entries(pageInputs).map(([page, scriptPath]) =>
		html({
			title: `Better Containers`,
			fileName: `pages/${page}/index.html`,
			template() {
				const mainStyle = getCssFilePath(pageInputs[page]);
				const linkCssTags = [mainStyle]
					.concat(svelteEmitCssDependencies.dependencies[mainStyle] || [])
					.map(
						(cssPath) =>
							cssPath in svelteEmitCssDependencies.dependencies &&
							`<link rel="stylesheet" href="/${getRelativeDestPath(cssPath)}" type="text/css"/>`,
					)
					.filter(Boolean)
					.join("\n\t\t");

				return `\
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="/${getRelativeDestPath("global.css")}" type="text/css" />
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
