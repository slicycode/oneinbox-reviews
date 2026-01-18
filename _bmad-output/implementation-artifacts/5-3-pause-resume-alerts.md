# Story 5.3: Pause / Resume Alerts

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to pause or resume alerts,
so that I can control notification noise.

## Acceptance Criteria

1. Users can pause alerts for new reviews.
2. Users can resume alerts at any time.
3. Paused alerts do not send emails.

## Tasks / Subtasks

- [x] Define pause settings model
  - [x] Decide where pause state is stored.
  - [x] Add schema updates and migrations if needed.
- [x] Implement alert gating
  - [x] Skip sending when alerts are paused.
- [x] Update UI
  - [x] Add pause/resume controls in alert settings.
- [x] Access control
  - [x] Ensure only owners can update pause state.
- [x] Tests
  - [ ] Add co-located tests for pause/resume behavior.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Keep feature code in `src/features/alerts`.

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

- Added pause flag to alert settings.
- Alert sending now stops while paused.
- Manual checks: toggle pause and verify no alerts.

### File List

- src/db/schema/alert-settings.ts
- src/lib/validations/alert-settings.schema.ts
- src/app/api/app/alerts/settings/route.ts
- src/features/alerts/email-alerts-form.tsx
- src/lib/alerts/send-new-review-alert.ts
- src/app/(in-app)/app/inbox/page.tsx
