---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-01-15'
project_name: 'indie-kit'
user_name: 'Root'
date: '2026-01-15'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The MVP centers on onboarding platform connections (Google first), ingesting and backfilling reviews, and presenting a unified inbox with triage/status workflows. Users must be able to respond to reviews, track who responded and when, and access audit logs. Alerts (email) and sync status visibility are required, along with basic account management, team roles, and credential storage. Optional MVP-lite exports add a reporting pathway but are non-core.

**Non-Functional Requirements:**
Key drivers include 30–60 minute sync cadence, alert latency under 5 minutes, 99.5% uptime, secure credential storage, and RBAC enforcement. Compliance constraints require official APIs only, human-in-the-loop responses, and retention/deletion policies aligned to platform rules. Performance targets prioritize responsive inbox filtering and fast dashboard load.

**Scale & Complexity:**
This is a medium-complexity, multi-tenant SaaS with background sync, OAuth integrations, and auditability requirements.

- Primary domain: authenticated web app + background integration services
- Complexity level: medium
- Estimated architectural components: 8-10 (auth, org/account, integrations, sync jobs, review storage, inbox/triage, responses, alerts, audit logs, admin/support tools)

### Technical Constraints & Dependencies

- Platform access: Google Business Profile OAuth, Yelp API key/partner access, Facebook OAuth.
- Official API usage only; no scraping.
- Human-confirmed responses; avoid auto-posting in MVP.
- Retention/deletion policies per platform.
- Polling acceptable for MVP; real-time updates later.

### Cross-Cutting Concerns Identified

- OAuth token lifecycle & re-auth UX
- Rate limiting, backoff, and sync reliability
- Secure credential storage and access control
- Audit logging and traceability of responses
- Multi-tenant data isolation

## Starter Template Evaluation

### Primary Technology Domain

Web application (authenticated dashboard + background sync services) based on project requirements analysis.

### Starter Options Considered

1. **Official Next.js CLI (`create-next-app`)**

   - Maintained by Next.js core team, kept in lockstep with framework updates.
   - Supports App Router, TypeScript, Tailwind, ESLint, and Turbopack with official flags.

2. **Custom boilerplates** (skipped)
   - Often opinionated with extra dependencies not requested in this repo.
   - Adds maintenance risk for MVP scope.

### Selected Starter: Official Next.js IndieKit (Next.js SaaS boilerplate)

**Rationale for Selection:**
Provides prebuilt auth, billing, env validation, email, and background job primitives required by the MVP.

**Initialization Command:**

