# Story 4.5: Draft Edit/Delete

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to save, edit, or delete unsent drafts,
so that I can manage responses before posting.

## Acceptance Criteria

1. Users can create response drafts without posting.
2. Users can edit or delete drafts.
3. Drafts are never posted until explicitly sent.

## Tasks / Subtasks

- [x] Define draft data model
  - [x] Decide how drafts are represented (status vs separate table).
  - [x] Add schema updates and migrations if needed.
- [x] Implement API handling
  - [x] Add routes for creating, updating, and deleting drafts.
  - [x] Ensure drafts are marked as unsent.
- [x] Update UI
  - [x] Add draft editor controls in review detail.
  - [x] Show draft status and actions.
- [x] Access control
  - [x] Ensure only owners can manage drafts.
- [x] Tests
  - [ ] Add co-located tests for draft workflows.
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

- Added draft status + isDraft tracking in response table.
- Draft CRUD API supports create, update, delete, and fetch.
- Draft UI enables save, update, delete, and shows last saved time.

### File List

- src/db/schema/review-responses.ts
- src/lib/validations/review-draft.schema.ts
- src/app/api/app/reviews/[id]/draft/route.ts
- src/features/inbox/review-response-form.tsx
- src/app/(in-app)/app/inbox/[id]/page.tsx
