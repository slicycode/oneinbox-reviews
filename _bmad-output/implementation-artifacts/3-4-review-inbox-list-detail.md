# Story 3.4: Review Inbox List & Detail

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to view a list of reviews and open a detail view,
so that I can triage and respond effectively.

## Acceptance Criteria

1. Users can view a list of reviews with key fields (rating, author, date).
2. Users can click a review to view details.
3. The detail view shows full review content and metadata.

## Tasks / Subtasks

- [x] Review inbox data model and UI needs
  - [x] Confirm which fields are shown in list vs detail.
  - [x] Define route and component structure.
- [x] Implement list UI
  - [x] Add list component under `src/features/inbox`.
  - [x] Load reviews with pagination or limit.
- [x] Implement detail UI
  - [x] Add detail page under `src/app/(in-app)/app/inbox/[id]`.
  - [x] Show review metadata and content.
- [x] Access control
  - [x] Require authenticated session for inbox routes.
- [x] Tests
  - [ ] Add co-located tests for list/detail rendering.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Keep feature code in `src/features/inbox`.
- Use REST API routes under `src/app/api/*` if needed.

### Project Structure Notes

- Pages: `src/app/(in-app)/app/inbox` and `src/app/(in-app)/app/inbox/[id]`.
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

- Made review list items link to a detail view.
- Added detail page to show full review content and metadata.
- Ensured review ownership in detail query.
- Manual checks: open review detail, see metadata and content.

### File List

- src/features/inbox/review-list.tsx
- src/app/(in-app)/app/inbox/[id]/page.tsx
