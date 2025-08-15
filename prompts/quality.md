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

In addition to structural concerns, incorporate static analysis for **complexity** as part of code quality. Complex modules can impede maintainability and should be flagged for refactoring.

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

3. **File Organization**  
   Components should be in individual folders with supporting files. Use consistent file structure: types/interfaces at top, arrow functions, object parameters, and organized function order.

4. **TypeScript/TSX Standards**
   - Types and interfaces at the top of files
   - Always use arrow functions
   - Prefer object parameters for functions
   - Organized function order: variables → states → internal functions → useEffect → output
   - Component folders with supporting files (e.g., `card/card.tsx`, `card/card.styles.ts`)

5. **Architecture**  
   Enforce boundaries (UI ↔ application ↔ domain ↔ infrastructure). No imports "up the stack"; no feature code inside `shared/` that depends on app code.

6. **Dependencies**  
   Detect import cycles, deep imports, and path alias misuse. Ensure stable modules depend only on more stable modules.

7. **Duplication & Over-abstraction**  
   Identify functions/components that are near-duplicates, single-use wrappers, or premature abstractions. Recommend merge/simplify or inline.

8. **Configs**  
   Single `tsconfig.base.json` with project references. ESLint with naming, import and boundary rules. `turbo.json` pipelines consistent across packages.

9. **Complexity**  
   Highlight functions or modules with high cyclomatic or cognitive complexity and flag them for refactoring. Focus on functions with complexity scores above 10 and files with multiple high-complexity functions.

10. **TypeScript/TSX File Structure**  
    Enforce consistent file organization and coding patterns:
    - **Types/Interfaces**: Always at the top of files
    - **Function Style**: Always use arrow functions
    - **Parameters**: Prefer object parameters for functions
    - **Component Organization**: Individual folders with supporting files
    - **Function Order**: Variables → States → Internal Functions → useEffect → Output

## Method

### Phase 0: Script Validation and Setup

Before running any analysis, ensure all required scripts are present in `package.json`:

```bash
# Check if all required quality analysis scripts exist
REQUIRED_SCRIPTS=("quality:deps" "quality:unused" "quality:complexity" "quality:duplication" "quality:format")
MISSING_SCRIPTS=()

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if ! grep -q "\"$script\"" package.json; then
    MISSING_SCRIPTS+=("$script")
  fi
done

if [ ${#MISSING_SCRIPTS[@]} -gt 0 ]; then
  echo "Missing scripts in package.json: ${MISSING_SCRIPTS[*]}"
  echo "Adding missing scripts to package.json..."

  # Add the missing scripts to package.json
  # This should be done manually or via a script that modifies package.json
  echo "Please add the following scripts to package.json:"
  echo "  \"quality:deps\": \"depcruise apps/web/src --include-only \\\"^apps/web/src\\\" --output-type text\""
  echo "  \"quality:deps:graph\": \"depcruise apps/web/src --include-only \\\"^apps/web/src\\\" --output-type dot\""
  echo "  \"quality:deps:validate\": \"depcruise apps/web/src --config .dependency-cruiser.js\""
  echo "  \"quality:unused\": \"knip --reporter json --no-exit-code\""
  echo "  \"quality:unused:text\": \"knip --reporter compact --no-exit-code\""
  echo "  \"quality:complexity\": \"labinsight analyze --type deep --format json --silent\""
  echo "  \"quality:complexity:text\": \"labinsight analyze --type deep --format text --silent\""
  echo "  \"quality:duplication\": \"jscpd . --reporters json --ignore \\\"**/node_modules/**,**/dist/**,**/.next/**,**/build/**\\\"\""
  echo "  \"quality:duplication:text\": \"jscpd . --reporters text --ignore \\\"**/node_modules/**,**/dist/**,**/.next/**,**/build/**\\\"\""
  echo "  \"quality:format\": \"prettier --check \\\"**/*.{ts,tsx,js,jsx,json,css,scss,md}\\\"\""
  echo "  \"quality:all\": \"pnpm run quality:deps && pnpm run quality:unused && pnpm run quality:complexity && pnpm run quality:duplication && pnpm run quality:format\""

  exit 1
fi

# Check if Knip configuration exists
if [ ! -f "knip.json" ] && [ ! -f "knip.jsonc" ] && [ ! -f "knip.config.js" ] && [ ! -f "knip.config.ts" ]; then
  echo "Knip configuration not found. Initializing with pnpm create @knip/config..."
  pnpm create @knip/config --yes 2>/dev/null || echo "Knip config creation failed, will use default configuration"

  # If the create command didn't work, create a basic config manually
  if [ ! -f "knip.json" ] && [ ! -f "knip.jsonc" ] && [ ! -f "knip.config.js" ] && [ ! -f "knip.config.ts" ]; then
    echo "Creating basic knip.json manually..."
    cat > knip.json << 'EOF'
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "apps/*/src/**/*.{ts,tsx}",
    "packages/*/src/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}"
  ],
  "project": [
    "apps/*/src/**/*.{ts,tsx}",
    "packages/*/src/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}"
  ],
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/build/**",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}"
  ]
}
EOF
    echo "Created knip.json configuration file manually"
  else
    echo "Knip configuration created successfully"
  fi
fi

echo "All required scripts found in package.json"
```

