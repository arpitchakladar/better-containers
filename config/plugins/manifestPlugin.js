import fs from "fs";
import path from "path";
import { production } from "../env.js";
import { writeFileRecursive } from "../helpers.js";
import { src } from "../paths.js";

export function manifestPlugin(options = {}) {
	const { outputPath = "dist/manifest.json" } = options;
	let outputFiles = [];
	const baseManifest = JSON.parse(
		fs.readFileSync(path.resolve(src, "manifest.json")),
	);

	return {
		name: "manifest-plugin",
		generateBundle(outputOptions, bundle) {
			outputFiles = Object.keys(bundle).filter(
				(fileName) =>
					fileName.endsWith(".js") ||
					fileName.endsWith(".css") ||
					fileName.endsWith(".html"),
			);

			const manifest = {
				...baseManifest,
				web_accessible_resources: [
					...(baseManifest.web_accessible_resources || []),
					...outputFiles,
				],
			};

			const manifestPath = path.resolve(outputPath);
			const manifestData = JSON.stringify(manifest, null, production ? 0 : 2);
			writeFileRecursive(manifestPath, manifestData);
		},
	};
}
