---
project_name: 'oneinbox-reviews'
user_name: 'Root'
date: '2026-01-15'
sections_completed:
  [
    'technology_stack',
    'language_rules',
    'framework_rules',
    'testing_rules',
    'quality_rules',
    'workflow_rules',
    'anti_patterns',
  ]
existing_patterns_found: 5
status: 'complete'
rule_count: 34
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- Next.js: 16.0.7
- React: 19.2.0
- TypeScript: 5.8.3
- Tailwind CSS: 4.1.12
- Auth.js / NextAuth: 4.24.13
- Drizzle ORM: 0.44.7
- Zod: 3.24.2
- SWR: 2.3.3
- Neon Postgres: 18.1 preferred (fallback to 17.x if 18.x unsupported)
- Hosting: Vercel (Vercel Cron for scheduled jobs)

## Critical Implementation Rules

### Language-Specific Rules

- TypeScript is `strict: true`; avoid `any` and use explicit types for API payloads.
- Use `@/*` import alias from `tsconfig.json` instead of deep relative paths.
- Use `async/await` for async flows; avoid mixed promise chains.
- Keep server-only code out of client components; add `"use client"` only when hooks are needed.

### Framework-Specific Rules

- App Router only; use server components by default.
- Mark client components with `"use client"` only when hooks or browser APIs are needed.
- Data fetching: RSC → route handlers; use SWR only for client-side revalidation.
- API routes live under `src/app/api/*` with REST conventions (plural).
- Use feature modules in `src/features/<feature>`; shared UI in `src/components/ui`.

### Testing Rules

- Tests are co-located as `*.test.ts` / `*.test.tsx`.
- Prefer unit tests for services and pure utils; integration tests only when needed.
- Avoid snapshot-heavy tests; focus on behavior and edge cases.

### Code Quality & Style Rules

- ESLint config is `eslint.config.mjs`; follow Next.js core-web-vitals + typescript rules.
- Naming conventions: snake_case DB, plural REST, kebab-case files, camelCase vars/functions.
- Keep code under `src/features/<feature>` and `src/lib/*` as defined in architecture.
- Avoid large client components; default to server components for performance.

### Development Workflow Rules

- Use pnpm for installs and scripts.
- Vercel auto-deploys from `main`; CI runs lint/typecheck/tests via GitHub Actions.
- Env config: `.env` locally, Vercel envs in prod; validate required vars on startup.

### Critical Don't-Miss Rules

- Do not bypass Auth.js session checks in route handlers.
- Do not access the DB directly from client components.
- Do not change naming conventions (snake_case DB, kebab-case files, plural REST).
- Do not add real-time infra; polling + cron is MVP requirement.
- Always use standardized error shape: `{ error: { code, message, details } }`.

---

## Usage Guidelines

**For AI Agents:**

- Read this file before implementing any code.
- Follow ALL rules exactly as documented.
- When in doubt, prefer the more restrictive option.
- Update this file if new patterns emerge.

**For Humans:**

- Keep this file lean and focused on agent needs.
- Update when technology stack changes.
- Review quarterly for outdated rules.
- Remove rules that become obvious over time.

Last Updated: 2026-01-15
