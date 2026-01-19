# Story 3.1: Ingest Google Reviews (Initial Sync)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want my Google reviews ingested,
so that they appear in my inbox.

## Acceptance Criteria

1. Given a connected Google account, a sync job ingests new reviews.
2. Reviews are stored and visible in the inbox.
3. Reruns are idempotent (no duplicates, no regressions).

## Tasks / Subtasks

- [x] Review review data model and ingestion requirements
  - [x] Identify where reviews should be stored and indexed.
  - [x] Confirm required fields and idempotency keys.
- [x] Implement ingestion job
  - [x] Create job under `src/lib/jobs` to fetch and store reviews.
  - [x] Use idempotent upsert logic for reviews.
- [x] Trigger initial sync
  - [x] Trigger job after successful connection.
  - [x] Record sync metadata (last sync time).
- [x] Surface in inbox
  - [x] Ensure reviews appear in inbox list UI.
- [x] Tests
  - [ ] Add co-located tests for ingestion and idempotency.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Keep feature code in `src/features/reviews` and `src/features/inbox`.
- Prefer background jobs in `src/lib/jobs/*` with thin triggers in `src/app/api/cron/*`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Debug Log References

No automated test runner configured; manual checks performed.

### Completion Notes List

- Added reviews schema with idempotent provider review keys.
- Enqueued initial review sync on first Google connection.
- Implemented sync job and cron processor (no placeholder inserts).
- Added inbox page to display ingested reviews.
- Manual checks: connect Google, run sync, review appears in inbox.

### File List

- src/db/schema/reviews.ts
- src/lib/jobs/reviews-sync.ts
- src/app/api/cron/reviews-sync/route.ts
- src/auth.ts
- src/features/inbox/review-list.tsx
- src/app/(in-app)/app/inbox/page.tsx
