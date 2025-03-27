import { production } from "../helpers.js";
import { spawn } from "child_process";

// Run Svelte Type Checking
export function runSvelteCheck() {
	return {
		name: "svelte-check",
		buildStart() {
			if (!production) {
				const checker = spawn(
					"npx",
					["svelte-check", "--tsconfig", "./tsconfig.json"],
					{
						stdio: "inherit",
						shell: true,
					},
				);
				checker.on("close", (code) => {
					if (code !== 0) console.error("svelte-check failed!");
				});
			}
		},
	};
}