### Phase 1: Tool Research and Understanding

Before installing or configuring any tools, thoroughly research and understand each tool's capabilities, configuration options, and best practices:

#### 1. **Dependency Cruiser** ([GitHub](https://github.com/sverweij/dependency-cruiser))

- **Purpose**: Validate and visualize dependencies with custom rules
- **Capabilities**:
  - Detect circular dependencies
  - Enforce architectural boundaries
  - Generate dependency graphs
  - Custom rule validation
- **Configuration**: `.dependency-cruiser.js` or `.dependency-cruiser.mjs`
- **Key Features**: Support for TypeScript, JavaScript, Vue, JSX/TSX
- **Output Formats**: Text, dot, json, html, mermaid

#### 2. **ESLint** ([Official Site](https://eslint.org/))

- **Purpose**: Static code analysis and linting
- **Capabilities**:
  - Code quality enforcement
  - Naming convention validation
  - Import/export analysis
  - TypeScript integration
- **Configuration**: `eslint.config.js` (flat config) or `.eslintrc.*`
- **Key Features**: Extensible with plugins, supports modern JavaScript/TypeScript

#### 3. **Knip** ([GitHub](https://github.com/webpro-nl/knip))

- **Purpose**: Find unused files, dependencies, and exports
- **Capabilities**:
  - Detect unused exports
  - Find dead code
  - Identify unused dependencies
  - TypeScript support
- **Configuration**: `knip.json` or `knip.jsonc`
- **Key Features**: Monorepo support, multiple project types

#### 4. **LabInsight** ([GitHub](https://github.com/techfever-soft/labinsight))

- **Purpose**: Code complexity and quality analysis
- **Capabilities**:
  - Cyclomatic complexity analysis
  - Cognitive complexity measurement
  - Code quality metrics
  - Custom rule support
- **Configuration**: `.labinsight` file
- **Key Features**: Multi-language support, detailed reporting
- **Important**: Must be configured to ignore build artifacts and cache directories

#### 5. **Prettier** ([Official Site](https://prettier.io/))

- **Purpose**: Code formatting and style consistency
- **Capabilities**:
  - Automatic code formatting
  - Style enforcement
  - Integration with editors
- **Configuration**: `.prettierrc` or `prettier.config.js`
- **Key Features**: Opinionated formatting, wide language support

#### 6. **jscpd** ([GitHub](https://github.com/kucherenko/jscpd))

- **Purpose**: Copy/paste detection and code duplication analysis
- **Capabilities**:
  - Detect duplicate code blocks
  - Structural similarity analysis
  - Multiple output formats
- **Configuration**: `.jscpd.json` or command line options
- **Key Features**: Support for 150+ languages, detailed reporting

### Phase 2: Tool Installation and Configuration

After understanding each tool, install and configure them properly:

#### Installation Strategy

1. **Install tools as dev dependencies** in the root package.json
2. **Create proper configuration files** for each tool
3. **Set up integration** with existing build processes
4. **Configure ignore patterns** to exclude build artifacts and dependencies

#### Installation Process

**Step 1: Install All Tools**

```bash
# Install all quality analysis tools as dev dependencies
pnpm add -D -w dependency-cruiser knip @techfever/labinsight jscpd

# Note: eslint and prettier are already installed in the project
```

**Step 2: Update package.json Scripts**
Add the following scripts to the root package.json:

```json
{
	"scripts": {
		"quality:deps": "depcruise apps/web/src --include-only \"^apps/web/src\" --output-type text",
		"quality:unused": "knip --reporter --files json",
		"quality:complexity": "labinsight analyze --type deep --format json --silent",
		"quality:duplication": "jscpd . --reporters json --ignore \"**/node_modules/**,**/dist/**,**/.next/**,**/.turbo/**,**/build/**\"",
		"quality:format": "prettier --check \"**/*.{ts,tsx,js,jsx,json,css,scss,md}\" --ignore \"audits/**,**/node_modules/**,**/.next/**,**/dist/**,**/build/**\""
	}
}
```

#### Configuration Approach

1. **Start with sensible defaults** from each tool
2. **Customize rules** based on project requirements
3. **Ensure tools work together** without conflicts
4. **Set up proper output formats** for analysis
5. **Configure ignore patterns** to exclude build artifacts and cache files

#### Critical Ignore Patterns

All analysis tools must ignore these directories and files:

- `**/node_modules/**` - Dependencies
- `**/dist/**` - Build outputs
- `**/.next/**` - Next.js build cache
- `**/.turbo/**` - Turborepo cache
- `**/build/**` - General build outputs
- `**/.DS_Store` - macOS system files
- `**/*.test.{ts,tsx}` - Test files (for complexity analysis)
- `**/*.spec.{ts,tsx}` - Spec files (for complexity analysis)

### Phase 3: Analysis Execution

Execute each tool in the correct order and capture comprehensive output:

#### Analysis Order

