import prettierPlugin from "eslint-plugin-prettier"; // Prettier plugin
import sveltePlugin from "eslint-plugin-svelte"; // Svelte plugin
import typescriptPlugin from "@typescript-eslint/eslint-plugin"; // TypeScript rules
import typescriptParser from "@typescript-eslint/parser"; // TypeScript parser
import svelteParser from "svelte-eslint-parser"; // Svelte parser

const commonRules = {
	// General JavaScript rules
	"prefer-arrow-callback": "error",
	"func-style": ["error", "declaration"],
	"no-multiple-empty-lines": [
		"error",
		{
			max: 1, // Allow at most 1 empty line
			maxEOF: 0, // No empty lines at the end of the file
			maxBOF: 0, // No empty lines at the beginning of the file
		},
	],

	// TypeScript-specific rules
	"@typescript-eslint/no-unused-vars": [
		"error",
		{
			varsIgnorePattern: "^_",
			argsIgnorePattern: "^_",
		},
	],
	"@typescript-eslint/explicit-function-return-type": [
		"error",
		{
			allowExpressions: true,
			allowTypedFunctionExpressions: true,
			allowHigherOrderFunctions: true,
		},
	],

	// Prettier integration
	"prettier/prettier": "warn",
};

export default [
	{
		// For TypeScript and JavaScript files
		files: ["src/**/*.{ts,js}"],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				project: "./tsconfig.json",
			},
		},
		plugins: {
			prettier: prettierPlugin,
			"@typescript-eslint": typescriptPlugin,
		},
		rules: {
			...commonRules,
		},
	},
	{
		// For Svelte files with TypeScript
		files: ["src/**/*.svelte"],
		languageOptions: {
			parser: svelteParser,
			parserOptions: {
				ecmaVersion: "latest",
				sourceType: "module",
				extraFileExtensions: [".svelte"],
				project: "./tsconfig.svelte.json",
				parser: typescriptParser,
			},
		},
		plugins: {
			prettier: prettierPlugin,
			svelte: sveltePlugin,
			"@typescript-eslint": typescriptPlugin,
		},
		rules: {
			...commonRules,
		},
	},
];
