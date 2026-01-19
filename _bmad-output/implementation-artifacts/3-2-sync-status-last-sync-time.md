# Story 3.2: Sync Status & Last Sync Time

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to see sync status and the last sync time,
so that I know when my reviews were last updated.

## Acceptance Criteria

1. Users can view current sync status (active/failed/stale).
2. Users can see last successful sync time.

## Tasks / Subtasks

- [x] Define sync status rules
  - [x] Decide how status is computed from sync job data.
  - [x] Identify where last sync time should be stored.
- [x] Persist sync metadata
  - [x] Add fields for sync status and last sync time.
  - [x] Update on successful and failed sync runs.
- [x] Surface in UI
  - [x] Display status and last sync time on inbox or integrations view.
- [x] Access control
  - [x] Require authenticated session for sync status endpoints.
- [x] Tests
  - [ ] Add co-located tests for status logic and UI rendering.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Use `withAuthRequired` for authenticated API routes.
- Keep feature code in `src/features/inbox` or `src/features/integrations`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3]
- [Source: _bmad-output/planning-artifacts/architecture.md#API--Communication-Patterns]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Debug Log References

No automated test runner configured; manual checks performed.

### Completion Notes List

- Added review sync status table to track last sync and errors per provider.
- Updated sync jobs to persist status/last success and error states.
- Inbox now displays sync status and last sync time.
- Manual checks: run sync, status shows active and last sync updates.

### File List

- src/db/schema/review-sync-status.ts
- src/lib/jobs/reviews-sync.ts
- src/app/(in-app)/app/inbox/page.tsx
