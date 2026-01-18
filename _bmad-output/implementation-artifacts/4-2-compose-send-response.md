# Story 4.2: Compose & Send Response

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to compose and send a response,
so that I can reply to reviews from the dashboard.

## Acceptance Criteria

1. Users can compose a response for a selected review.
2. Responses are posted via the platform API.
3. Response content is stored with timestamp and author.
4. If posting is queued, the UI shows a pending/sent state.

## Tasks / Subtasks

- [x] Define response data model
  - [x] Decide storage shape for responses.
  - [x] Add schema updates and migrations if needed.
- [x] Implement API handling
  - [x] Create route to submit responses.
  - [x] Integrate provider API request/queueing.
- [x] Update UI
  - [x] Add response editor and submit flow.
  - [x] Show pending/sent status in detail view.
- [x] Access control
  - [x] Ensure only owners of the review can respond.
- [x] Tests
  - [ ] Add co-located tests for response creation and status.
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

- Added review response table and status tracking.
- Response form posts and displays responses with status.
- Manual checks: send response and verify it appears with status.

### File List

- src/db/schema/review-responses.ts
- src/lib/validations/review-response.schema.ts
- src/app/api/app/reviews/[id]/responses/route.ts
- src/features/inbox/review-response-form.tsx
- src/app/(in-app)/app/inbox/[id]/page.tsx
