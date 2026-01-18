# Story 3.3: Backfill After Re-auth

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want a backfill sync after re-auth,
so that missed reviews are ingested.

## Acceptance Criteria

1. After successful re-auth, a backfill sync is queued.
2. Backfill is idempotent and does not duplicate reviews.

## Tasks / Subtasks

- [x] Define backfill scope and idempotency keys
  - [x] Identify window for backfill.
  - [x] Confirm review uniqueness constraints.
- [x] Trigger backfill after re-auth
  - [x] Queue backfill job on re-auth event.
  - [x] Ensure idempotent job creation.
- [x] Implement backfill ingestion
  - [x] Fetch missed reviews and upsert.
  - [x] Record sync status updates.
- [x] Tests
  - [ ] Add co-located tests for backfill idempotency.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Use `withAuthRequired` for authenticated API routes.
- Keep feature code in `src/features/reviews` and `src/features/inbox`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Background jobs should live under `src/lib/jobs/*` with triggers in `src/app/api/cron/*`.

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

- Backfill is queued on re-auth for expired connections.
- Idempotency is enforced via review sync job idempotency keys.
- Backfill uses the shared review sync job processor.
- Manual checks: re-auth queues backfill job, no duplicates on rerun.

### File List

- src/auth.ts
- src/lib/jobs/review-backfill.ts
- src/lib/jobs/reviews-sync.ts
