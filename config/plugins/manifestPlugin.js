import * as R from "remeda";
import fs from "fs";
import path from "path";
import { production } from "../env.js";
import { __dirname, srcPath, getRelativeDestPath, destPath } from "../paths.js";

export function manifestPlugin(options = {}) {
	const { outputPath = path.resolve(destPath, "manifest.json") } = options;
	const baseManifest = JSON.parse(
		fs.readFileSync(path.resolve(srcPath, "manifest.json")),
	);

	return {
		name: "manifest-plugin",
		generateBundle(outputOptions, bundle) {
			const [webAccessibleResources, backgroundScripts] = R.pipe(
				bundle,
				R.keys(),
				R.reduce(
					([webAccessibleResources, backgroundScripts], fileName) =>
						R.conditional(
							fileName,
							[
								(fileName) =>
									fileName.endsWith(".css") || fileName.endsWith(".html"),
								(fileName) => [
									webAccessibleResources.concat(fileName),
									backgroundScripts,
								],
							],
							[
								(fileName) => fileName.endsWith(".js"),
								(fileName) =>
									R.conditional(
										fileName,
										[
											(fileName) => fileName.split("/")[0] === "background",
											(fileName) => [
												webAccessibleResources,
												backgroundScripts.concat(fileName),
											],
										],
										R.conditional.defaultCase((fileName) => [
											webAccessibleResources.concat(fileName),
											backgroundScripts,
										]),
									),
							],
							R.conditional.defaultCase((_fileName) => [
								webAccessibleResources,
								backgroundScripts,
							]),
						),
					[[], []],
				),
			);
			const packageJson = JSON.parse(
				fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"),
			);

			const manifest = R.mergeDeep(baseManifest, {
				version: packageJson.version,
				background: {
					scripts: backgroundScripts,
				},
				web_accessible_resources: webAccessibleResources,
			});

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