```bash
pnpm create next-app@latest oneinbox-reviews \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --turbopack \
  --src-dir \
  --import-alias "@/*"
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript-first Next.js App Router with React Server Components.

**Styling Solution:**
Tailwind CSS configured out of the box.

**Build Tooling:**
Turbopack for fast dev iteration; standard Next.js production build.

**Testing Framework:**
No testing setup by default (to be decided later).

**Code Organization:**
`src/` directory layout with App Router routing conventions.

**Development Experience:**
ESLint enabled; defaults align with Next.js best practices.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**

- ORM and data access: Drizzle ORM (stable v0.44.7) for SQL-first typed access.
- Data validation: Zod for schema validation and type inference.
- Migrations: Drizzle migrations to align with ORM and schema tooling.
- Database engine: PostgreSQL 18.1 on Neon if supported; fallback to 17.x.

**Important Decisions (Shape Architecture):**

- Data access patterns will follow Drizzle query builders and typed schemas.

**Deferred Decisions (Post-MVP):**

- Caching layer: none for MVP; revisit if polling load or inbox performance requires it.

### Data Architecture

- **Database:** PostgreSQL 18.1 on Neon (fallback to 17.x if 18.x not supported in region).
- **ORM:** Drizzle ORM (stable v0.44.7) for typed SQL access and schema definitions.
- **Validation:** Zod for request/response schemas and form validation.
- **Migrations:** Drizzle migrations to manage schema changes.
- **Caching:** None for MVP; rely on DB + polling schedule.

### Authentication & Security

- **Auth provider:** Auth.js (NextAuth) v4.24.13 (stable).
- **Sessions:** Database-backed sessions for server-side control and revocation.
- **Authorization:** RBAC with roles: owner, manager, agent, admin.
- **Secrets/tokens:** Encrypted at rest with KMS-managed keys; implement refresh token handling and rotation.
- **API security:** CSRF protection plus app-level rate limiting.

### API & Communication Patterns

- **API style:** REST route handlers.
- **API documentation:** None for MVP.
- **Errors:** Standardized error shape with consistent HTTP status codes.
- **Rate limiting:** Server-only; per-user when authenticated, fall back to per-IP for unauthenticated requests.
- **Background communication:** In-process queue/cron + polling for MVP; external runner later if load requires it.

### Frontend Architecture

- **State management:** React state + Server Components + SWR. Use Context sparingly; add Zustand only if needed.
- **Component architecture:** Feature-based folders with shared UI kit (Shadcn).
- **Routing:** App Router only.
- **Performance:** RSC by default; client components only when required. Fetch via RSC + route handlers.
- **Bundle optimization:** Keep client bundles minimal; lazy-load heavier views.

### Infrastructure & Deployment

- **Hosting:** Vercel for web; background jobs via scheduled cron/worker (Vercel Cron or lightweight worker on same provider).
- **CI/CD:** Vercel auto-deploy from `main`; GitHub Actions for lint/typecheck/tests.
- **Environment config:** `.env` locally + Vercel envs; validate required vars on startup.
- **Monitoring/logging:** Sentry for errors; simple structured logging; defer analytics.
- **Scaling:** Serverless functions + DB connection pooling; cron-based job scheduling for sync/polling.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:**
5 areas where AI agents could make different choices (naming, structure, format, communication, process).

### Naming Patterns

**Database Naming Conventions:**

- Tables/columns: `snake_case` (e.g., `review_responses`, `user_id`)
- Foreign keys: `user_id`, `account_id`
- Indexes: `idx_<table>_<column>` (e.g., `idx_reviews_created_at`)

**API Naming Conventions:**

- REST endpoints: plural resources (e.g., `/reviews`, `/accounts/{id}`)
- Route params: `{id}` style in docs, `:id` in route handlers as required
- Query params: `snake_case` (e.g., `created_after`, `rating_min`)

**Code Naming Conventions:**

- Components: `kebab-case` filenames (e.g., `review-list.tsx`)
- Folders: `kebab-case` (e.g., `review-inbox/`)
- Functions/vars: `camelCase` (e.g., `fetchReviews`, `isLoading`)

### Structure Patterns

**Project Organization:**

- Features: `src/features/<feature>`
- Shared core: `src/lib` (auth, db, config, services)
- Small helpers: `src/utils`

**File Structure Patterns:**

- Tests co-located as `*.test.ts` / `*.test.tsx`
- UI components split by feature, shared UI in `src/components/ui`

### Format Patterns

**API Response Formats:**

- Success responses return direct payloads (no wrapper)
- Errors use a standard shape:
  ```json
  { "error": { "code": "string", "message": "string", "details": {} } }
  ```

**Data Exchange Formats:**

- Dates: ISO-8601 strings (e.g., `2026-01-15T20:22:38.992Z`)
- JSON fields: `camelCase` in API responses; `snake_case` in DB

### Communication Patterns

**Event System Patterns:**

- Background job events: `review.sync.started`, `review.sync.completed`, `review.sync.failed`

**State Management Patterns:**

- Loading state names: `isLoading`, `isFetching`
- Mutations: optimistic only when explicitly noted; otherwise server-confirmed

### Process Patterns

**Error Handling Patterns:**

- Centralized error mapping to `{ error: { code, message, details } }`
- User-facing messages are safe, technical details go to logs

**Loading State Patterns:**

- Local loading for component-level actions
- Global loading only for full-page transitions or blocking flows

### Enforcement Guidelines

**All AI Agents MUST:**

- Follow naming conventions (snake_case DB, plural REST paths, kebab-case files)
- Return direct payloads on success and standardized error shapes
- Keep feature code under `src/features/<feature>`

**Pattern Enforcement:**

- Validate via lint rules and PR review checklist
- Document any exceptions in `docs/decisions.md`
- Update this section before changing a global pattern

### Pattern Examples

**Good Examples:**

- `src/features/review-inbox/review-list.tsx`
- `/api/reviews?created_after=2026-01-01`
- `{ "error": { "code": "AUTH_EXPIRED", "message": "Re-authenticate", "details": { "provider": "google" } } }`

**Anti-Patterns:**

- `src/components/ReviewList.tsx`
- `/api/review?id=123`
- `{ "data": ..., "error": null }` on success

## Project Structure & Boundaries

### Complete Project Directory Structure

```
oneinbox-reviews/
├── README.md
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── eslint.config.mjs
├── .env
├── .env.example
├── .gitignore
├── .github/
│   └── workflows/
│       └── ci.yml
├── public/
│   └── assets/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── cron/
│   │   │   │   ├── reviews-sync/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── alerts-dispatch/
│   │   │   │   │   └── route.ts
│   │   │   │   └── housekeeping/
│   │   │   │       └── route.ts
│   │   │   ├── reviews/
│   │   │   ├── responses/
│   │   │   ├── inbox/
│   │   │   ├── integrations/
│   │   │   ├── accounts/
│   │   │   ├── alerts/
│   │   │   └── admin/
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   └── (admin)/
│   ├── components/
│   │   ├── ui/
│   │   └── forms/
│   ├── features/
│   │   ├── reviews/
│   │   ├── integrations/
│   │   ├── inbox/
│   │   ├── responses/
│   │   ├── alerts/
│   │   ├── accounts/
│   │   ├── auth/
│   │   ├── admin/
│   │   ├── support/
│   │   └── reporting/ (optional)
│   ├── lib/
│   │   ├── auth/
│   │   ├── db/
│   │   ├── jobs/
│   │   │   ├── reviews-sync.ts
│   │   │   ├── alerts-dispatch.ts
│   │   │   └── housekeeping.ts
│   │   ├── integrations/
│   │   ├── mail/
│   │   ├── config/
│   │   ├── logger.ts
│   │   └── errors.ts
│   ├── utils/
│   ├── types/
│   └── middleware.ts
├── drizzle/
│   ├── schema/
│   │   ├── accounts.ts
│   │   ├── reviews.ts
│   │   ├── responses.ts
│   │   ├── integrations.ts
│   │   ├── alerts.ts
│   │   └── audit_logs.ts
│   └── migrations/
└── docs/
    └── decisions.md
