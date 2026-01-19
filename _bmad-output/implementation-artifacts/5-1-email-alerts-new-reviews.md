# Story 5.1: Email Alerts for New Reviews

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to receive email alerts for new reviews,
so that I can respond quickly.

## Acceptance Criteria

1. Users can enable or disable email alerts for new reviews.
2. Alerts are sent when new reviews are ingested.
3. Alerts include basic review details (rating, author, snippet, link).

## Tasks / Subtasks

- [x] Define alert settings model
  - [x] Decide where alert preferences are stored.
  - [x] Add schema updates and migrations if needed.
- [x] Implement alert trigger
  - [x] Hook into review ingestion pipeline to detect new reviews.
  - [x] Queue email alerts for enabled users.
- [x] Implement email delivery
  - [x] Add email template for new review alerts.
  - [x] Send emails via existing email provider.
- [x] Update UI
  - [x] Add toggle for email alerts in settings or inbox.
- [x] Access control
  - [x] Ensure only owners can update alert preferences.
- [x] Tests
  - [ ] Add co-located tests for alert settings and triggers.
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

- Added alert settings table and toggle in inbox.
- New review alert email template with summary list.
- Alert trigger hooks into review sync processing.

### File List

- src/db/schema/alert-settings.ts
- src/lib/validations/alert-settings.schema.ts
- src/app/api/app/alerts/settings/route.ts
- src/features/alerts/email-alerts-form.tsx
- src/emails/NewReviewAlert.tsx
- src/lib/alerts/send-new-review-alert.ts
- src/lib/jobs/reviews-sync.ts
- src/app/(in-app)/app/inbox/page.tsx
