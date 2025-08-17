import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      turbo: turboPlugin,
      "unused-imports": unusedImports,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
"@typescript-eslint/naming-convention": [
  "error",
  {
    selector: "default",
    format: ["camelCase"],
  },
  {
    selector: "variable",
    format: ["camelCase", "UPPER_CASE", "PascalCase"],
    leadingUnderscore: "allow",
  },
  {
    selector: "parameter",
    format: ["camelCase"],
    leadingUnderscore: "allow",
  },
  {
    selector: "memberLike",
    modifiers: ["private"],
    format: ["camelCase"],
    leadingUnderscore: "require",
  },
  {
    selector: "typeLike",
    format: ["PascalCase"],
  },
  // Regular functions → camelCase
  {
    selector: "function",
    format: ["camelCase", "PascalCase"],
  },
  // Arrow functions that are components → allow PascalCase
  {
    selector: "variable",
    types: ["function"],
    format: ["camelCase", "PascalCase"],
  },
  // Import names → allow both camelCase and PascalCase
  {
    selector: "import",
    format: ["camelCase", "PascalCase"],
  }
]
    },
  },
  {
    ignores: [
      "dist/**",
      "node_modules/**",
      ".next/**",
      "coverage/**",
    ],
  },
];
