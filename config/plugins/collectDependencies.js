import { pageInputs, pageScriptPaths } from "../paths.js";
import { dependencyMap } from "../helpers.js";

// Collect dependencies for each dependency
export function collectDependencies() {
	return {
		name: "collect-dependencies",
		resolveId(source, importer) {
			if (importer && source.endsWith(".svelte")) {
				if (!dependencyMap[importer]) dependencyMap[importer] = [];
				dependencyMap[importer].push(source);
			}
			return null; // Continue resolving normally
		},
	};
}
