# OneInbox Reviews - Claude Code Instructions

## Project Overview

OneInbox Reviews is a SaaS platform for managing Google Business Profile reviews. It uses DodoPayments for subscriptions with Free and Starter tiers.

## File Patterns

- **Database Schemas:** `src/db/schema/*.ts`
- **Services/Logic:** `src/lib/<feature>/*.ts`
- **API Routes:** `src/app/api/app/<resource>/route.ts`
- **UI Components:** `src/components/ui/*.tsx`
- **Feature Components:** `src/features/<feature>/*.tsx`
- **Pages:** `src/app/(in-app)/app/**/*.tsx`

## Naming Conventions

- Database columns: `snake_case`
- File names: `kebab-case`
- Functions/variables: `camelCase`
- React components: `PascalCase`
- REST endpoints: plural nouns (`/reviews`, `/subscriptions`)

## Key Technical Details

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL with Drizzle ORM
- **Auth:** NextAuth.js with Google OAuth
- **Payments:** DodoPayments
- **Styling:** Tailwind CSS + shadcn/ui

## Task Management

Tasks are tracked in Linear. When working on features:
1. Check Linear for assigned tasks
2. Create feature branches from `main`
3. Use conventional commits: `feat:`, `fix:`, `chore:`

## Important Files

- `src/lib/plans/config.ts` - Plan definitions and limits
- `src/lib/subscriptions/access-control.ts` - Feature gating logic
- `src/db/schema/` - All database schemas
