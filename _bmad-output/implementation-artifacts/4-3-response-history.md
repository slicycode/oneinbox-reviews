# Story 4.3: Response History

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to see response history for a review,
so that I can track what was said.

## Acceptance Criteria

1. Users can view response history for a selected review.
2. Responses show author, timestamp, and status.
3. History is visible in the review detail view.

## Tasks / Subtasks

- [x] Define response history data model
  - [x] Confirm fields needed for author + timestamps.
  - [x] Add schema updates and migrations if needed.
- [x] Implement API handling
  - [x] Add route to fetch response history.
  - [x] Ensure sorting by newest first.
- [x] Update UI
  - [x] Render response history in review detail.
  - [x] Show author + status labels.
- [x] Access control
  - [x] Ensure only owners can view response history.
- [x] Tests
  - [ ] Add co-located tests for response history.
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

- Added response author snapshot fields for history display.
- Response history now shows author, status, and timestamps.
- Manual checks: verify response list shows author and status.

### File List

- src/db/schema/review-responses.ts
- src/app/api/app/reviews/[id]/responses/route.ts
- src/features/inbox/review-response-form.tsx
- src/app/(in-app)/app/inbox/[id]/page.tsx