1. **Dependency Cruiser** - Architectural analysis
2. **ESLint** - Code quality and style
3. **Knip** - Unused code detection
4. **LabInsight** - Complexity analysis
5. **Prettier** - Formatting consistency
6. **jscpd** - Duplication detection

#### Output Capture

- **Store raw output** from each tool in timestamped directories
- **Parse and summarize** key findings
- **Generate actionable insights** from tool output
- **Create comprehensive reports** with specific recommendations

### Phase 4: Results Processing

Process and analyze the results from all tools:

#### Data Aggregation

- **Combine findings** from all tools
- **Identify patterns** across different analysis types
- **Prioritize issues** by severity and impact
- **Generate metrics** for tracking improvement

#### Report Generation

- **Create detailed findings** with specific file references
- **Provide actionable recommendations** for each issue
- **Generate agent prompts** for implementation
- **Update cursor rules** based on findings

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

2. **Findings**: List by category (naming, structure, architecture, dependencies, duplication, complexity, configs) including file paths, a short reason and a severity rating (high/medium/low).

3. **Actions**: For every finding produce a clear agent instruction describing how to apply the recommended change (rename, move, delete, simplify). These instructions should be actionable tasks that can be followed to refactor the codebase.

4. **Agent Prompts**: For each issue, provide a specific markdown formated agent prompt in the format "You're an expert Next.js, TypeScript developer and architect..." that includes:
   - Exact file references with full paths
   - Specific line numbers or code blocks that need changes
   - Code samples showing the current problematic code and the desired solution
   - Step-by-step instructions for the fix
   - Expected outcome after the change
   - Step-by-step instructions on how to test the change made so we can verify that it was an improvement

   **Generate prompts for ALL issues found, not just major categories. Include prompts for:**
   - Every duplicated function/component (not just categories)
   - Every high-complexity file
   - Every unused export pattern
   - Every naming convention violation
   - Every import pattern issue
   - Every architectural boundary violation
   - Every configuration issue

   **Prompt instructions**
   - Make sure each prompt you generate follows the PRAR workflow.
   - If possible provide desired outcomes and examples.
   - Format each prompt in a markdown code block for easy copying
   - Start each prompt by explaining that your a senior typescript developer and architect

5. **Rules**: For each pattern or convention identified (naming conventions, structure, architecture, dependencies, abstraction, config hygiene) generate, delete or update a rule file under `.cursor/rules` following MDC format with a description, appropriate globs and bullet-point guidelines. Make sure to not duplicate rules or add contradictionary instructions. Be sure to check for existing rules before adding new ones. Editing/improving on existing rules is preferred.

   **IMPORTANT**: Before generating any cursor rules, read the complete documentation at https://docs.cursor.com/en/context/rules to understand the proper MDC format, rule types, and best practices. The default for cursor rules should be to always apply them (`alwaysApply: true`). Follow the MDC format with proper description, globs, and alwaysApply properties. Keep rules focused, actionable, and under 500 lines.

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

7. **AUDIT File**: Generate a markdown file named `AUDIT.md` in the timestamped audit directory (`audits/<timestamp>/AUDIT.md`) containing all findings, analysis, proposed agent prompts, and the comprehensive refactoring plan. This file should serve as a complete record of the code quality assessment and actionable roadmap for improvements. It should also include a list of cursor rules that are either added, removed or edited

8. **TOOL REPORTS**: Store all tool outputs in the `audits/<timestamp>/reports/` directory with descriptive filenames:
   - `terminal.txt` - Complete terminal log of the entire analysis process
   - `dependency-analysis.txt` and `dependency-graph.svg` (dependency-cruiser)
   - `eslint-report.json` and `eslint-report.txt` (ESLint)
   - `knip-report.json` and `knip-report.txt` (knip)
   - `complexity-report.json` and `complexity-report.txt` (LabInsight)
   - `prettier-report.txt` (Prettier)
   - `duplication-report.json` and `duplication-report.txt` (jscpd)
   - `duplication-patterns.txt` - Extracted duplication patterns for agent prompts
   - `unused-cleanup-targets.txt` - Identified unused code for removal
   - `complexity-refactoring-targets.txt` - High complexity functions for refactoring
   - `eslint-issues.txt` - Code quality issues for fixing

   This allows the end user to do deeper analysis of the raw tool outputs and provides structured data for generating specific agent prompts.

## Tool-Specific Analysis Scripts

### Dependency Cruiser Analysis

```bash
# Check if dependency-cruiser is installed and add scripts if needed
if ! grep -q "quality:deps" package.json; then
  echo "Adding quality analysis scripts to package.json..."
  # Add the scripts to package.json (this should be done manually or via script)
fi

# Run analysis for circular dependencies using pnpm run
pnpm run quality:deps > audits/$(date +"%Y%m%d_%H%M%S")/reports/dependency-analysis.txt

# Generate dependency graph
pnpm run quality:deps:graph | dot -T svg > audits/$(date +"%Y%m%d_%H%M%S")/reports/dependency-graph.svg

# Validate against rules
pnpm run quality:deps:validate
```

### ESLint Analysis

