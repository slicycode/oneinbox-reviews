# Story 5.4: Sync Failure & Stale Data Alerts

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want alerts when sync fails or data is stale,
so that I can take action to restore freshness.

## Acceptance Criteria

1. Users receive alerts when a sync fails.
2. Users receive alerts when review data becomes stale.
3. Alerts include guidance or a CTA to reconnect or re-sync.

## Tasks / Subtasks

- [x] Define failure/stale alert criteria
  - [x] Confirm stale threshold and failure conditions.
  - [x] Add schema updates if needed.
- [x] Implement alert trigger
  - [x] Trigger alert when sync status is failed.
  - [x] Trigger alert when data is stale.
- [x] Implement email delivery
  - [x] Add email template for sync failure/stale alerts.
  - [x] Send emails via existing email provider.
- [x] Update UI
  - [x] Surface alert settings or status in inbox/settings.
- [x] Access control
  - [x] Ensure only owners can update settings.
- [x] Tests
  - [ ] Add co-located tests for stale/failure alerts.
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

- Added sync health alert email template and processor.
- Alerts are sent via cron and deduped with a cooldown.
- Stale alerts only trigger after at least one successful sync.
- Manual checks: simulate failed/stale status and verify email send.

### File List

- src/emails/SyncHealthAlert.tsx
- src/lib/alerts/process-sync-health-alerts.ts
- src/app/api/cron/sync-health-alerts/route.ts
- src/db/schema/review-sync-status.ts
