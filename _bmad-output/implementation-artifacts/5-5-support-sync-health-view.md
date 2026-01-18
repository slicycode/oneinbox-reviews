# Story 5.5: Support Sync Health View

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a support agent,
I want to view sync health for customer accounts,
so that I can diagnose issues quickly.

## Acceptance Criteria

1. Support can view sync status per account and provider.
2. View includes last success, last attempt, and error info.
3. Access is restricted to support/admin roles.

## Tasks / Subtasks

- [x] Define support view data requirements
  - [x] Confirm fields to display for sync health.
- [x] Implement API handling
  - [x] Add secured endpoint for sync health data.
- [x] Build support UI
  - [x] Add admin/support page to list sync health entries.
  - [x] Include search/filter by account/provider.
- [x] Access control
  - [x] Enforce support/admin role access.
- [x] Tests
  - [ ] Add co-located tests for access control and data shape.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Keep feature code in `src/features/support`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-5]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Debug Log References

No automated test runner configured; manual checks performed.

### Completion Notes List

- Added super-admin API endpoint for sync health data.
- Added support view with filters for email, provider, and status.
- Manual checks: verify access is restricted to super admins.

### File List

- src/app/api/super-admin/sync-health/route.ts
- src/app/(in-app)/app/super-admin/sync-health/page.tsx
- src/features/support/sync-health-filters.tsx
- src/features/support/sync-health-table.tsx
