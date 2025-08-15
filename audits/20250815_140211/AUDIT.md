# 📊 CODE QUALITY METRICS

| Metric                       | Value      | Status    |
| ---------------------------- | ---------- | --------- |
| **Code Duplication**         | 93 clones  | 🔴 High   |
| **High Complexity Files**    | N/A        | 🔴 High   |
| **Unused Exports**           | 30+        | 🟡 Medium |
| **Unused Files**             | 58         | 🔴 High   |
| **Average Complexity**       | N/A        | 🟡 Medium |
| **Architectural Violations** | 0          | 🟢 Good   |
| **Repository Size**          | 21,631 LOC | 🟢 Good   |
| **ESLint Errors**            | 19         | 🟡 Medium |
| **Prettier Issues**          | 39 files   | 🟡 Medium |

# 🔍 FINDINGS

## Duplication (High Severity)

### Page Layout Duplication

- **Files**: Multiple team and user page layouts have duplicated code patterns
- **Issue**: Similar layout structures repeated across different pages
- **Severity**: High
- **Impact**: Maintenance burden, inconsistent updates

### Action Function Duplication

- **Files**: `team.actions.ts`, `user-profile.actions.ts`, `membership.actions.ts`
- **Issue**: Similar CRUD patterns repeated across different entities
- **Severity**: High
- **Impact**: Code bloat, potential for bugs

### Metrics Actions Duplication

- **Files**: `team-metrics.actions.ts`, `user-metrics.actions.ts`, `organisation-metrics.actions.ts`
- **Issue**: Nearly identical metrics calculation functions
- **Severity**: High
- **Impact**: Maintenance overhead, inconsistent metrics

### Table Component Duplication

- **Files**: Various table components in `src/components/tables/`
- **Issue**: Similar table structures and patterns
- **Severity**: Medium
- **Impact**: UI inconsistency, maintenance burden

## Unused Code (High Severity)

### Unused Files (58 files)

- **Location**: Various components, actions, and utilities
- **Issue**: Dead code taking up space and causing confusion
- **Severity**: High
- **Impact**: Repository bloat, maintenance overhead

### Unused Exports (30+ exports)

- **Location**: Shadcn UI components, action functions, utilities
- **Issue**: Exported functions and components not used anywhere
- **Severity**: Medium
- **Impact**: API surface bloat, confusion for developers

### Unused Dependencies

- **Location**: `package.json` files across apps
- **Issue**: AI SDK packages, UI libraries, and utilities not used
- **Severity**: Medium
- **Impact**: Bundle size, security vulnerabilities

## Code Quality Issues (Medium Severity)

### Naming Convention Violations

- **Location**: `apps/database/src/metrics.ts`, `apps/database/src/seed.ts`
- **Issue**: Constants using UPPER_CASE instead of camelCase
- **Severity**: Medium
- **Impact**: Inconsistent code style

### Formatting Issues

- **Location**: 39 files across the repository
- **Issue**: Inconsistent code formatting
- **Severity**: Low
- **Impact**: Code readability

## Architecture (Good)

### Dependency Structure

- **Status**: Clean dependency structure with proper boundaries
- **Finding**: No circular dependencies detected
- **Severity**: Good
- **Impact**: Maintainable architecture

# 🛠️ ACTIONS

## Immediate Actions (High Priority)

### 1. Remove Unused Files

- Delete 58 unused files identified by Knip
- Clean up unused exports from components and actions
- Remove unused dependencies from package.json files

### 2. Consolidate Duplicated Code

- Create shared layout components for team and user pages
- Extract common CRUD patterns into base action classes
- Create shared metrics calculation utilities
- Consolidate table component patterns

### 3. Fix Code Quality Issues

- Fix naming convention violations in database metrics
- Run Prettier to fix formatting issues
- Update ESLint configuration if needed

## Medium Priority Actions

### 4. Refactor Complex Functions

- Break down large action functions into smaller, focused functions
- Extract common validation logic
- Create shared utility functions for repeated patterns

### 5. Improve Component Architecture

- Create base table component with configurable columns
- Extract common form patterns into reusable components
- Standardize dialog and modal patterns

## Low Priority Actions

### 6. Documentation and Standards

- Update coding standards documentation
- Create component usage guidelines
- Document shared patterns and utilities

# 🤖 AGENT PROMPTS

## Prompt 1: Remove Unused Files

