import { config } from "@numio/eslint-config/react";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: [
      ".next/**",
      "dist/**",
      "node_modules/**",
      "coverage/**",
      "shadcn/**",
      "next-env.d.ts",
      "**/*.d.ts",
    ],
  },
];
