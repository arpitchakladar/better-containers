import path from "path";
import fs from "fs";
import {
	pageScriptPaths,
	stylesDest,
	dest,
	getCssFilePath,
} from "./paths.js";

export const production = process.env.NODE_ENV === "production";
export let dependencyMap = {};
export let cssDependencyMap = {};

export function appendFileRecursive(filePath, data) {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.appendFileSync(filePath, data, "utf8");
}

export function resolveDependencies() {
	let resolved = dependencyMap;

	function isDependencyUnique(dependency, importer, dependencies) {
		return !Object.entries(dependencies).find(
			([otherImporter, deps]) =>
				otherImporter !== importer && deps.includes(dependency),
		);
	}

	function resolve(importer, dependencies, resolved) {
		if (resolved[importer]) return resolved[importer]; // Use cache to prevent redundant work

		const resolvedDeps = new Set();

		(dependencies[importer] || []).forEach((dep) => {
			resolvedDeps.add(dep);
			const depResolved = resolve(dep, dependencies, resolved);

			if (isDependencyUnique(dep, importer, dependencies)) {
				depResolved.forEach((d) => resolvedDeps.add(d));
			} else {
				resolved[dep] = depResolved;
			}
		});

		return [...resolvedDeps];
	}

	while (true) {
		const newResolved = {};

		pageScriptPaths.forEach((path) => {
			newResolved[path] = resolve(path, resolved, newResolved);
		});

		if (JSON.stringify(newResolved) === JSON.stringify(resolved)) {
			break;
		}
		resolved = newResolved;
	}

	dependencyMap = resolved;
}

export function transformDependencies() {
	const transformed = {};

	Object.entries(dependencyMap).forEach(([key, value]) => {
		let newKey = getCssFilePath(key);
		let newValue = value.map((dep) => getCssFilePath(dep));
		transformed[newKey] = newValue;
	});

	cssDependencyMap = transformed;
}