```markdown
You're an expert Next.js, TypeScript developer and architect. I need you to remove 58 unused files identified by the Knip analysis tool.

**Files to Remove:**

- apps/database/src/seed.ts
- apps/mail/eslint.config.js
- apps/web/shadcn/hooks/cn.ts
- apps/web/shadcn/hooks/use-mobile.tsx
- apps/web/shadcn/ui/breadcrumb.tsx
- apps/web/shadcn/ui/carousel.tsx
- apps/web/shadcn/ui/chart.tsx
- apps/web/shadcn/ui/collapsible.tsx
- apps/web/shadcn/ui/navigation-menu.tsx
- apps/web/shadcn/ui/progress.tsx
- apps/web/shadcn/ui/scroll-area.tsx
- apps/web/shadcn/ui/select.tsx
- apps/web/shadcn/ui/separator.tsx
- apps/web/shadcn/ui/sheet.tsx
- apps/web/shadcn/ui/sidebar.tsx
- apps/web/shadcn/ui/skeleton.tsx
- apps/web/shadcn/ui/switch.tsx
- apps/web/shadcn/ui/toggle.tsx
- apps/web/src/components/admin/admin-content.tsx
- apps/web/src/components/admin/admin-skeleton.tsx
- apps/web/src/components/admin/user-detail-skeleton.tsx
- apps/web/src/components/admin/user-search.tsx
- apps/web/src/components/app-layout.tsx
- apps/web/src/components/app-sidebar.tsx
- apps/web/src/components/context-menus/cases-context-menu.tsx
- apps/web/src/components/context-menus/index.ts
- apps/web/src/components/context-menus/organization-members-context-menu.tsx
- apps/web/src/components/context-menus/state-context-menu.tsx
- apps/web/src/components/context-menus/team-members-context-menu.tsx
- apps/web/src/components/dialogs/delete-team-dialog.tsx
- apps/web/src/components/forms/user-create-form.tsx
- apps/web/src/components/memberships-list.tsx
- apps/web/src/components/memberships-list/case-memberships.tsx
- apps/web/src/components/memberships-list/client-memberships.tsx
- apps/web/src/components/memberships-list/organization-memberships.tsx
- apps/web/src/components/memberships-list/team-memberships.tsx
- apps/web/src/components/multi-step-form.tsx
- apps/web/src/components/pick-user-profile.tsx
- apps/web/src/components/profile-skeleton.tsx
- apps/web/src/components/tables/events-table.tsx
- apps/web/src/components/tabs.tsx
- apps/web/src/components/team-state-manager.tsx
- apps/web/src/hooks/use-copy-to-clipboard.ts
- apps/web/src/hooks/use-mobile.ts
- apps/web/src/i18n/request.ts
- apps/web/src/lib/db/client/client.actions.ts
- apps/web/src/lib/db/client/client.types.ts
- apps/web/src/lib/db/event/event.types.ts
- apps/web/src/lib/db/membership/membership.hooks.ts
- apps/web/src/lib/db/membership/membership.types.ts
- apps/web/src/lib/db/organisation/organisation.types.ts
- apps/web/src/lib/db/team/team.types.ts
- apps/web/src/lib/db/user/user.types.ts
- apps/web/src/lib/i18n/types.ts
- apps/web/src/lib/state-machines/organization-state-machine.ts
- apps/web/src/lib/state-machines/team-member-state-machine.ts
- apps/web/src/lib/state-machines/team-state-machine.ts
- apps/web/src/lib/state-machines/user-state-machine.ts

**Instructions:**

1. Delete each file listed above
2. Check for any imports of these files and remove them
3. Update any references to these components in other files
4. Test that the application still builds and runs correctly
5. Commit the changes with a descriptive message

**Expected Outcome:**

- Reduced repository size by ~58 files
- Cleaner codebase with no dead code
- Improved build times and reduced confusion

**Testing:**

- Run `pnpm build` to ensure no build errors
- Run `pnpm dev` to ensure the application starts correctly
- Check that no console errors appear related to missing imports
```

## Prompt 2: Fix Naming Convention Violations

