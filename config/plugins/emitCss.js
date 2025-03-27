import css from "rollup-plugin-css-only";
import { transformSync } from "esbuild";
import { getCssFilePath } from "../paths.js";
import {
	cssDependencyMap,
	production,
	resolveDependencies,
	resolveCssDependencies,
	writeFileRecursive,
} from "../helpers.js";

export function emitCss() {
	return css({
		output: (styles, styleNodes) => {
			resolveDependencies();
			resolveCssDependencies();
			const cssDependencyKeys = Object.keys(cssDependencyMap);
			const cssDependencyEntries = Object.entries(cssDependencyMap);
			const outputTargetsData = {};
			Object.keys(styleNodes).forEach((entryCssFile) => {
				const moduleOutputCssFile = getCssFilePath(entryCssFile);
				const targetOutputCssFile = cssDependencyKeys.includes(
					moduleOutputCssFile,
				)
					? moduleOutputCssFile
					: cssDependencyEntries.find(([_, cssDependencies]) =>
							cssDependencies.includes(moduleOutputCssFile),
						)[0];
				outputTargetsData[targetOutputCssFile] =
					(outputTargetsData[targetOutputCssFile] || "") +
					styleNodes[entryCssFile];
			});
			for (const [targetOutputCssFile, rawOutputData] of Object.entries(
				outputTargetsData,
			)) {
				const outputData = production
					? transformSync(rawOutputData, { loader: "css", minify: true }).code
					: rawOutputData;
				writeFileRecursive(targetOutputCssFile, outputData);
			}
		},
	});
}