```bash
# Use existing lint command from package.json
pnpm lint > audits/$(date +"%Y%m%d_%H%M%S")/reports/eslint-report.txt

# Run ESLint with JSON format for programmatic analysis
pnpm lint --format json > audits/$(date +"%Y%m%d_%H%M%S")/reports/eslint-report.json

# Check for specific rule violations
pnpm lint --format compact | grep -E "(naming-convention|import|no-unused)"
```

### Knip Analysis

```bash
# Check if knip is installed and add scripts if needed
if ! grep -q "quality:unused" package.json; then
  echo "Adding quality analysis scripts to package.json..."
  # Add the scripts to package.json (this should be done manually or via script)
fi

# Initialize Knip configuration if not present
if [ ! -f "knip.json" ] && [ ! -f "knip.jsonc" ] && [ ! -f "knip.config.js" ] && [ ! -f "knip.config.ts" ]; then
  echo "Initializing Knip configuration with pnpm create @knip/config..."
  pnpm create @knip/config --yes 2>/dev/null || echo "Knip config creation failed, will use default configuration"

  # If the create command didn't work, create a basic config manually
  if [ ! -f "knip.json" ] && [ ! -f "knip.jsonc" ] && [ ! -f "knip.config.js" ] && [ ! -f "knip.config.ts" ]; then
    echo "Creating basic knip.json manually..."
    cat > knip.json << 'EOF'
{
  "$schema": "https://unpkg.com/knip@latest/schema.json",
  "entry": [
    "apps/*/src/**/*.{ts,tsx}",
    "packages/*/src/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}"
  ],
  "project": [
    "apps/*/src/**/*.{ts,tsx}",
    "packages/*/src/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}"
  ],
  "ignore": [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/.turbo/**",
    "**/build/**",
    "**/*.test.{ts,tsx}",
    "**/*.spec.{ts,tsx}",
    "**/.DS_Store"
  ]
}
EOF
    echo "Created knip.json configuration file manually"
  else
    echo "Knip configuration created successfully"
  fi
fi

# Run analysis for unused exports using pnpm run
pnpm run quality:unused > audits/$(date +"%Y%m%d_%H%M%S")/reports/knip-report.json

# Run compact version for readability
pnpm run quality:unused:text > audits/$(date +"%Y%m%d_%H%M%S")/reports/knip-report.txt

# Check specific categories
pnpm dlx knip --include dependencies,exports,types > audits/$(date +"%Y%m%d_%H%M%S")/reports/knip-categories.txt
```

### LabInsight Analysis

```bash
# Check if labinsight is installed and add scripts if needed
if ! grep -q "quality:complexity" package.json; then
  echo "Adding quality analysis scripts to package.json..."
  # Add the scripts to package.json (this should be done manually or via script)
fi

# Run complexity analysis using pnpm run with output redirection
# Create temporary directory for labinsight output
TEMP_DIR="audits/$(date +"%Y%m%d_%H%M%S")/temp"
mkdir -p "$TEMP_DIR"

# Set environment variable to redirect labinsight output
export LABINSIGHT_OUTPUT_DIR="$TEMP_DIR"

# Run complexity analysis and capture output
pnpm run quality:complexity > audits/$(date +"%Y%m%d_%H%M%S")/reports/complexity-report.json 2>&1

# Run text version for readability
pnpm run quality:complexity:text > audits/$(date +"%Y%m%d_%H%M%S")/reports/complexity-report.txt 2>&1

# Run basic analysis for comparison
labinsight analyze --type basic --format json --silent --ignore "**/node_modules/**,**/dist/**,**/.next/**,**/.turbo/**,**/build/**,**/.DS_Store" > audits/$(date +"%Y%m%d_%H%M%S")/reports/complexity-basic.json 2>&1

# Move any generated files from temp to reports
if [ -d "$TEMP_DIR" ]; then
  mv "$TEMP_DIR"/* audits/$(date +"%Y%m%d_%H%M%S")/reports/ 2>/dev/null || true
  rmdir "$TEMP_DIR" 2>/dev/null || true
fi
```

### Prettier Analysis

```bash
# Check if prettier is installed and add scripts if needed
if ! grep -q "quality:format" package.json; then
  echo "Adding quality analysis scripts to package.json..."
  # Add the scripts to package.json (this should be done manually or via script)
fi

# Check formatting consistency using pnpm run
# IMPORTANT: Use quality:format script, NOT pnpm format
# The quality:format script uses prettier --check which provides proper output
pnpm run quality:format > audits/$(date +"%Y%m%d_%H%M%S")/reports/prettier-report.txt 2>&1

# Alternative: Run prettier directly if needed
# prettier --check "**/*.{ts,tsx,js,jsx,json,css,scss,md}" > audits/$(date +"%Y%m%d_%H%M%S")/reports/prettier-report.txt 2>&1
```

**Important Notes:**

- Prettier output shows `[warn]` for files that need formatting
- Prettier output shows `[error]` for files with syntax errors
- Exit code 0 = all files properly formatted
- Exit code 1 = some files need formatting
- Exit code 2 = syntax errors found
- The output should contain file paths and formatting status, not content from other files
- **Note:** Audit directories should be excluded from prettier analysis to avoid analyzing generated reports

