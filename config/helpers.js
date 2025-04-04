import * as R from "remeda";
import { pageScriptPaths, getCssFilePath } from "./paths.js";

export const svelteDependencies = {
	dependencies: {},
	resolve() {
		function isDependencyUnique(dependency, importer, dependencies) {
			return !R.pipe(
				dependencies,
				R.entries(),
				R.find(
					R.allPass([
						R.piped(R.prop("0"), R.isNot(R.isShallowEqual(importer))),
						R.piped(R.prop("1"), R.partialBind(R.isIncludedIn, dependency)),
					]),
				),
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

			if (R.isDeepEqual(newResolved, resolved)) break;
			resolved = newResolved;
		}

		this.dependencies = resolved;
	},
};

export const svelteEmitCssDependencies = {
	dependencies: {},
	resolve() {
		this.dependencies = R.pipe(
			svelteDependencies.dependencies,
			R.entries(),
			R.map(([key, value]) => [
				getCssFilePath(key),
				value.map((dep) => getCssFilePath(dep)),
			]),
			R.fromEntries(),
		);
	},
};
