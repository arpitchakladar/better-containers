import {
	dest,
	pageInputs,
	backgroundScriptInputs,
	getEntryFileFromName,
} from "./config/paths.js";
import { production } from "./config/env.js";
import plugins from "./config/plugins/index.js";

export default {
	input: {
		...backgroundScriptInputs,
		...pageInputs,
	},
	output: {
		dir: dest,
		format: "esm",
		sourcemap: !production,
		entryFileNames: ({ name }) => getEntryFileFromName(name),
		chunkFileNames: production ? "modules/[hash].js" : "modules/[name].js",
	},
	plugins,
	watch: {
		clearScreen: false,
	},
};
