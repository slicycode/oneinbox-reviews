# OneInbox Reviews

SaaS platform for Google Business Profile review management with DodoPayments subscriptions.

## Commands

```bash
# Development
pnpm run dev              # Start dev server (port 3000)
pnpm run build            # Production build
pnpm run type-check       # TypeScript validation (run after major changes)
pnpm run lint             # ESLint check

# Database
pnpm run db:generate      # Generate Drizzle migrations
pnpm run db:migrate       # Apply migrations
pnpm run db:studio        # Open Drizzle Studio GUI

# Testing
pnpm run test             # Run Vitest
pnpm run test:watch       # Watch mode
```

## Tech Stack

- **Next.js 16** (App Router) - Server components by default, `'use client'` only when needed
- **Drizzle ORM** + PostgreSQL - Type-safe queries, snake_case columns
- **NextAuth.js** - Google OAuth, session in `auth()` helper
- **DodoPayments** - Subscription billing (not Stripe)
- **Tailwind + shadcn/ui** - Component library in `src/components/ui`

## Architecture Decisions

**Why App Router?** Server components reduce client bundle. Use `'use client'` only for interactivity (forms, state, hooks).

**Why Drizzle?** Type-safe SQL without ORM overhead. Migrations are explicit and reviewable.

**Why DodoPayments?** Better rates for SaaS, simpler API than Stripe for subscriptions.

## Key Patterns

### API Routes
- `src/app/api/app/*` - Authenticated user APIs (check session first)
- `src/app/api/public/*` - Unauthenticated APIs
- `src/app/api/webhooks/*` - External service callbacks
- `src/app/api/super-admin/*` - Admin-only operations

### Page Structure
- `(website-layout)/*` - Public marketing pages
- `(in-app)/app/*` - Authenticated dashboard (sidebar layout)
- `(auth)/*` - Sign in/up pages

### Data Flow
```
Component → Server Action or API Route → Service (src/lib/*) → Drizzle → DB
```

## Performance Rules

1. **No async waterfalls** - Parallelize independent DB calls with `Promise.all()`
2. **Prefer Server Components** - Move data fetching to server, pass props down
3. **Lazy load heavy components** - Use `dynamic()` for charts, editors, modals
4. **Avoid prop drilling** - Use context only when truly needed, prefer composition

## Plan Mode

When planning features or fixes, follow this loop: **Plan → Execute → Test → Commit**

### Plan Rules
- Make plans extremely concise. Sacrifice grammar for concision.
- Use bullet points, not paragraphs.
- List files to modify with one-line descriptions.
- End with unresolved questions, if any.

### Plan Format
```md
## Goal
[One sentence]

## Changes
- `path/to/file.ts` - what changes
- `path/to/other.ts` - what changes

## Steps
1. First action
2. Second action
3. Verify with `pnpm run type-check`

## Questions
- Any unresolved decisions?
```

### When to Plan
- New features (always)
- Multi-file changes (always)
- Bug fixes affecting >2 files (recommended)
- Simple single-file fixes (skip, just do it)

### Plan Storage
- Write complex plans to `PLAN.md` (gitignored)
- Plans persist across `/clear` for context recovery

## References

- File patterns: [docs/CONVENTIONS.md](docs/CONVENTIONS.md)
- Development workflow: [docs/WORKFLOW.md](docs/WORKFLOW.md)
- Performance rules: [AGENTS.md](AGENTS.md)