```markdown
You're an expert Next.js, TypeScript developer and architect. I need you to fix naming convention violations in the database metrics file.

**File to Fix:** apps/database/src/metrics.ts

**Current Issues:**

- Object literal properties using UPPER_CASE instead of camelCase
- Lines 5-25 have naming convention violations

**Required Changes:**

1. Change `USER_PROFILE` to `userProfile`
2. Change `CREATED` to `created`
3. Change `DELETED` to `deleted`
4. Change `ORGANIZATION` to `organization`
5. Change `TEAM` to `team`
6. Change `INVITE` to `invite`
7. Change `EXPIRED` to `expired`
8. Change `ACCEPTED` to `accepted`
9. Change `CASE` to `case`

**Instructions:**

1. Open apps/database/src/metrics.ts
2. Update all object literal property names to use camelCase
3. Ensure the functionality remains the same
4. Update any references to these properties in other files
5. Run ESLint to verify the fixes

**Expected Outcome:**

- All naming convention violations resolved
- Code follows consistent camelCase naming
- No functional changes to the metrics system

**Testing:**

- Run `pnpm lint` in the database app to verify no more naming errors
- Ensure metrics functionality still works correctly
- Check that any code using these metrics still functions
```

## Prompt 3: Create Shared Layout Component

````markdown
You're an expert Next.js, TypeScript developer and architect. I need you to create a shared layout component to eliminate duplication between team and user pages.

**Duplicated Files:**

- apps/web/app/[locale]/(authenticated)/team/[id]/info/page.tsx
- apps/web/app/[locale]/(authenticated)/team/[id]/members/page.tsx
- apps/web/app/[locale]/(authenticated)/user/[id]/page.tsx
- apps/web/app/[locale]/(authenticated)/user/[id]/memberships/page.tsx

**Current Issue:**
These pages have similar layout structures with duplicated code patterns.

**Required Changes:**

1. Create a shared layout component at `apps/web/src/components/shared/entity-layout.tsx`
2. Extract common layout patterns into this component
3. Update the existing pages to use the shared component
4. Ensure proper TypeScript typing for the shared component

**Component Structure:**

```tsx
interface EntityLayoutProps {
	entityId: string;
	entityType: 'team' | 'user';
	children: React.ReactNode;
	title: string;
	subtitle?: string;
	actions?: React.ReactNode;
}

export function EntityLayout({
	entityId,
	entityType,
	children,
	title,
	subtitle,
	actions,
}: EntityLayoutProps) {
	// Shared layout logic here
}
```
````

**Instructions:**

1. Analyze the duplicated code patterns in the mentioned files
2. Create the shared EntityLayout component
3. Update each page to use the shared component
4. Pass appropriate props to customize the layout for each entity type
5. Ensure proper navigation and breadcrumbs work correctly

**Expected Outcome:**

- Eliminated code duplication between team and user pages
- Consistent layout patterns across entity pages
- Easier maintenance and updates to layout logic
- Proper TypeScript typing and error handling

**Testing:**

- Navigate to team pages and verify layout works correctly
- Navigate to user pages and verify layout works correctly
- Check that breadcrumbs and navigation still function
- Ensure responsive design works on mobile devices

````

## Prompt 4: Extract Common CRUD Actions

```markdown
You're an expert Next.js, TypeScript developer and architect. I need you to create a base action class to eliminate duplication in CRUD operations.

**Duplicated Files:**
- apps/web/src/lib/db/team/team.actions.ts
- apps/web/src/lib/db/user-profile/user-profile.actions.ts
- apps/web/src/lib/db/membership/membership.actions.ts

**Current Issue:**
These files contain similar CRUD patterns that are duplicated across different entities.

**Required Changes:**
1. Create a base action class at `apps/web/src/lib/db/base/base-actions.ts`
2. Extract common CRUD patterns into this base class
3. Update existing action files to extend or use the base class
4. Ensure proper TypeScript typing and error handling

**Base Class Structure:**
```typescript
export abstract class BaseActions<T, CreateInput, UpdateInput> {
  protected abstract model: any; // Prisma model

  async create(data: CreateInput): Promise<ActionState<T>> {
    // Common create logic
  }

  async update(id: string, data: UpdateInput): Promise<ActionState<T>> {
    // Common update logic
  }

  async delete(id: string): Promise<ActionState<void>> {
    // Common delete logic
  }

  async getById(id: string): Promise<ActionState<T>> {
    // Common get by id logic
  }

  async list(filters?: any): Promise<ActionState<T[]>> {
    // Common list logic
  }
}
````

**Instructions:**

1. Analyze the duplicated patterns in the action files
2. Create the BaseActions abstract class
3. Extract common validation, error handling, and database operations
4. Update existing action files to use the base class
5. Ensure all existing functionality is preserved
6. Add proper TypeScript generics for type safety

**Expected Outcome:**

- Eliminated code duplication in CRUD operations
- Consistent error handling and validation across entities
- Easier maintenance and updates to common patterns
- Proper TypeScript typing and type safety

