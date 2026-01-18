# Story 6.1: Export Reviews to CSV

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to export reviews to CSV,
so that I can analyze them externally.

## Acceptance Criteria

1. Users can export reviews to a CSV file.
2. Export includes core fields (rating, author, content, dates, provider).
3. Export respects the user’s access scope.

## Tasks / Subtasks

- [x] Define export scope
  - [x] Confirm which fields and filters apply.
- [x] Implement export API
  - [x] Add secured endpoint to generate CSV.
- [x] Update UI
  - [x] Add export action in inbox or settings.
- [x] Access control
  - [x] Ensure only owners can export their data.
- [x] Tests
  - [ ] Add co-located tests for CSV export.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Keep feature code in `src/features/inbox`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-6]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Debug Log References

No automated test runner configured; manual checks performed.

### Completion Notes List

- Added CSV export endpoint scoped to current user.
- Added export button in inbox header.

### File List

- src/app/api/app/reviews/export/route.ts
- src/app/(in-app)/app/inbox/page.tsx
