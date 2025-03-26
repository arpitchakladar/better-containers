import {
	dest,
	pageInputs,
	backgroundScriptInputs,
	getEntryFileFromName,
} from "./config/paths.js";
import { production } from "./config/helpers.js";
import plugins from "./config/plugins.js";

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
		chunkFileNames: "modules/[name].js",
	},
	plugins,
	watch: {
		clearScreen: false,
	},
};
