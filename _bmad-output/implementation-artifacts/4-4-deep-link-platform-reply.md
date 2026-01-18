# Story 4.4: Deep-Link to Platform Reply

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want a deep link to the platform reply screen,
so that I can reply natively when needed.

## Acceptance Criteria

1. Users can access a platform reply link from review details.
2. The link opens the correct platform reply URL in a new tab.
3. The link is shown only when a reply URL is available.

## Tasks / Subtasks

- [x] Define reply link source
  - [x] Confirm which provider fields map to reply URLs.
  - [x] Add schema updates if required.
- [x] Update UI
  - [x] Add “Reply on platform” CTA to review detail.
  - [x] Ensure link is conditional and uses safe target attributes.
- [x] Access control
  - [x] Ensure only owners can view the deep link.
- [x] Tests
  - [ ] Add co-located tests for deep link visibility rules.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
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

- Added “Reply on platform” CTA when review URL is available.
- Manual checks: CTA appears only for reviews with a reply link.

### File List

- src/app/(in-app)/app/inbox/[id]/page.tsx
- src/db/schema/reviews.ts
