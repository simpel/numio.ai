import { config } from "@numio/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: [
      "dist/**", 
      "node_modules/**",
      "coverage/**",
    ],
  },
];
