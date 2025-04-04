import { pageScriptPaths, getCssFilePath } from "./paths.js";

export const svelteDependencies = {
	dependencies: {},
	resolve() {
		function isDependencyUnique(dependency, importer, dependencies) {
			return !Object.entries(dependencies).find(
				([otherImporter, deps]) =>
					otherImporter !== importer && deps.includes(dependency),
			);
		}

		function resolve(importer, dependencies, resolved) {
			// Use cache to prevent redundant work
			if (resolved[importer]) return resolved[importer];

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

		let resolved = this.dependencies;
		while (true) {
			const newResolved = pageScriptPaths.reduce((newResolved, path) => {
				newResolved[path] = resolve(path, resolved, newResolved);

				return newResolved;
			}, {});

			if (JSON.stringify(newResolved) === JSON.stringify(resolved)) break;
			resolved = newResolved;
		}

		this.dependencies = resolved;
	},
};

export const svelteEmitCssDependencies = {
	dependencies: {},
	resolve() {
		const transformed = {};

		Object.entries(svelteDependencies.dependencies).forEach(([key, value]) => {
			let newKey = getCssFilePath(key);
			let newValue = value.map((dep) => getCssFilePath(dep));
			transformed[newKey] = newValue;
		});

		this.dependencies = transformed;
	},
};
