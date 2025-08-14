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
  - **Complexity & Metrics:** use CodeCharta Shell (ccsh) via `pnpm dlx codecharta-analysis` to generate comprehensive metrics from source code. CodeCharta can analyze multiple languages, generate complexity metrics, and combine data from various sources like SonarQube, Tokei, and Git logs. It outputs a cc.json file that can be analyzed for complexity hotspots, code churn, and architectural patterns [oai_citation:0‡codecharta.com](https://codecharta.com/docs/overview/analysis).

  - **Secrets:** run `secretlint` via `pnpm dlx secretlint` to scan for secret or credential data in source files. Secretlint accepts glob patterns (e.g. `"**/*"`) and reports any detected secrets [oai_citation:1‡npmjs.com](https://www.npmjs.com/package/secretlint/v/1.0.5).

- Report findings per package with concrete diffs or file paths.
- For each pattern or convention found that is good and we should enfore, create a `.cursor/rules` file (MDC) containing a description and bullet-point guidelines.

## Output

1. **Metrics Summary**: At the very top of the report, display key metrics in large, prominent text for easy comparison across audits:
   - Total code duplication percentage
   - Number of files with high complexity (>500)
   - Number of unused exports
   - Average complexity score
   - Number of architectural violations
   - Repository size (lines of code)

   **Format the metrics summary like this:**

   ```markdown
   # 📊 CODE QUALITY METRICS

   | Metric                       | Value      | Status    |
   | ---------------------------- | ---------- | --------- |
   | **Code Duplication**         | 8.65%      | 🔴 High   |
   | **High Complexity Files**    | 4          | 🔴 High   |
   | **Unused Exports**           | 200+       | 🟡 Medium |
   | **Average Complexity**       | 245        | 🟡 Medium |
   | **Architectural Violations** | 12         | 🟡 Medium |
   | **Repository Size**          | 15,420 LOC | 🟢 Good   |
   ```

2. **Findings**: List by category (naming, structure, architecture, dependencies, duplication, complexity, secrets, configs) including file paths, a short reason and a severity rating (high/medium/low).

3. **Actions**: For every finding produce a clear agent instruction describing how to apply the recommended change (rename, move, delete, simplify). These instructions should be actionable tasks that can be followed to refactor the codebase.

4. **Agent Prompts**: For each issue category, provide a specific agent prompt in the format "You're an expert Next.js, TypeScript developer and architect..." that includes:
   - Exact file references with full paths
   - Specific line numbers or code blocks that need changes
   - Code samples showing the current problematic code and the desired solution
   - Step-by-step instructions for the fix
   - Expected outcome after the change

   **Generate prompts for ALL issues found, not just major categories. Include prompts for:**
   - Every duplicated function/component (not just categories)
   - Every high-complexity file
   - Every unused export pattern
   - Every naming convention violation
   - Every import pattern issue
   - Every architectural boundary violation
   - Every configuration issue

   **Format each agent prompt in a markdown code block for easy copying:**

   ````markdown
   ### Prompt X: [Brief Description]

   ```bash
   You're an expert Next.js, TypeScript developer and architect. [Detailed prompt content]
   ```
   ````

   ```

   ```

5. **Rules**: For each pattern or convention identified (naming conventions, structure, architecture, dependencies, abstraction, config hygiene) generate, delete or update a rule file under `.cursor/rules` following MDC format with a description, appropriate globs and bullet-point guidelines. Read more about cursor rules here: https://docs.cursor.com/en/context/rules

6. **GEMINI.md Structure**: Create or update the GEMINI.md file at the root of the project using the gated execution pattern described in the [Medium article about structured Gemini CLI approaches](https://medium.com/google-cloud/practical-gemini-cli-structured-approach-to-bloated-gemini-md-360d8a5c7487). The GEMINI.md should include:
   - **Default State**: Basic instructions for general assistance
   - **Code Quality Mode**: Instructions for code quality analysis and improvements
   - **Refactoring Mode**: Instructions for implementing the agent prompts generated in this audit
   - **Protocol blocks**: Use `<PROTOCOL:CODE_QUALITY>`, `<PROTOCOL:REFACTORING>`, etc. for clear mode separation
   - **PRAR Workflow**: Perceive, Reason, Act, Refine workflow for structured problem-solving
   - **Integration**: Reference the cursor rules created in step 5

   **GEMINI.md Structure Requirements:**

   ```markdown
   # GEMINI.md - Structured Code Quality Assistant

   ## Overview

   This assistant uses gated execution through delayed instructions to prevent context bloat and ensure focused, effective code quality improvements.

   ## Modes of Operation

   ### Default State

   General assistance mode for everyday development tasks.

   ### Code Quality Mode

   Entered when analyzing code quality issues. Uses `<PROTOCOL:CODE_QUALITY>`.

   ### Refactoring Mode

   Entered when implementing specific refactoring tasks. Uses `<PROTOCOL:REFACTORING>`.

   ## Protocol Blocks

   <PROTOCOL:CODE_QUALITY>

   - Analyze code for quality issues
   - Reference cursor rules in .cursor/rules/
   - Focus on architectural patterns and best practices
   - Provide actionable recommendations
     </PROTOCOL:CODE_QUALITY>

   <PROTOCOL:REFACTORING>

   - Implement specific refactoring tasks
   - Follow agent prompts from audit reports
   - Make incremental, safe changes
   - Validate changes against cursor rules
     </PROTOCOL:REFACTORING>

   ## PRAR Workflow

   - **Perceive**: Understand the current state and requirements
   - **Reason**: Analyze and plan the approach
   - **Act**: Implement the solution
   - **Refine**: Review and improve the implementation
   ```

7. **AUDIT File**: Generate a datestamped markdown file named `AUDIT_<datetimestamp>.md` in a audits folder in the repository root containing all findings, analysis, proposed agent prompts, and the comprehensive refactoring plan. This file should serve as a complete record of the code quality assessment and actionable roadmap for improvements. It should also include a list of cursor rules that are either added, removed or edited

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
# Read .gitignore patterns and create exclusion list
GITIGNORE_EXCLUDE=""
if [ -f ".gitignore" ]; then
  echo "Using .gitignore patterns for exclusions"
  # Convert .gitignore patterns to find/grep exclusions
  while IFS= read -r line; do
    # Skip comments and empty lines
    [[ $line =~ ^[[:space:]]*# ]] && continue
    [[ -z "${line// }" ]] && continue

    # Remove leading/trailing whitespace
    line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')

    if [[ -n "$line" ]]; then
      # Convert .gitignore pattern to find exclusion
      if [[ $line == /* ]]; then
        # Absolute pattern from root
        GITIGNORE_EXCLUDE="$GITIGNORE_EXCLUDE -path './${line#/}' -prune -o"
      elif [[ $line == */ ]]; then
        # Directory pattern
        GITIGNORE_EXCLUDE="$GITIGNORE_EXCLUDE -path './$line' -prune -o"
      else
        # File pattern
        GITIGNORE_EXCLUDE="$GITIGNORE_EXCLUDE -name '$line' -o"
      fi
    fi
  done < .gitignore
fi

# Add common exclusions if not already in .gitignore
COMMON_EXCLUDE="-name 'node_modules' -prune -o -name '.next' -prune -o -name 'dist' -prune -o -name 'build' -prune -o -name '.turbo' -prune -o -name 'coverage' -prune -o -name '.nyc_output' -prune -o -name '*.log' -o -name '*.lock' -o -name '.DS_Store' -o -name 'Thumbs.db'"

# Combine exclusions
FIND_EXCLUDE="$GITIGNORE_EXCLUDE $COMMON_EXCLUDE"

echo "Exclusion patterns: $FIND_EXCLUDE"

# Generate a dependency graph and detect cycles (if depcruise is available)
# If not available, skip this step and note in findings
if command -v depcruise &> /dev/null; then
  pnpm dlx depcruise src --exclude "^(@types|node_modules)/" --output-type dot > deps.dot 2>/dev/null || echo "depcruise failed"
else
  echo "depcruise not available - skipping dependency analysis"
fi

# Run ESLint if available (check for .eslintrc files)
if [ -f ".eslintrc.js" ] || [ -f ".eslintrc.cjs" ] || [ -f ".eslintrc.json" ] || [ -f ".eslintrc.yml" ]; then
  pnpm lint 2>/dev/null || npm run lint 2>/dev/null || pnpm lint 2>/dev/null || echo "ESLint not configured or failed"
else
  echo "No ESLint config found - skipping linting analysis"
fi

# Detect duplicate or copy‑pasted code across all source folders in the monorepo using jscpd
# Build list of existing source directories only, respecting .gitignore
SOURCE_DIRS=""
for pattern in "apps/*/src" "packages/*/src" "src"; do
  for dir in $pattern; do
    if [ -d "$dir" ]; then
      # Check if directory is ignored by .gitignore
      if [ -f ".gitignore" ]; then
        if grep -q "^${dir#./}$" .gitignore || grep -q "^${dir#./}/" .gitignore; then
          echo "Skipping ignored directory: $dir"
          continue
        fi
      fi
      SOURCE_DIRS="$SOURCE_DIRS $dir"
    fi
  done
done

if [ -n "$SOURCE_DIRS" ]; then
  echo "Scanning for duplicates in: $SOURCE_DIRS"
  # Use jscpd with .gitignore exclusions
  pnpm dlx jscpd $SOURCE_DIRS --reporters console --min-lines 5 --ignore "node_modules,dist,build,.next,.turbo,coverage" 2>/dev/null || echo "jscpd failed"
else
  echo "No source directories found for duplication analysis"
fi

# Find exported symbols that are never used anywhere using ts-prune
# Check for TypeScript config files and run ts-prune for each
TS_CONFIGS=$(find . $FIND_EXCLUDE -name "tsconfig.json" -type f 2>/dev/null | head -10)
if [ -n "$TS_CONFIGS" ]; then
  echo "$TS_CONFIGS" | while read -r tsconfig; do
    echo "Running ts-prune on $tsconfig"
    pnpm dlx ts-prune -p "$tsconfig" 2>/dev/null || echo "ts-prune failed for $tsconfig"
  done
else
  echo "No tsconfig.json files found"
fi

# Generate comprehensive metrics using CodeCharta Shell (ccsh)
# This provides complexity, churn, and architectural metrics
echo "Generating CodeCharta metrics..."
if command -v ccsh >/dev/null 2>&1 || pnpm dlx codecharta-analysis --version >/dev/null 2>&1; then
  # Generate metrics from source code using unifiedparser
  pnpm dlx codecharta-analysis unifiedparser . --output-file metrics.cc.json --exclude "node_modules,.next,dist,build,.turbo,coverage" --not-compressed 2>/dev/null || echo "CodeCharta source-code analysis failed"

  # Generate git-based metrics if git repository
  if [ -d ".git" ]; then
    pnpm dlx codecharta-analysis gitlog . --output-file git-metrics.cc.json --not-compressed 2>/dev/null || echo "CodeCharta git-log analysis failed"
  fi

  # Use Tokei for language statistics if available
  if command -v tokei >/dev/null 2>&1; then
    tokei --output json . > tokei-stats.json 2>/dev/null
    pnpm dlx codecharta-analysis tokei tokei-stats.json --output-file tokei-metrics.cc.json --not-compressed 2>/dev/null || echo "CodeCharta tokei import failed"
  fi

  # Merge all metrics if multiple files exist
  if [ -f "metrics.cc.json" ] && [ -f "git-metrics.cc.json" ]; then
    pnpm dlx codecharta-analysis merge metrics.cc.json git-metrics.cc.json --output-file combined-metrics.cc.json --not-compressed 2>/dev/null || echo "CodeCharta merge failed"
  fi

  # Analyze the metrics file for complexity hotspots
  if [ -f "combined-metrics.cc.json" ]; then
    echo "Analyzing CodeCharta metrics for complexity hotspots..."
    # Extract high complexity files from cc.json (recursive search through folder structure)
    cat combined-metrics.cc.json | jq -r '.data.nodes[] | recurse(.children[]?) | select(.type=="File") | select(.attributes.complexity > 10) | "\(.name): \(.attributes.complexity) complexity"' 2>/dev/null | head -20 || echo "No high complexity files found"
  elif [ -f "metrics.cc.json" ]; then
    echo "Analyzing source code metrics for complexity hotspots..."
    cat metrics.cc.json | jq -r '.data.nodes[] | recurse(.children[]?) | select(.type=="File") | select(.attributes.complexity > 10) | "\(.name): \(.attributes.complexity) complexity"' 2>/dev/null | head -20 || echo "No high complexity files found"
  fi
else
  echo "CodeCharta not available - using fallback complexity analysis"
  # Fallback: simple complexity estimation
  find . $FIND_EXCLUDE -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs wc -l 2>/dev/null | sort -nr | head -10 || echo "Fallback complexity analysis failed"
fi

# Scan the repository for hard‑coded secrets using secretlint
# Scan all files but exclude common build artifacts and dependencies
echo "Scanning for secrets..."
pnpm dlx secretlint "**/*" --format stylish --ignore "node_modules,dist,build,.next,.turbo,coverage" 2>/dev/null || echo "secretlint failed - trying alternative approach"

# Fallback secret scanning if secretlint fails
if ! pnpm dlx secretlint --version >/dev/null 2>&1; then
  echo "secretlint not available - using grep-based secret detection"
  # Simple pattern-based secret detection
  echo "Checking for common secret patterns..."
  find . $FIND_EXCLUDE -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o -name "*.json" -o -name "*.env*" 2>/dev/null | xargs grep -l -i -E "(api_key|secret|password|token|private_key|access_key)" 2>/dev/null | head -10 || echo "No obvious secrets found"
fi

# Additional manual checks that don't require external tools:
# 1. Check for common naming convention violations (respecting .gitignore)
find . $FIND_EXCLUDE -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -E "(PascalCase|camelCase)" | head -20 2>/dev/null || echo "No naming convention violations found"

# 2. Check for deep relative imports (../../..) (respecting .gitignore)
find . $FIND_EXCLUDE -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -l "\.\./\.\./\.\./" 2>/dev/null | head -10 || echo "No deep relative imports found"

# 3. Check for potential circular dependencies (simple heuristic) (respecting .gitignore)
find . $FIND_EXCLUDE -name "*.ts" -o -name "*.tsx" 2>/dev/null | xargs grep -l "import.*from.*\.\." 2>/dev/null | head -10 || echo "No potential circular dependencies found"

# 4. Count total lines of code (excluding ignored files)
echo "Counting lines of code (excluding ignored files)..."
TOTAL_LOC=$(find . $FIND_EXCLUDE -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" 2>/dev/null | xargs wc -l 2>/dev/null | tail -1 | awk '{print $1}' || echo "0")
echo "Total lines of code: $TOTAL_LOC"
```

## Fallback Analysis (When Tools Are Not Available)

If the above tools are not available or fail, perform manual analysis:

1. **Dependency Analysis**: Manually trace import statements in key files to identify potential cycles
2. **Duplication Detection**: Look for similar function names and patterns across files
3. **Complexity Assessment**: Count function parameters, nesting levels, and conditional branches
4. **Naming Convention Check**: Scan file and folder names for consistency
5. **Import Pattern Analysis**: Check for deep relative imports and inconsistent path usage
6. **Secret Detection**: Look for common patterns like API keys, passwords, tokens in source files

## Repository Structure Detection

Automatically detect the repository structure:

```bash
# Detect if this is a monorepo
if [ -f "pnpm-workspace.yaml" ] || [ -f "lerna.json" ] || [ -f "turbo.json" ]; then
  echo "Monorepo detected"
  # List all packages/apps
  find . -name "package.json" -type f 2>/dev/null | head -20
fi

# Detect framework
if [ -f "next.config.js" ] || [ -f "next.config.ts" ]; then
  echo "Next.js project detected"
elif [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
  echo "Vite project detected"
elif [ -f "webpack.config.js" ]; then
  echo "Webpack project detected"
fi

# Detect TypeScript usage
if [ -f "tsconfig.json" ]; then
  echo "TypeScript project detected"
fi
```

## Review Rubric

- High: cycles, boundary violations, duplicate utilities, single-use wrappers, deep imports, inconsistent naming, high complexity functions or modules, hard-coded secrets.

- Medium: leaky folders, over-generic shared modules, missing base tsconfig, barrels hiding dependencies, moderately complex code that may need refactoring.
- Low: minor naming nits, import order, low complexity issues.
