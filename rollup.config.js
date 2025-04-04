import * as R from "remeda";
import {
	destPath,
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
		dir: destPath,
		format: "esm",
		sourcemap: !production,
		entryFileNames: R.piped(R.prop("name"), getEntryFileFromName),
		chunkFileNames: production ? "modules/[hash].js" : "modules/[name].js",
	},
	plugins,
	watch: {
		clearScreen: false,
	},
};
