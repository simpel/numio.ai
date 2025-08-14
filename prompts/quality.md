# Prompt: Code Quality & Architecture Review (Next.js/React Monorepo)

## Scope

Focus exclusively on:

- Naming conventions and consistency
- Folder & module structure
- Architectural patterns and boundaries
- Dependency structure (imports, cycles)
- Duplication, over-abstraction, and dead/unused code
- Config hygiene (tsconfig, eslint, turbo)

Ignore runtime performance, Lighthouse, SEO, accessibility, testing or design/UX.

In addition to structural concerns, incorporate static analysis for **complexity** and **secrets** as part of code quality. Complex modules can impede maintainability, and accidentally committed credentials are a serious security risk.

**Important**: This prompt should perform analysis and generate recommendations only. Do not make any actual code changes to the repository. All changes should be documented in the AUDIT file and rules for later implementation.

## Inputs

- Monorepo with Next.js/React in TypeScript (e.g. Turborepo)
- Applications and packages under workspaces
- Provide the repository root path

## What to Review

1. **Naming**  
   Files, folders, exports, functions, variables. Enforce kebab-case for files and folders, camelCase for variables and functions, PascalCase for types/interfaces and UPPER_CASE for constants.

2. **Structure**  
   Clear `apps/` vs `packages/` separation; no cross-layer leaks. Co-locate module code (`index.ts`, `types.ts`, `utils.ts`) and avoid barrel sprawl.

3. **Architecture**  
   Enforce boundaries (UI ↔ application ↔ domain ↔ infrastructure). No imports “up the stack”; no feature code inside `shared/` that depends on app code.

4. **Dependencies**  
   Detect import cycles, deep imports, and path alias misuse. Ensure stable modules depend only on more stable modules.

5. **Duplication & Over-abstraction**  
   Identify functions/components that are near-duplicates, single-use wrappers, or premature abstractions. Recommend merge/simplify or inline.

6. **Configs**  
   Single `tsconfig.base.json` with project references. ESLint with naming, import and boundary rules. `turbo.json` pipelines consistent across packages.

7. **Complexity & Secrets**  
   Highlight functions or modules with high cyclomatic or Halstead complexity and flag them for refactoring. Also detect any hard-coded secrets (API keys, tokens, passwords) or credentials committed to the repository and recommend removing them. Secrets should be stored in environment variables or secure stores rather than source files.

## Method