### jscpd Analysis

```bash
# Check if jscpd is installed and add scripts if needed
if ! grep -q "quality:duplication" package.json; then
  echo "Adding quality analysis scripts to package.json..."
  # Add the scripts to package.json (this should be done manually or via script)
fi

# Run duplication analysis using pnpm run with output redirection
# Create temporary directory for jscpd output
TEMP_DIR="audits/$(date +"%Y%m%d_%H%M%S")/temp"
mkdir -p "$TEMP_DIR"

# Set environment variable to redirect jscpd output
export JSCPD_OUTPUT_DIR="$TEMP_DIR"

# Run duplication analysis and capture output
pnpm run quality:duplication > audits/$(date +"%Y%m%d_%H%M%S")/reports/duplication-report.json 2>&1

# Run text version for readability
pnpm run quality:duplication:text > audits/$(date +"%Y%m%d_%H%M%S")/reports/duplication-report.txt 2>&1

# Generate detailed report with console and HTML output
jscpd . --reporters console,html --ignore "**/node_modules/**,**/dist/**,**/.next/**,**/.turbo/**,**/build/**" > audits/$(date +"%Y%m%d_%H%M%S")/reports/duplication-detailed.txt 2>&1

# Move any generated files from temp to reports
if [ -d "$TEMP_DIR" ]; then
  mv "$TEMP_DIR"/* audits/$(date +"%Y%m%d_%H%M%S")/reports/ 2>/dev/null || true
  rmdir "$TEMP_DIR" 2>/dev/null || true
fi

# Note: jscpd statistics are included in the JSON output and can be parsed programmatically
# The detailed report provides comprehensive duplication analysis with file locations
```

## Comprehensive Analysis Execution

### Phase 3: Run Complete Analysis

Execute the analysis in this order:

#### Step 1: Setup Audit Directory

```bash
# Create timestamped audit directory
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
AUDIT_DIR="audits/${TIMESTAMP}"
mkdir -p "${AUDIT_DIR}/reports"
echo "Audit directory created: ${AUDIT_DIR}"
```

#### Step 2: Run All Analysis Tools with Terminal Log Capture

```bash
# Start capturing all terminal output
exec 1> >(tee -a "${AUDIT_DIR}/reports/terminal.txt")
exec 2> >(tee -a "${AUDIT_DIR}/reports/terminal.txt" >&2)

echo "=== CODE QUALITY ANALYSIS STARTED ==="
echo "Timestamp: $(date)"
echo "Audit Directory: ${AUDIT_DIR}"
echo ""

# Check if all required scripts exist in package.json
echo "Checking for required quality analysis scripts..."
REQUIRED_SCRIPTS=("quality:deps" "quality:unused" "quality:complexity" "quality:duplication" "quality:format")
MISSING_SCRIPTS=()

for script in "${REQUIRED_SCRIPTS[@]}"; do
  if ! grep -q "\"$script\"" package.json; then
    MISSING_SCRIPTS+=("$script")
  fi
done

if [ ${#MISSING_SCRIPTS[@]} -gt 0 ]; then
  echo "Missing scripts in package.json: ${MISSING_SCRIPTS[*]}"
  echo "Please add the missing scripts to package.json before running the analysis"
  exit 1
fi

echo "All required scripts found in package.json"
echo ""

# Primary analysis using pnpm run scripts
echo "=== RUNNING PRIMARY ANALYSIS ==="

# Create temporary directory for tool outputs
TEMP_DIR="${AUDIT_DIR}/temp"
mkdir -p "$TEMP_DIR"

echo "Running dependency analysis..."
pnpm run quality:deps > "${AUDIT_DIR}/reports/dependency-analysis.txt" 2>&1

echo "Running unused code analysis..."
pnpm run quality:unused > "${AUDIT_DIR}/reports/knip-report.json" 2>&1

echo "Running complexity analysis..."
# Set environment variable to redirect labinsight output
export LABINSIGHT_OUTPUT_DIR="$TEMP_DIR"
pnpm run quality:complexity > "${AUDIT_DIR}/reports/complexity-report.json" 2>&1

echo "Running duplication analysis..."
# Set environment variable to redirect jscpd output
export JSCPD_OUTPUT_DIR="$TEMP_DIR"
pnpm run quality:duplication > "${AUDIT_DIR}/reports/duplication-report.json" 2>&1

# Code quality checks
echo "Running ESLint analysis..."
pnpm lint > "${AUDIT_DIR}/reports/eslint-report.txt" 2>&1
echo "Running Prettier analysis..."
pnpm run quality:format > "${AUDIT_DIR}/reports/prettier-report.txt" 2>&1

# Additional formats and analysis using pnpm run
echo "=== GENERATING ADDITIONAL REPORTS ==="
echo "Generating compact text reports..."
pnpm run quality:unused:text > "${AUDIT_DIR}/reports/knip-report.txt" 2>&1
pnpm run quality:complexity:text > "${AUDIT_DIR}/reports/complexity-report.txt" 2>&1
pnpm run quality:duplication:text > "${AUDIT_DIR}/reports/duplication-report.txt" 2>&1

# Additional analysis for comprehensive coverage
echo "Generating ESLint JSON report..."
pnpm lint --format json > "${AUDIT_DIR}/reports/eslint-report.json" 2>&1

echo "Running Knip categories analysis..."
pnpm dlx knip --include dependencies,exports,types --no-exit-code > "${AUDIT_DIR}/reports/knip-categories.txt" 2>&1

echo "Running LabInsight basic analysis..."
labinsight analyze --type basic --format json --silent > "${AUDIT_DIR}/reports/complexity-basic.json" 2>&1

echo "Generating JSCPD detailed report..."
jscpd . --reporters console,html --ignore "**/node_modules/**,**/dist/**,**/.next/**,**/.turbo/**,**/build/**" > "${AUDIT_DIR}/reports/duplication-detailed.txt" 2>&1

echo "Running dependency cruiser validation..."
pnpm run quality:deps:validate > "${AUDIT_DIR}/reports/dependency-validation.txt" 2>&1

echo "Generating dependency graph..."
pnpm run quality:deps:graph | dot -T svg > "${AUDIT_DIR}/reports/dependency-graph.svg" 2>&1

# Clean up temporary files and move generated outputs
echo "=== CLEANING UP TEMPORARY FILES ==="
if [ -d "$TEMP_DIR" ]; then
  echo "Moving generated files from temp to reports..."
  mv "$TEMP_DIR"/* "${AUDIT_DIR}/reports/" 2>/dev/null || true
  rmdir "$TEMP_DIR" 2>/dev/null || true
fi

# Clean up any files that might have been created in the root
echo "Cleaning up root directory artifacts..."
rm -rf reports/deep/ 2>/dev/null || true
rm -rf temp/ 2>/dev/null || true
rm -rf report/ 2>/dev/null || true

# Run cleanup script if it exists
if [ -f "cleanup-quality-artifacts.sh" ]; then
  echo "Running cleanup script..."
  ./cleanup-quality-artifacts.sh
fi

echo "=== ANALYSIS COMPLETED ==="
echo "All reports generated in: ${AUDIT_DIR}/reports/"
echo "Terminal log saved to: ${AUDIT_DIR}/reports/terminal.txt"
echo ""
```