**Testing:**

- Test all CRUD operations for teams, user profiles, and memberships
- Verify error handling works correctly
- Ensure validation logic is preserved
- Check that all existing API endpoints still function

````

## Prompt 5: Create Shared Metrics Utilities

```markdown
You're an expert Next.js, TypeScript developer and architect. I need you to create shared metrics utilities to eliminate duplication in metrics calculations.

**Duplicated Files:**
- apps/web/src/lib/db/team/team-metrics.actions.ts
- apps/web/src/lib/db/user/user-metrics.actions.ts
- apps/web/src/lib/db/organisation/organisation-metrics.actions.ts

**Current Issue:**
These files contain nearly identical metrics calculation functions that are duplicated across different entities.

**Required Changes:**
1. Create shared metrics utilities at `apps/web/src/lib/db/metrics/metrics-utils.ts`
2. Extract common metrics calculation patterns
3. Update existing metrics files to use the shared utilities
4. Ensure proper TypeScript typing and error handling

**Shared Utilities Structure:**
```typescript
export interface MetricsConfig {
  entityType: 'team' | 'user' | 'organisation';
  dateField: string;
  filters?: Record<string, any>;
}

export class MetricsUtils {
  static async calculateGrowthMetrics(config: MetricsConfig, period: string) {
    // Common growth calculation logic
  }

  static async calculateActivityMetrics(config: MetricsConfig, period: string) {
    // Common activity calculation logic
  }

  static async calculateEngagementMetrics(config: MetricsConfig, period: string) {
    // Common engagement calculation logic
  }
}
````

**Instructions:**

1. Analyze the duplicated patterns in the metrics files
2. Create the MetricsUtils class with shared calculation methods
3. Extract common date handling, aggregation, and calculation logic
4. Update existing metrics files to use the shared utilities
5. Ensure all existing functionality is preserved
6. Add proper TypeScript interfaces for configuration

**Expected Outcome:**

- Eliminated code duplication in metrics calculations
- Consistent metrics calculation logic across entities
- Easier maintenance and updates to metrics logic
- Proper TypeScript typing and error handling

**Testing:**

- Test metrics calculations for teams, users, and organisations
- Verify that all existing metrics endpoints still return correct data
- Ensure date filtering and aggregation work correctly
- Check that performance is maintained or improved

````

## Prompt 6: Fix Prettier Formatting Issues

```markdown
You're an expert Next.js, TypeScript developer and architect. I need you to fix formatting issues identified by Prettier.

**Files with Formatting Issues:**
- .dependency-cruiser.js
- .secretlintrc.json
- .vscode/settings.json
- apps/database/eslint.config.js
- apps/database/package.json
- apps/database/tsconfig.json
- apps/mail/eslint.config.js
- apps/mail/package.json
- apps/mail/tsconfig.json
- apps/web/app/[locale]/(authenticated)/admin/page.tsx
- apps/web/app/[locale]/(authenticated)/team/[id]/info/page.tsx
- apps/web/app/not-found.tsx
- apps/web/components.json
- apps/web/eslint.config.js
- apps/web/messages/en.json
- apps/web/messages/sv.json
- apps/web/package.json
- apps/web/src/components/admin/user-search.tsx
- apps/web/src/components/charts/metrics-chart.tsx
- apps/web/src/components/dialogs/edit-team-dialog.tsx
- apps/web/src/components/tables/cases-table.tsx
- apps/web/src/components/team-state-manager.tsx
- apps/web/src/lib/db/organisation/organisation-metrics.actions.ts
- apps/web/src/lib/db/team/team-metrics.actions.ts
- apps/web/src/lib/db/user/user-metrics.actions.ts
- apps/web/tsconfig.json
- knip.json
- package.json
- packages/eslint-config/base.js
- packages/eslint-config/package.json
- packages/eslint-config/react.js
- packages/tsup-config/index.js
- packages/tsup-config/package.json
- packages/typescript-config/base.json
- packages/typescript-config/nextjs.json
- packages/typescript-config/package.json
- packages/typescript-config/react-library.json
- tsconfig.json
- turbo.json

**Instructions:**
1. Run Prettier with the --write flag to fix all formatting issues
2. Review the changes to ensure they don't break functionality
3. Commit the formatting changes
4. Update any CI/CD pipelines to run Prettier checks

**Command to Run:**
```bash
pnpm prettier --write "**/*.{ts,tsx,js,jsx,json,css,scss,md}"
````

**Expected Outcome:**

