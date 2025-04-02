import babel from "@rollup/plugin-babel";

export const babelPlugin = () =>
	babel({
		babelHelpers: "runtime",
		presets: [
			[
				"@babel/preset-env",
				{
					targets: {
						firefox: "130",
					},
					bugfixes: true,
					useBuiltIns: false, // Disable automatic polyfilling
					corejs: false, // Don"t use core-js
					exclude: [
						"transform-typeof-symbol", // Important for Lodash
					],
				},
			],
		],
		plugins: [
			["@babel/plugin-transform-runtime", { useESModules: true }],
			"lodash",
		],
	});
