import globals from "globals";
import tseslint from "typescript-eslint";
import { config as baseConfig } from "./base.js";

/**
 * A custom ESLint configuration for Node.js/Express applications.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  ...baseConfig,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
      globals: {
        ...globals.node,
        ...globals.commonjs,
      },
    },
    rules: {
      // Node.js specific rules
      "no-process-exit": "warn", // Allow process.exit for server shutdown
      "no-process-env": "off", // Allow process.env for configuration
      "no-console": "off", // Allow console for server logging
      "no-unused-vars": "off", // Handled by TypeScript
      "@typescript-eslint/no-unused-vars": "off", // Handled by unused-imports plugin
      "@typescript-eslint/no-explicit-any": "warn", // Warn about any usage
      
      // Express specific rules
      "no-var": "error",
      "prefer-const": "error",
      
      // Allow 'use strict' directive
      "strict": "off",
      
      // Import rules for Node.js
      "@typescript-eslint/no-require-imports": "error",
      "@typescript-eslint/prefer-namespace-keyword": "error",
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      "coverage/**",
      ".turbo/**",
      "build/**",
    ],
  },
];
