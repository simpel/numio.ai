import { config } from "@numio/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: [
      "eslint.config.js",
      "tsup.config.ts",
      "prisma.config.ts",
      "dist/**", 
      "node_modules/**",
      "coverage/**",
    ],
  },
];