- All files properly formatted according to Prettier rules
- Consistent code style across the repository
- No functional changes to the codebase
- Improved code readability

**Testing:**

- Run `pnpm build` to ensure no build errors
- Run `pnpm dev` to ensure the application starts correctly
- Verify that all functionality still works as expected
- Check that the code is more readable and consistent

````

## Prompt 7: Create Base Table Component

```markdown
You're an expert Next.js, TypeScript developer and architect. I need you to create a base table component to eliminate duplication in table implementations.

**Duplicated Files:**
- apps/web/src/components/tables/teams-table.tsx
- apps/web/src/components/tables/organisations-table.tsx
- apps/web/src/components/tables/members-table.tsx
- apps/web/src/components/tables/users-table.tsx
- apps/web/src/components/tables/cases-table.tsx

**Current Issue:**
These table components have similar structures and patterns that are duplicated across different entity types.

**Required Changes:**
1. Create a base table component at `apps/web/src/components/tables/base-table.tsx`
2. Extract common table patterns into this base component
3. Update existing table components to use the base component
4. Ensure proper TypeScript typing and accessibility

**Base Table Component Structure:**
```tsx
interface BaseTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  actions?: React.ReactNode;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function BaseTable<T>({
  data,
  columns,
  loading,
  onRowClick,
  actions,
  searchPlaceholder,
  emptyMessage
}: BaseTableProps<T>) {
  // Common table logic here
}
````

**Instructions:**

1. Analyze the duplicated patterns in the table components
2. Create the BaseTable component with common functionality
3. Extract common features like sorting, filtering, pagination
4. Update existing table components to use the base component
5. Ensure all existing functionality is preserved
6. Add proper TypeScript generics for type safety

**Expected Outcome:**

- Eliminated code duplication in table components
- Consistent table behavior across all entity types
- Easier maintenance and updates to table functionality
- Proper TypeScript typing and accessibility features

**Testing:**

- Test all table components to ensure they still work correctly
- Verify sorting, filtering, and pagination functionality
- Check that row click handlers and actions work properly
- Ensure responsive design works on mobile devices
- Test accessibility features like keyboard navigation

````

## Prompt 8: Remove Unused Dependencies