#### Step 3: Analyze Generated Reports and Create Agent Prompts

```bash
echo "=== ANALYZING REPORTS FOR AGENT PROMPTS ==="
echo "Reading and analyzing generated reports..."

# Read and parse the generated reports to extract actionable insights
echo "Parsing duplication report..."
DUPLICATION_REPORT="${AUDIT_DIR}/reports/duplication-report.json"
if [ -f "$DUPLICATION_REPORT" ]; then
  echo "Found duplication report, analyzing patterns..."
  # Extract high-value duplication patterns for agent prompts
  grep -A 5 -B 5 "Clone found" "$DUPLICATION_REPORT" | head -50 > "${AUDIT_DIR}/reports/duplication-patterns.txt"
fi

echo "Parsing unused code report..."
UNUSED_REPORT="${AUDIT_DIR}/reports/knip-report.txt"
if [ -f "$UNUSED_REPORT" ]; then
  echo "Found unused code report, identifying cleanup targets..."
  # Extract unused files and exports for removal prompts
  grep "Unused files\|Unused exports\|Unused dependencies" "$UNUSED_REPORT" > "${AUDIT_DIR}/reports/unused-cleanup-targets.txt"
fi

echo "Parsing complexity report..."
COMPLEXITY_REPORT="${AUDIT_DIR}/reports/complexity-report-fixed.json"
if [ -f "$COMPLEXITY_REPORT" ]; then
  echo "Found complexity report, identifying refactoring targets..."
  # Extract high complexity functions for refactoring prompts
  grep -B 2 "Cyclomatic Complexity: [2-9][0-9]\|Cognitive Complexity: [2-9][0-9]" "$COMPLEXITY_REPORT" | head -30 > "${AUDIT_DIR}/reports/complexity-refactoring-targets.txt"
fi

echo "Parsing ESLint report..."
ESLINT_REPORT="${AUDIT_DIR}/reports/eslint-report.txt"
if [ -f "$ESLINT_REPORT" ]; then
  echo "Found ESLint report, identifying code quality issues..."
  # Extract naming convention violations and other issues
  grep -E "(error|warning)" "$ESLINT_REPORT" > "${AUDIT_DIR}/reports/eslint-issues.txt"
fi

echo "Report analysis completed. Agent prompts will be generated based on these findings."
echo ""
```

#### Step 4: Generate Audit Report with Agent Prompts

```bash
echo "=== GENERATING COMPREHENSIVE AUDIT REPORT ==="
echo "Creating AUDIT.md with findings and agent prompts..."

# The audit report will be generated as AUDIT.md in the audit directory
# This will be created by the analysis script with all findings and recommendations
# The script should now use the parsed report data to generate specific agent prompts
```

#### Step 5: Review cursor rules

When you're done with the audit review the cursor rules and see if they're all needed. If rules contradict each other only keep the one that suites the best. If rules are very similar you should combine them.

