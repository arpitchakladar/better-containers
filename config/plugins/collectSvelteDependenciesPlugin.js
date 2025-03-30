import { pageInputs, pageScriptPaths } from "../paths.js";
import { svelteDependencies } from "../helpers.js";

// Collect dependencies for each dependency
export function collectSvelteDependenciesPlugin() {
	return {
		name: "collect-dependencies",
		resolveId(source, importer) {
			if (importer && source.endsWith(".svelte")) {
				if (!svelteDependencies.dependencies[importer])
					svelteDependencies.dependencies[importer] = [];
				svelteDependencies.dependencies[importer].push(source);
			}
			return null; // Continue resolving normally
		},
	};
}
