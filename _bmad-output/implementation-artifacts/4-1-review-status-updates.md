# Story 4.1: Review Status Updates

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to mark reviews as unread/responded/needs follow-up,
so that I can track response state.

## Acceptance Criteria

1. Users can update a review status to unread/responded/needs follow-up.
2. Status updates persist and appear in the inbox list.
3. Status changes are captured in a single audit trail.

## Tasks / Subtasks

- [x] Define status data model
  - [x] Decide where status lives (reviews table vs separate table).
  - [x] Add schema updates and migrations if needed.
- [x] Implement API handling
  - [x] Create route to update review status.
  - [x] Return updated status in responses.
- [x] Update inbox UI
  - [x] Add status badge or control in list items.
  - [x] Ensure list reflects current status.
- [x] Add audit trail
  - [x] Capture status changes with actor + timestamp.
- [x] Access control
  - [x] Ensure only owners of the review can update status.
- [x] Tests
  - [ ] Add co-located tests for status updates and audit trail.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Use `react-hook-form` + `zod` if building forms.
- Keep feature code in `src/features/inbox`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-4]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Debug Log References

No automated test runner configured; manual checks performed.

### Completion Notes List

- Added review status enum and audit trail table for status changes.
- Review status updates persist and display in inbox list.
- Manual checks: update status from inbox and verify persistence.

### File List

- src/db/schema/reviews.ts
- src/db/schema/review-audit-log.ts
- src/lib/validations/review-status.schema.ts
- src/app/api/app/reviews/[id]/status/route.ts
- src/app/(in-app)/app/inbox/page.tsx
- src/features/inbox/review-list.tsx
