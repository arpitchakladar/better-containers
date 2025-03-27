import { pageInputs } from "../paths.js";
import { moduleMap } from "../helpers.js";

// Collect dependencies for each module
export function collectDependencies() {
	const pageScriptPaths = Object.values(pageInputs);
	return {
		name: "collect-dependencies",
		resolveId(source, importer) {
			if (importer && source.endsWith(".svelte")) {
				if (pageScriptPaths.includes(importer)) {
					if (!moduleMap[importer]) moduleMap[importer] = [];
					moduleMap[importer].push(source);
				} else {
					for (const modules of Object.values(moduleMap)) {
						if (modules.includes(importer)) {
							modules.push(source);
						}
					}
				}
			}
			return null; // Continue resolving normally
		},
	};
}
