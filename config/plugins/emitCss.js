import css from "rollup-plugin-css-only";
import { transformSync } from "esbuild";
import { getCssFilePath } from "../paths.js";
import { production } from "../env.js";
import {
	svelteDependencies,
	svelteEmitCssDependencies,
	writeFileRecursive,
} from "../helpers.js";

export function emitCss() {
	return css({
		output(styles, styleNodes) {
			svelteDependencies.resolve();
			svelteEmitCssDependencies.resolve();
			const cssDependencyKeys = Object.keys(
				svelteEmitCssDependencies.dependencies,
			);
			const cssDependencyEntries = Object.entries(
				svelteEmitCssDependencies.dependencies,
			);
			const outputTargetsData = Object.entries(styleNodes).reduce(
				(outputTargetsData, [cssFile, cssData]) => {
					const moduleOutputCssFile = getCssFilePath(cssFile);
					const targetOutputCssFile = cssDependencyKeys.includes(
						moduleOutputCssFile,
					)
						? moduleOutputCssFile
						: cssDependencyEntries.find(([_, cssDependencies]) =>
								cssDependencies.includes(moduleOutputCssFile),
							)[0];
					outputTargetsData[targetOutputCssFile] =
						(outputTargetsData[targetOutputCssFile] || "") + cssData;
					return outputTargetsData;
				},
				{},
			);
			Object.entries(outputTargetsData).forEach(
				([targetOutputCssFile, rawOutputData]) => {
					const outputData = production
						? transformSync(rawOutputData, { loader: "css", minify: true }).code
						: rawOutputData;
					writeFileRecursive(targetOutputCssFile, outputData);
				},
			);
		},
	});
}
