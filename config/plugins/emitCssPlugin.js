import css from "rollup-plugin-css-only";
import { transformSync } from "esbuild";
import { getCssFilePath, getRelativeDestPath } from "../paths.js";
import { production } from "../env.js";
import { svelteDependencies, svelteEmitCssDependencies } from "../helpers.js";

let outputTargetsData = {};

export function emitCssPlugin() {
	return {
		name: "emit-css-plugin",
		generateBundle() {
			Object.entries(outputTargetsData).forEach(
				([targetOutputCssFile, rawOutputData]) => {
					const outputData = production
						? transformSync(rawOutputData, { loader: "css", minify: true }).code
						: rawOutputData;

					this.emitFile({
						type: "asset",
						fileName: getRelativeDestPath(targetOutputCssFile),
						source: outputData,
					});
				},
			);
		},
	};
}

export function loadCssPlugin() {
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

			outputTargetsData = Object.entries(styleNodes).reduce(
				(outputTargetsData, [cssFile, cssData]) => {
					const moduleOutputCssFile = getCssFilePath(cssFile);
					const targetOutputCssFile = cssDependencyKeys.includes(
						moduleOutputCssFile,
					)
						? moduleOutputCssFile
						: (cssDependencyEntries.find(([_, cssDependencies]) => {
								return cssDependencies.includes(moduleOutputCssFile);
							}) || [null])[0];

					if (targetOutputCssFile) {
						outputTargetsData[targetOutputCssFile] =
							(outputTargetsData[targetOutputCssFile] || "") + cssData;
					}
					return outputTargetsData;
				},
				{},
			);
		},
	});
}