- Map the dependency graph and list cycles and rule violations.
- Sample a fixed number of modules per package to evaluate naming and structure.
- Use automated tools to scan for duplication and unused exports. For duplication, run `jscpd` via `pnpm dlx jscpd` to detect copy-and-paste blocks and structurally similar code. For unused exports, run `ts-prune` via `pnpm dlx ts-prune` to list exported symbols that are not referenced anywhere.
- In addition, measure complexity and detect secrets:
  - **Complexity:** run `code-complexity` via `pnpm dlx code-complexity` to compute cyclomatic and Halstead complexity as well as churn metrics for each file. The `code-complexity` CLI measures lines of code, cyclomatic complexity and Halstead complexity to highlight files that may need refactoring [oai_citation:0‡npmjs.com](https://www.npmjs.com/package/code-complexity).

  - **Secrets:** run `secretlint` via `pnpm dlx secretlint` to scan for secret or credential data in source files. Secretlint accepts glob patterns (e.g. `"**/*"`) and reports any detected secrets [oai_citation:1‡npmjs.com](https://www.npmjs.com/package/secretlint/v/1.0.5).

- Report findings per package with concrete diffs or file paths.
- For each pattern or convention found, create a `.cursor/rules` file (MDC) containing a description and bullet-point guidelines.

## Output

1. **Findings**: list by category (naming, structure, architecture, dependencies, duplication, complexity, secrets, configs) including file paths, a short reason and a severity rating (high/medium/low).
2. **Actions**: for every finding produce a clear agent instruction describing how to apply the recommended change (rename, move, delete, simplify). These instructions should be actionable tasks that can be followed to refactor the codebase.
3. **Rules**: for each pattern or convention identified (naming conventions, structure, architecture, dependencies, abstraction, config hygiene) generate, delete or update a rule file under `.cursor/rules` following MDC format with a description, appropriate globs and bullet-point guidelines.
4. **Plan**: provide a comprehensive, day-by-day plan (spanning roughly two weeks) detailing how to address the findings. The plan should start with running the auto-checks and gathering data, then tackle high-impact issues first (cycles, boundary violations, duplicates, hard-coded secrets), followed by naming fixes and structural re-organisation, then resolving unused exports, complexity hotspots and over-abstractions, finally cleaning up configs and updating rules. Each day should list concrete tasks and expected outcomes.
5. **Guardrails**: any rules or configuration changes needed to prevent regressions.
6. **AUDIT File**: generate a datestamped markdown file named `AUDIT_YYYY-MM-DD.md` in the repository root containing all findings, analysis, proposed agent prompts, and the comprehensive refactoring plan. This file should serve as a complete record of the code quality assessment and actionable roadmap for improvements. It should also include a list of cursor rules that are either added, removed or edited

### Example ESLint rules and config baselines

Use ESLint with plugins such as `@typescript-eslint`, `import`, `unused-imports` and `boundaries`. Enforce naming conventions, unused imports detection, import order and boundary rules. A typical configuration might look like:

```js
// .eslintrc.cjs
module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	plugins: ['@typescript-eslint', 'import', 'unused-imports', 'boundaries'],
	extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
	rules: {
		'unused-imports/no-unused-imports': 'error',
		'import/order': ['error', { 'newlines-between': 'always' }],
		'import/no-cycle': ['error', { maxDepth: 1 }],
		'@typescript-eslint/naming-convention': [
			'error',
			{ selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
			{ selector: 'function', format: ['camelCase'] },
			{ selector: 'typeLike', format: ['PascalCase'] },
		],
		'boundaries/element-types': ['error', { default: 'disallow' }],
		'boundaries/no-external': 'off',
		'boundaries/no-unknown': 'error',
		'boundaries/entry-point': 'error',
	},
	settings: {
		'boundaries/types': ['app', 'feature', 'shared', 'infra', 'domain'],
		'boundaries/ignore': ['**/*.test.ts', '**/*.spec.ts'],
	},
};
```

## Auto-Checks

```bash
# Generate a dependency graph and detect cycles
pnpm dlx depcruise src --exclude "^(@types|node_modules)/" --output-type dot > deps.dot

# Run ESLint for naming, import order and boundary rules
pnpm lint

# Detect duplicate or copy‑pasted code across all source folders in the monorepo using jscpd
# Pass each `src` directory explicitly. For example, to scan the web, database and mail apps along with all packages:
pnpm dlx jscpd apps/web/src apps/database/src apps/mail/src --reporters console --min-lines 5

# Find exported symbols that are never used anywhere using ts-prune.
# Run ts-prune once per tsconfig. For example, for each app in the monorepo:
pnpm dlx ts-prune -p apps/web/tsconfig.json
pnpm dlx ts-prune -p apps/database/tsconfig.json
pnpm dlx ts-prune -p apps/mail/tsconfig.json

# Identify complexity hotspots using code-complexity. Run on each app package individually and sort by score to see the highest‑complexity files first. Limit the output to avoid noise.
pnpm dlx code-complexity . --sort score --limit 200

# Scan the repository for hard‑coded secrets using secretlint. This scans all files; adjust the glob as needed to exclude build artefacts.
pnpm secretlint "**/*" --format stylish
```

## Review Rubric

- High: cycles, boundary violations, duplicate utilities, single-use wrappers, deep imports, inconsistent naming, high complexity functions or modules, hard-coded secrets.

- Medium: leaky folders, over-generic shared modules, missing base tsconfig, barrels hiding dependencies, moderately complex code that may need refactoring.
- Low: minor naming nits, import order, low complexity issues.