```markdown
You're an expert Next.js, TypeScript developer and architect. I need you to remove unused dependencies identified by Knip analysis.

**Unused Dependencies to Remove:**

**From apps/database/package.json:**
- @ai-sdk/react
- @faker-js/faker
- @types/uuid
- ai
- bcrypt
- uuid

**From apps/mail/package.json:**
- @types/uuid
- nodemon
- pino-pretty
- uuid

**From apps/web/package.json:**
- @ai-sdk/anthropic
- @ai-sdk/azure
- @ai-sdk/deepseek
- @ai-sdk/fireworks
- @ai-sdk/google
- @ai-sdk/groq
- @ai-sdk/openai
- @ai-sdk/react
- @ai-sdk/xai
- @azure/storage-blob
- @radix-ui/react-collapsible
- @radix-ui/react-icons
- @radix-ui/react-navigation-menu
- @radix-ui/react-progress
- @radix-ui/react-scroll-area
- @radix-ui/react-select
- @radix-ui/react-separator
- @radix-ui/react-switch
- @radix-ui/react-toggle
- @radix-ui/react-visually-hidden
- @tavily/core
- ai
- classnames
- embla-carousel-react
- react-katex
- react-markdown
- react-syntax-highlighter
- react-textarea-autosize
- rehype-external-links
- rehype-katex
- remark-gfm
- remark-math
- swr

**Instructions:**
1. Remove each unused dependency from the respective package.json files
2. Run `pnpm install` to update the lockfile
3. Test that the application still builds and runs correctly
4. Check for any runtime errors that might indicate missing dependencies
5. Update any import statements that might reference removed packages

**Expected Outcome:**
- Reduced bundle size and installation time
- Cleaner dependency tree
- Reduced security vulnerabilities from unused packages
- Faster CI/CD builds

**Testing:**
- Run `pnpm build` to ensure no build errors
- Run `pnpm dev` to ensure the application starts correctly
- Check that no console errors appear related to missing modules
- Verify that all functionality still works as expected
- Run `pnpm install` to ensure clean dependency installation
````

# 📋 CURSOR RULES

## Rule 1: Code Duplication Prevention

**Description:** Prevent code duplication by creating shared components and utilities
**Globs:** `**/*.{ts,tsx,js,jsx}`
**Guidelines:**

- Create shared components for common UI patterns
- Extract utility functions for repeated logic
- Use base classes for similar CRUD operations
- Consolidate metrics calculations into shared utilities
- Review code regularly for duplication patterns

## Rule 2: Unused Code Management

**Description:** Keep the codebase clean by removing unused code
**Globs:** `**/*.{ts,tsx,js,jsx}`
**Guidelines:**

- Remove unused files and exports regularly
- Clean up unused dependencies from package.json
- Use tools like Knip to identify dead code
- Remove unused imports and variables
- Keep component APIs minimal and focused

## Rule 3: Naming Conventions

**Description:** Maintain consistent naming conventions across the codebase
**Globs:** `**/*.{ts,tsx,js,jsx}`
**Guidelines:**

- Use camelCase for variables, functions, and object properties
- Use PascalCase for types, interfaces, and components
- Use UPPER_CASE only for true constants
- Use kebab-case for file and folder names
- Be descriptive and avoid abbreviations

## Rule 4: Code Formatting

**Description:** Maintain consistent code formatting using Prettier
**Globs:** `**/*.{ts,tsx,js,jsx,json,css,scss,md}`
**Guidelines:**

- Run Prettier before committing code
- Use consistent indentation and spacing
- Follow established formatting rules
- Configure editors to format on save
- Include Prettier in CI/CD pipelines

## Rule 5: Component Architecture

**Description:** Follow consistent component architecture patterns
**Globs:** `**/*.{ts,tsx}`
**Guidelines:**

- Create base components for common patterns
- Use composition over inheritance
- Keep components focused and single-purpose
- Extract reusable logic into custom hooks
- Use TypeScript for type safety

## Rule 6: Action Patterns

**Description:** Follow consistent patterns for server actions
**Globs:** `**/actions/**/*.{ts,tsx}`
**Guidelines:**

- Use base classes for common CRUD operations
- Implement consistent error handling
- Return ActionState<T> for all actions
- Use proper TypeScript typing
- Follow naming conventions (Action suffix)

## Rule 7: Metrics and Analytics

**Description:** Maintain consistent metrics calculation patterns
**Globs:** `**/metrics/**/*.{ts,tsx}`
**Guidelines:**

- Use shared utilities for common calculations
- Implement consistent date handling
- Follow established aggregation patterns
- Use proper TypeScript interfaces
- Document calculation methods

## Rule 8: Table Components

**Description:** Use consistent table component patterns
**Globs:** `**/tables/**/*.{ts,tsx}`
**Guidelines:**

- Use base table component for common functionality
- Implement consistent sorting and filtering
- Follow accessibility best practices
- Use proper TypeScript generics
- Maintain responsive design patterns

# 📝 GEMINI.md STRUCTURE

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
- Use tools like Knip, jscpd, and ESLint for analysis
- Identify duplication, unused code, and complexity issues
- Suggest improvements based on established patterns
  </PROTOCOL:CODE_QUALITY>

<PROTOCOL:REFACTORING>

- Implement specific refactoring tasks
- Follow agent prompts from audit reports
- Make incremental, safe changes
- Validate changes against cursor rules
- Test changes thoroughly before committing
- Document improvements and patterns
- Ensure backward compatibility
  </PROTOCOL:REFACTORING>

## PRAR Workflow

- **Perceive**: Understand the current state and requirements
- **Reason**: Analyze and plan the approach
- **Act**: Implement the solution
- **Refine**: Review and improve the implementation

## Integration

- Reference cursor rules created in .cursor/rules/
- Use established patterns from the codebase
- Follow naming conventions and architectural guidelines
- Maintain code quality standards
- Document changes and improvements
```

# 📊 SUMMARY

This comprehensive code quality audit identified significant opportunities for improvement in the numio codebase:

## Key Findings:

- **93 code clones** indicating high duplication
- **58 unused files** creating repository bloat
- **30+ unused exports** in components and actions
- **19 ESLint errors** in naming conventions
- **39 files** with formatting issues

## Priority Actions:

1. **Remove unused code** (58 files + dependencies)
2. **Consolidate duplicated patterns** (layouts, actions, metrics, tables)
3. **Fix code quality issues** (naming, formatting)
4. **Create shared components** and utilities

## Expected Impact:

- Reduced repository size and maintenance burden
- Improved code consistency and readability
- Faster builds and better performance
- Easier onboarding for new developers

The provided agent prompts provide specific, actionable instructions for implementing these improvements systematically while maintaining code quality and functionality.