**Cursor Rules Requirements:**

- **Documentation**: Before generating any cursor rules, read the complete documentation at https://docs.cursor.com/en/context/rules to understand the proper MDC format, rule types, and best practices.
- **Default Setting**: All cursor rules should default to `alwaysApply: true` unless there's a specific reason to scope them differently.
- **MDC Format**: Use proper MDC format with description, globs, and alwaysApply properties.
- **Rule Types**: Understand the difference between Always, Auto Attached, Agent Requested, and Manual rule types.
- **Best Practices**: Keep rules focused, actionable, and under 500 lines. Split large rules into multiple, composable rules.

## Agent Prompt Generation from Reports

After generating all reports, use the structured data to create specific, actionable agent prompts:

### Duplication-Based Prompts

- **Source**: `duplication-patterns.txt`
- **Focus**: Extract common patterns and create shared components
- **Example**: "Create a shared layout component for team/[id]/info/page.tsx and team/[id]/members/page.tsx"

### Unused Code Cleanup Prompts

- **Source**: `unused-cleanup-targets.txt`
- **Focus**: Remove dead code and unused dependencies
- **Example**: "Remove 58 unused files and 30+ unused exports identified by Knip"

### Complexity Refactoring Prompts

- **Source**: `complexity-refactoring-targets.txt`
- **Focus**: Split high-complexity functions into smaller, focused functions
- **Example**: "Refactor seed.ts function with cyclomatic complexity 50 into smaller functions"

### Code Quality Fix Prompts

- **Source**: `eslint-issues.txt`
- **Focus**: Fix naming conventions and other code quality issues
- **Example**: "Fix 19 naming convention violations in metrics.ts"

### Prompt Structure

Each agent prompt should include:

1. **Specific file references** with exact paths
2. **Current issue description** with metrics/evidence
3. **Required changes** with clear instructions
4. **Expected outcome** with measurable results
5. **Testing instructions** to verify improvements

## TypeScript/TSX File Structure Standards

### File Organization

#### Component Folder Structure

```
components/
├── user-card/
│   ├── user-card.tsx          # Main component
│   ├── user-card.styles.ts    # Styling utilities
│   ├── user-card.types.ts     # Type definitions
│   ├── user-card.utils.ts     # Helper functions
│   └── index.ts               # Barrel export
├── data-table/
│   ├── data-table.tsx
│   ├── data-table.styles.ts
│   ├── data-table.types.ts
│   └── index.ts
```

#### File Structure Order

1. **Imports** (external libraries first, then internal)
2. **Types/Interfaces** (always at the top)
3. **Constants** (UPPER_CASE)
4. **Variables** (camelCase)
5. **State declarations** (useState, useReducer)
6. **Internal functions** (helpers, utilities)
7. **useEffect hooks**
8. **Event handlers**
9. **Component output** (return statement)

### Coding Standards

#### Types and Interfaces

```typescript
// ✅ Good: Types at the top
interface UserCardProps {
	user: User;
	onEdit?: (user: User) => void;
	onDelete?: (userId: string) => void;
	variant?: 'default' | 'compact';
}

type UserCardVariant = 'default' | 'compact';

interface UserCardState {
	isEditing: boolean;
	isLoading: boolean;
}

// Component implementation below...
```

#### Arrow Functions

```typescript
// ✅ Good: Always use arrow functions
const UserCard = ({
	user,
	onEdit,
	onDelete,
	variant = 'default',
}: UserCardProps) => {
	// Component logic
};

// ✅ Good: Arrow functions for handlers
const handleEdit = () => {
	setIsEditing(true);
};

const handleSave = async (userData: Partial<User>) => {
	// Save logic
};

// ❌ Bad: Function declarations
function UserCard(props: UserCardProps) {
	// Component logic
}
```

#### Object Parameters

```typescript
// ✅ Good: Object parameters for multiple arguments
const createUser = async ({ name, email, role }: CreateUserParams) => {
	// Implementation
};

const updateUser = async ({ id, data }: UpdateUserParams) => {
	// Implementation
};

// ✅ Good: Object parameters for complex configurations
const fetchUsers = async ({
	page = 1,
	limit = 10,
	filters = {},
	sortBy = 'name',
}: FetchUsersParams) => {
	// Implementation
};

// ❌ Bad: Multiple individual parameters
const createUser = async (name: string, email: string, role: string) => {
	// Implementation
};
```

#### Function Order Example

```typescript
const UserCard = ({ user, onEdit, onDelete, variant = 'default' }: UserCardProps) => {
  // 1. Types (already at top of file)

  // 2. Constants
  const MAX_NAME_LENGTH = 50;
  const DEFAULT_AVATAR = '/images/default-avatar.png';

  // 3. Variables
  const isAdmin = user.role === 'ADMIN';
  const displayName = user.name.length > MAX_NAME_LENGTH
    ? `${user.name.slice(0, MAX_NAME_LENGTH)}...`
    : user.name;

  // 4. State declarations
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState(user);

  // 5. Internal functions
  const validateForm = (data: Partial<User>): boolean => {
    return !!(data.name && data.email);
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US').format(date);
  };

  // 6. useEffect hooks
  useEffect(() => {
    if (isEditing) {
      setFormData(user);
    }
  }, [isEditing, user]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditing) {
        setIsEditing(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isEditing]);

  // 7. Event handlers
  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);
    try {
      await updateUser({ id: user.id, data: formData });
      setIsEditing(false);
      onEdit?.(formData as User);
    } catch (error) {
      console.error('Failed to update user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteUser({ id: user.id });
      onDelete?.(user.id);
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Component output
  return (
    <div className={cn('user-card', `user-card--${variant}`)}>
      {/* JSX content */}
    </div>
  );
};
```

