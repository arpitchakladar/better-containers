import fs from "fs";
import path from "path";
import { production } from "../env.js";
import { __dirname, srcPath, getRelativeDestPath } from "../paths.js";

export function manifestPlugin(options = {}) {
	const { outputPath = "dist/manifest.json" } = options;
	const baseManifest = JSON.parse(
		fs.readFileSync(path.resolve(srcPath, "manifest.json")),
	);

	return {
		name: "manifest-plugin",
		generateBundle(outputOptions, bundle) {
			const [webAccessibleResources, backgroundScripts] = Object.keys(
				bundle,
			).reduce(
				([webAccessibleResources, backgroundScripts], fileName) => {
					if (fileName.endsWith(".css") || fileName.endsWith(".html")) {
						webAccessibleResources.push(fileName);
					} else if (fileName.endsWith(".js")) {
						if (fileName.split("/")[0] === "background") {
							backgroundScripts.push(fileName);
						} else {
							webAccessibleResources.push(fileName);
						}
					}
					return [webAccessibleResources, backgroundScripts];
				},
				[[], []],
			);
			const packageJson = JSON.parse(
				fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"),
			);

			const manifest = {
				...baseManifest,
				version: packageJson.version,
				background: {
					...(baseManifest.background || {}),
					scripts: [
						...(baseManifest.background.scripts || []),
						...backgroundScripts,
					],
				},
				web_accessible_resources: [
					...(baseManifest.web_accessible_resources || []),
					...webAccessibleResources,
				],
			};

			const manifestPath = path.resolve(outputPath);
			const manifestData = JSON.stringify(manifest, null, production ? 0 : 2);
			this.emitFile({
				type: "asset",
				fileName: getRelativeDestPath(manifestPath),
				source: manifestData,
			});
		},
	};
}
