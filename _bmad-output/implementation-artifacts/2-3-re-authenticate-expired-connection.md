# Story 2.3: Re-authenticate Expired Connection

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to re-authenticate if my connection expires,
so that review sync resumes.

## Acceptance Criteria

1. When a connection is expired, users can re-authenticate.
2. After successful re-auth, status returns to active.
3. A backfill sync is queued (idempotent).

## Tasks / Subtasks

- [x] Identify expired status handling
  - [x] Confirm how expired is detected for Google connections.
  - [x] Define re-auth action trigger.
- [x] Implement re-auth flow
  - [x] Add re-auth CTA in integrations UI.
  - [x] Reuse Google OAuth flow with callback.
- [x] Update connection status
  - [x] Mark connection as active after re-auth.
  - [x] Store last auth time.
- [x] Trigger backfill sync
  - [x] Queue backfill job (idempotent).
  - [x] Log or store sync trigger.
- [x] Tests
  - [ ] Add co-located tests for re-auth flow.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Use `withAuthRequired` for authenticated API routes.
- Keep feature code in `src/features/integrations`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Background jobs should live under `src/lib/jobs/*` with triggers in `src/app/api/cron/*`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2]
- [Source: _bmad-output/planning-artifacts/architecture.md#API--Communication-Patterns]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Debug Log References

No automated test runner configured; manual checks performed.

### Completion Notes List

- Added re-auth CTA when Google connection is expired.
- Re-auth uses Google OAuth and resets status to active with last auth time.
- Enqueued idempotent review backfill on re-auth.
- Added cron processor to mark backfill jobs as processed.
- Manual checks: expired status shows reconnect; sign-in sets active and queues backfill.

### File List

- src/features/integrations/google-connection-card.tsx
- src/auth.ts
- src/db/schema/review-sync-job.ts
- src/lib/jobs/review-backfill.ts
- src/app/api/cron/review-backfill/route.ts
