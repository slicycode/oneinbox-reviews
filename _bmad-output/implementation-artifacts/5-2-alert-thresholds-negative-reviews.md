# Story 5.2: Alert Thresholds for Negative Reviews

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to set alert thresholds for negative reviews,
so that I can prioritize urgent feedback.

## Acceptance Criteria

1. Users can set a rating threshold for “negative review” alerts.
2. Alerts only trigger when new reviews are rated at or below the threshold.
3. Threshold settings are persisted and editable.

## Tasks / Subtasks

- [x] Define threshold settings model
  - [x] Decide where threshold preferences are stored.
  - [x] Add schema updates and migrations if needed.
- [x] Implement alert trigger
  - [x] Filter new review alerts by rating threshold.
  - [x] Ensure only qualifying reviews trigger alerts.
- [x] Update UI
  - [x] Add threshold controls in alert settings.
  - [x] Validate input range.
- [x] Access control
  - [x] Ensure only owners can update thresholds.
- [x] Tests
  - [ ] Add co-located tests for threshold behavior.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Use `react-hook-form` + `zod` if building forms.
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

- Added negative review threshold setting and validation.
- Alert sending now filters on rating threshold.
- Manual checks: threshold updates and filtered alerts.

### File List

- src/db/schema/alert-settings.ts
- src/lib/validations/alert-settings.schema.ts
- src/app/api/app/alerts/settings/route.ts
- src/features/alerts/email-alerts-form.tsx
- src/lib/alerts/send-new-review-alert.ts
- src/app/(in-app)/app/inbox/page.tsx
