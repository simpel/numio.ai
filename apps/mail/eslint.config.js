import { config } from "@numio/eslint-config/node";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: [
      "eslint.config.js",
      "tsup.config.ts",
      "dist/**",
      "node_modules/**",
    ],
  },
];
