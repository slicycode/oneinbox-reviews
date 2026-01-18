# Story 3.5: Filtering & Search

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to filter and search reviews,
so that I can find the right items quickly.

## Acceptance Criteria

1. Users can filter reviews by rating and date range.
2. Users can search reviews by keyword.
3. Filters and search update the list without full page reload.

## Tasks / Subtasks

- [x] Define filter/search schema
  - [x] Decide supported filters and query params.
  - [x] Define validation schema for filters.
- [x] Implement API/query handling
  - [x] Update reviews query to accept filters and search.
  - [x] Ensure pagination/limit works with filters.
- [x] Implement UI controls
  - [x] Add filter controls in inbox.
  - [x] Add search input with debounced updates.
- [x] Access control
  - [x] Require authenticated session for filtered queries.
- [x] Tests
  - [ ] Add co-located tests for filter/search behavior.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Use `react-hook-form` + `zod` if building forms.
- Keep feature code in `src/features/inbox`.

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

- Added review filter schema for rating, date range, and keyword search.
- Inbox now supports filtering and search via query params without reload.
- Manual checks: apply filters and search updates list.

### File List

- src/lib/validations/review-filters.schema.ts
- src/features/inbox/review-filters.tsx
- src/app/(in-app)/app/inbox/page.tsx
