import path from "path";
import fs from "fs";

export const production = process.env.NODE_ENV === "production";
export let dependencyMap = {};

export function writeFileRecursive(filePath, data) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.appendFileSync(filePath, data, "utf8");
}

export function resolveDependencies(pageScriptPaths) {
	let resolved = dependencyMap;

	function isDependencyUnique(dependency, importer, dependencies) {
		return !Object.entries(dependencies).find(
			([otherImporter, deps]) => otherImporter !== importer && deps.includes(dependency)
		);
	}

	function resolve(importer, dependencies, resolved) {
		if (resolved[importer]) return resolved[importer]; // Use cache to prevent redundant work

		const resolvedDeps = new Set();

		(dependencies[importer] || []).forEach(dep => {
			resolvedDeps.add(dep);
			const depResolved = resolve(dep, dependencies, resolved);

			if (isDependencyUnique(dep, importer, dependencies)) {
				depResolved.forEach(d => resolvedDeps.add(d));
			} else {
				resolved[dep] = depResolved;
			}
		});

		return [...resolvedDeps];
	}

	while (true) {
		const newResolved = {};

		pageScriptPaths.forEach(path => {
			newResolved[path] = resolve(path, resolved, newResolved);
		});

		if (JSON.stringify(newResolved) === JSON.stringify(resolved)) {
			break;
		}
		resolved = newResolved;
	}

	return resolved;
}
