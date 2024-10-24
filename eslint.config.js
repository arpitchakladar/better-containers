import prettierPlugin from "eslint-plugin-prettier"; // Prettier plugin
import typescriptPlugin from "@typescript-eslint/eslint-plugin"; // TypeScript rules
import typescriptParser from "@typescript-eslint/parser"; // TypeScript parser

export default [
	{
		files: ["src/**/*.{ts,js}"], // Target JavaScript and TypeScript files
		languageOptions: {
			parser: typescriptParser, // Use the TypeScript parser
			parserOptions: {
				ecmaVersion: "latest", // Latest ECMAScript version
				sourceType: "module", // Enable ES modules
				project: "./tsconfig.json", // Specify TypeScript project
			},
		},
		plugins: {
			prettier: prettierPlugin, // Register Prettier plugin
			"@typescript-eslint": typescriptPlugin, // Register TypeScript plugin
		},
		rules: {
			// General JavaScript rules
			"prefer-arrow-callback": "error",
			"func-style": ["error", "declaration"],

			// TypeScript-specific rules
			"@typescript-eslint/explicit-function-return-type": ["error", {
				allowExpressions: true, // Disallow inferred return types in expressions
				allowTypedFunctionExpressions: true, // Allow when return type is defined in a type definition
				allowHigherOrderFunctions: true, // Allow inferred return types in higher-order functions
			}],
			"@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],

			// Prettier integration
			"prettier/prettier": "error",
		},
	},
];