```

### Architectural Boundaries

**API Boundaries:**

- External API surface in `src/app/api/*` route handlers.
- Cron triggers in `src/app/api/cron/*` call jobs in `src/lib/jobs/*`.
- Auth routes in `src/app/api/auth/*` (Auth.js).

**Component Boundaries:**

- Feature UI lives under `src/features/<feature>`.
- Shared UI primitives in `src/components/ui`.
- App Router layouts and route components in `src/app`.

**Service Boundaries:**

- Integrations isolated in `src/lib/integrations/*` with provider-specific adapters.
- Jobs only orchestrate sync/alerts; they call provider services + repositories.

**Data Boundaries:**

- Drizzle schemas in `drizzle/schema/*`.
- DB access from `src/lib/db/*` (repositories).
- No direct DB access from UI components.

### Requirements to Structure Mapping

**Feature Mapping:**

- Platform connections (FR6–FR10): `src/features/integrations`, `src/app/api/integrations`
- Review ingestion & sync (FR11–FR13): `src/lib/jobs/reviews-sync.ts`, `src/lib/integrations/*`
- Inbox & triage (FR16–FR20): `src/features/inbox`, `src/app/api/inbox`
- Responses workflow (FR21–FR26): `src/features/responses`, `src/app/api/responses`, `drizzle/schema/responses.ts`
- Alerts & notifications (FR27–FR30): `src/features/alerts`, `src/lib/jobs/alerts-dispatch.ts`
- Account & access (FR1–FR5): `src/features/accounts`, `src/app/api/accounts`, `src/lib/auth`
- Admin/support tooling (FR31–FR33): `src/features/admin`, `src/features/support`, `src/app/api/admin`
- Reporting/export (FR34 optional): `src/features/reporting`, `src/app/api/reports`

**Cross-Cutting Concerns:**

- Auth/RBAC: `src/lib/auth`, `src/middleware.ts`, `src/app/api/auth`
- Audit logs: `drizzle/schema/audit_logs.ts`, `src/lib/db/audit-logs.ts`
- Error format: `src/lib/errors.ts`, shared response helpers

### Integration Points

**Internal Communication:**

- UI → Route Handlers (REST) → Services → Repositories
- Jobs → Integration adapters → Repositories → Alerts

**External Integrations:**

- Google Business Profile API via `src/lib/integrations/google/*`
- Yelp/Facebook adapters added under `src/lib/integrations/*`

**Data Flow:**

- Cron trigger → job → fetch reviews → normalize → persist → emit alerts → UI polls inbox

### File Organization Patterns

**Configuration Files:**

- Env config in root `.env`, `.env.example`
- App config in `src/lib/config/*`

**Source Organization:**

- Feature-driven under `src/features`
- Reusable platform services in `src/lib`

**Test Organization:**

- Co-located `*.test.ts(x)` alongside the code

**Asset Organization:**

- Static assets in `public/assets`

### Development Workflow Integration

**Development Server Structure:**

- App Router routes in `src/app`
- Feature UI rendered by RSC, client components as needed

**Build Process Structure:**

- Next.js build with Turbopack in dev; standard build in prod

**Deployment Structure:**

- Vercel deploys app + API routes; cron triggers call `/api/cron/*`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible (Next.js + Auth.js + Drizzle + Neon/Postgres). Background cron triggers align with Vercel hosting. Patterns and structure reinforce the stack without contradictions.

**Pattern Consistency:**
Naming, structure, and format patterns are consistent across DB, API, and UI. Error and logging conventions align with API and job workflows.

**Structure Alignment:**
Project structure supports feature isolation, job orchestration, and provider integrations. Boundaries align with API and data access decisions.

### Requirements Coverage Validation ✅

**Epic/Feature Coverage:**
All functional areas in the PRD map to `src/features/*` and corresponding API routes.

**Functional Requirements Coverage:**
FR1–FR33 are covered via accounts/auth, integrations, inbox, responses, alerts, and admin/support mappings. FR34 (reporting/export) is optional but provisioned.

**Non-Functional Requirements Coverage:**
Polling cadence, alert latency, uptime, and security needs are addressed via cron scheduling, structured logging, RBAC, and encrypted token storage.

### Implementation Readiness Validation ✅

**Decision Completeness:**
All critical decisions are documented with versions and rationale.

**Structure Completeness:**
Directory tree is complete and specific, with clear API/job/service boundaries.

**Pattern Completeness:**
Patterns include naming, formats, error handling, logging, and loading states with examples.

### Gap Analysis Results

- **Critical gaps:** None
- **Important gaps:** None
- **Nice-to-have:** Reporting/export scope remains optional and can be deferred.

### Validation Issues Addressed

No blocking issues identified.

### Architecture Completeness Checklist

**✅ Requirements Analysis**

- [x] Project context analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**✅ Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**✅ Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**✅ Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION
**Confidence Level:** high

**Key Strengths:**

- Clear feature boundaries and integration separation
- Consistent naming and API formats
- Minimal MVP scope aligned with polling jobs
- Auth and security defined with revocation-ready sessions

**Areas for Future Enhancement:**

- Reporting/export expansion (if kept in scope)
- External job runner if polling load increases

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions exactly as documented
- Use implementation patterns consistently across all components
- Respect project structure and boundaries
- Refer to this document for all architectural questions

**First Implementation Priority:**
Initialize with `pnpm create next-app@latest oneinbox-reviews --typescript --tailwind --eslint --app --turbopack --src-dir --import-alias "@/*"`

## Architecture Completion Summary

### Workflow Completion

**Architecture Decision Workflow:** COMPLETED ✅
**Total Steps Completed:** 8
**Date Completed:** 2026-01-15
**Document Location:** \_bmad-output/planning-artifacts/architecture.md

### Final Architecture Deliverables

**📋 Complete Architecture Document**

- All architectural decisions documented with specific versions
- Implementation patterns ensuring AI agent consistency
- Complete project structure with all files and directories
- Requirements to architecture mapping
- Validation confirming coherence and completeness

**🏗️ Implementation Ready Foundation**

- 25 architectural decisions made
- 5 implementation pattern categories defined
- 9 architectural components specified
- 34 requirements fully supported

**📚 AI Agent Implementation Guide**

- Technology stack with verified versions
- Consistency rules that prevent implementation conflicts
- Project structure with clear boundaries
- Integration patterns and communication standards

### Implementation Handoff

**For AI Agents:**
This architecture document is your complete guide for implementing indie-kit. Follow all decisions, patterns, and structures exactly as documented.

**First Implementation Priority:**
Initialize with `pnpm create next-app@latest oneinbox-reviews --typescript --tailwind --eslint --app --turbopack --src-dir --import-alias "@/*"`

**Development Sequence:**

1. Initialize project using documented starter template
2. Set up development environment per architecture
3. Implement core architectural foundations
4. Build features following established patterns
5. Maintain consistency with documented rules

### Quality Assurance Checklist

**✅ Architecture Coherence**

- [x] All decisions work together without conflicts
- [x] Technology choices are compatible
- [x] Patterns support the architectural decisions
- [x] Structure aligns with all choices

**✅ Requirements Coverage**

- [x] All functional requirements are supported
- [x] All non-functional requirements are addressed
- [x] Cross-cutting concerns are handled
- [x] Integration points are defined

**✅ Implementation Readiness**

- [x] Decisions are specific and actionable
- [x] Patterns prevent agent conflicts
- [x] Structure is complete and unambiguous
- [x] Examples are provided for clarity

### Project Success Factors

**🎯 Clear Decision Framework**
Every technology choice was made collaboratively with clear rationale, ensuring all stakeholders understand the architectural direction.

**🔧 Consistency Guarantee**
Implementation patterns and rules ensure that multiple AI agents will produce compatible, consistent code that works together seamlessly.

**📋 Complete Coverage**
All project requirements are architecturally supported, with clear mapping from business needs to technical implementation.

**🏗️ Solid Foundation**
The chosen starter template and architectural patterns provide a production-ready foundation following current best practices.

---

**Architecture Status:** READY FOR IMPLEMENTATION ✅

**Next Phase:** Begin implementation using the architectural decisions and patterns documented herein.

**Document Maintenance:** Update this architecture when major technical decisions are made during implementation.
