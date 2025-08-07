# Numio AI Monorepo Overview

This repository is a **Turborepo monorepo** that organizes multiple applications and packages for the Numio AI platform. The main apps are:

- **@numio/web**: A Next.js 15 application (App Router) for the main web frontend. This app must follow all Next.js-specific rules and best practices described below, including the use of Server Actions, SWR, Tailwind CSS, shadcn/ui, and strict type safety.
- **@numio/database**: Contains the Prisma ORM schema, migrations, and database utilities. This package is also bundled with TSUP for efficient builds and type-safe usage across the monorepo.

## Monorepo Structure

- Managed with **Turborepo** for fast, cacheable builds and isolated pipelines.
- Each app/package lives in its own directory under `/apps` or `/packages`.
- Shared code and types are organized for maximum reusability and type safety.

## Build & Bundling

- **@numio/web**: Built and served with Next.js (see Next.js rules below).
- **@numio/database**: Bundled using [TSUP](https://tsup.egoist.dev/) for fast, modern TypeScript builds.

## App-Specific Rules

### @numio/web (Next.js)

- Must follow all Next.js-specific rules described in this file:
  - Use Server Actions for mutations, SWR for client data fetching, and GET API routes for SWR endpoints.
  - Use Tailwind CSS and shadcn/ui for styling and UI components.
  - Use strict type safety, Zod schemas, and avoid any/unsafe casts.
  - Organize code by feature and use kebab-case for files/folders.
  - See the detailed rules and examples below for more.

### @numio/database

- Contains the Prisma schema, migrations, and database utilities.
- Bundled with TSUP for type-safe usage in other apps.
- Exports the Prisma client and types for use in @numio/web.

## Docker Setup

The `docker` directory contains the necessary files to run the application in a containerized environment. The `docker-compose.yml` file defines the services, networks, and volumes for the application. The `Dockerfile` contains the instructions to build the Docker image for the application. The `init.sh` script is used to initialize the database.

# General instructions

You are an expert full-stack developer proficient in TypeScript, React, Next.js (app directory, Server Actions, SSR), Tailwind CSS, shadcn/ui, Prisma ORM (PostgreSQL), Zod, Turborepo, Stripe Billing, Auth.js, useSWR, i18next/react-i18next, and the App Router. Always use pnpm for package management.

Context:
• Next.js App Router with Server Actions and SSR.  
• Tailwind CSS utility-first styling and shadcn/ui components installed via pnpm (see https://ui.shadcn.com/docs/installation).  
• Prisma ORM connected to PostgreSQL (datasource provider = "postgresql"; url from env).  
• Zod v4 schemas for validation and type inference.  
• Turborepo for monorepo architecture (apps/ and packages/ directories, remote caching, pipeline configuration).  
• Stripe Billing subscription and usage models with webhooks and customer portal.  
• Auth.js for authentication flows with Prisma adapter.  
• useSWR for client-side data fetching and revalidation.  
• i18next/react-i18next for fully localized UI (text strings fetched via Prisma).  
• Storybook added as its own app under apps/storybook, with stories for each component.

- all components in the UI library (packages/ui) should have, at a minimum, the following structure "my-component/my-component.tsx", "my-component/my-component.stories.tsx"

Task:
When given a feature request or UI spec, generate:

1. A Next.js Server Component or Server Action for data loading/mutations.
2. A React UI component with Tailwind + shadcn/ui, following a mobile-first, responsive design.
3. A Storybook story in the `apps/storybook` app that demonstrates the component.
4. Zod schema definitions and type-safe parsing in TS interfaces.
5. Prisma client queries/mutations (arrow functions, named exports).
6. useSWR hooks for runtime data fetching or revalidation.
7. Auth.js config and route handlers for authentication flows.
8. Stripe integration: Checkout sessions, webhook handlers, subscription sync.
9. i18next setup: server-side loading of translation strings via Prisma, React hooks for localization.
10. Monorepo configs: turbo.json pipeline, package isolation, plus the new `apps/storybook` entry.
11. Unit/integration tests with appropriate frameworks (e.g. Vitest).

Constraints:

- Always write concise, technically accurate TS code using arrow functions—no classes
- Use functional/declarative patterns; modularize to avoid duplication.
- Descriptive variable names with auxiliary verbs (`isLoading`, `hasError`).
- File structure: components/, hooks/, lib/, types/, styles/; lowercase-dash directory names.
- Interfaces for object shapes; avoid enums (use literal types or maps).
- Early-return guard clauses for errors; use custom error types and i18n for messages.
- Dynamic imports and Next.js `<Image>` for performance; use lazy loading for non-critical UI.
- Auth.js with Prisma adapter in auth.ts; secure route handlers.
- Stripe Customer Portal and webhooks with robust error handling.
- Storybook stories live in `apps/storybook/src/stories`, using named exports.
- Adhere to official docs for each tech and limit prompts to ~4,000 characters.
- Don't use the React namespace. "React.useEffect()" is bad and "useEffect()" is good.

Example Invocation:
"Build an auth-protected subscription dashboard that loads user data server-side, displays it with shadcn/ui components, lets users upgrade via Stripe Checkout, revalidates with useSWR, and ships a Storybook story under the `storybook` app."
