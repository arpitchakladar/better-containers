import path from "path";
import html from "@rollup/plugin-html";
import { svelteEmitCssDependencies } from "../helpers.js";
import {
	destPath,
	stylesDestPath,
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
				const pagePath = path.resolve(destPath, `pages/${page}`);
				const linkCssTags = (
					svelteEmitCssDependencies.dependencies[mainStyle] || []
				)
					.concat([mainStyle])
					.map(
						(cssPath) =>
							cssPath in svelteEmitCssDependencies.dependencies &&
							`<link rel="stylesheet" href="${path.relative(pagePath, cssPath)}" type="text/css"/>`,
					)
					.filter(Boolean)
					.join("\n\t\t");

				return `\
<!DOCTYPE html>
<html>
	<head>
		<link rel="stylesheet" href="${path.relative(pagePath, path.resolve(stylesDestPath, "global.css"))}" type="text/css" />
		${linkCssTags}
	</head>
	<body>
		<div id="better-containers"></div>
		<script src="./index.js" type="module"></script>
	</body>
</html>`;
			},
		}),
	);
}