### Supporting Files

#### Styles File (`component.styles.ts`)

```typescript
import { cn } from '@/lib/utils';

export const userCardStyles = {
	container: (variant: UserCardVariant) =>
		cn('rounded-lg border p-4', variant === 'compact' && 'p-2'),
	header: 'flex items-center justify-between mb-3',
	avatar: 'w-10 h-10 rounded-full',
	name: 'font-semibold text-gray-900',
	email: 'text-sm text-gray-500',
	actions: 'flex gap-2 mt-3',
	button: (variant: 'primary' | 'secondary') =>
		cn(
			'px-3 py-1 rounded text-sm',
			variant === 'primary' && 'bg-blue-500 text-white',
			variant === 'secondary' && 'bg-gray-200 text-gray-700'
		),
};
```

#### Types File (`component.types.ts`)

```typescript
export interface User {
	id: string;
	name: string;
	email: string;
	role: 'ADMIN' | 'USER' | 'GUEST';
	avatar?: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface UserCardProps {
	user: User;
	onEdit?: (user: User) => void;
	onDelete?: (userId: string) => void;
	variant?: 'default' | 'compact';
}

export type UserCardVariant = 'default' | 'compact';

export interface CreateUserParams {
	name: string;
	email: string;
	role: User['role'];
	avatar?: string;
}

export interface UpdateUserParams {
	id: string;
	data: Partial<User>;
}
```

#### Utils File (`component.utils.ts`)

```typescript
import { User } from './user-card.types';

export const formatUserName = (name: string, maxLength = 50): string => {
	return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

export const validateUserEmail = (email: string): boolean => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

export const getUserInitials = (user: User): string => {
	return user.name
		.split(' ')
		.map((word) => word[0])
		.join('')
		.toUpperCase()
		.slice(0, 2);
};
```

#### Index File (`index.ts`)

```typescript
export { UserCard } from './user-card';
export type {
	UserCardProps,
	User,
	CreateUserParams,
	UpdateUserParams,
} from './user-card.types';
export { userCardStyles } from './user-card.styles';
export {
	formatUserName,
	validateUserEmail,
	getUserInitials,
} from './user-card.utils';
```

### Import/Export Standards

#### Import Order

```typescript
// 1. React and Next.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// 2. External libraries
import { cn } from 'clsx';
import { format } from 'date-fns';

// 3. Internal utilities and types
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// 4. Local imports (same folder)
import { userCardStyles } from './user-card.styles';
import { formatUserName } from './user-card.utils';
import type { UserCardProps, User } from './user-card.types';
```

#### Export Standards

```typescript
// ✅ Good: Named exports for components
export const UserCard = ({ user, onEdit, onDelete }: UserCardProps) => {
	// Component implementation
};

// ✅ Good: Named exports for utilities
export const formatUserName = (name: string): string => {
	// Implementation
};

// ✅ Good: Type exports
export type { UserCardProps, User };

// ❌ Bad: Default exports (except for main component files)
export default UserCard;
```

### Common Patterns

#### Action Functions

```typescript
// ✅ Good: Consistent action pattern
export const createUserAction = async ({
	name,
	email,
	role,
}: CreateUserParams): Promise<ActionState<User>> => {
	try {
		const user = await db.user.create({ data: { name, email, role } });
		return {
			isSuccess: true,
			message: 'User created successfully',
			data: user,
		};
	} catch (error) {
		console.error('Error creating user:', error);
		return { isSuccess: false, message: 'Failed to create user' };
	}
};
```

#### Custom Hooks

```typescript
// ✅ Good: Custom hook with object parameters
export const useUser = ({ userId, includeProfile = false }: UseUserParams) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchUser = async () => {
			setIsLoading(true);
			try {
				const result = await getUserAction({ id: userId, includeProfile });
				if (result.isSuccess) {
					setUser(result.data);
				} else {
					setError(result.message);
				}
			} catch (err) {
				setError('Failed to fetch user');
			} finally {
				setIsLoading(false);
			}
		};

		fetchUser();
	}, [userId, includeProfile]);

	return { user, isLoading, error };
};
```

## Review Rubric

- **High**: cycles, boundary violations, duplicate utilities, single-use wrappers, deep imports, inconsistent naming, high complexity functions or modules.

- **Medium**: leaky folders, over-generic shared modules, missing base tsconfig, barrels hiding dependencies, moderately complex code that may need refactoring.
- **Low**: minor naming nits, import order, low complexity issues.
