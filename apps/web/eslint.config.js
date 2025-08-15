import { config } from "@numio/eslint-config/react";

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: [
      "eslint.config.js",
      "next.config.ts",
      "tailwind.config.ts",
      "postcss.config.mjs",
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
