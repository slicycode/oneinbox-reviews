# Story 3.1: Ingest Google Reviews (Initial Sync)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want my Google reviews ingested,
so that they appear in my inbox.

## Acceptance Criteria

1. Given a connected Google account, a sync job ingests new reviews.
2. Reviews are stored and visible in the inbox.
3. Reruns are idempotent (no duplicates, no regressions).

## Tasks / Subtasks

- [ ] Review review data model and ingestion requirements
  - [ ] Identify where reviews should be stored and indexed.
  - [ ] Confirm required fields and idempotency keys.
- [ ] Implement ingestion job
  - [ ] Create job under `src/lib/jobs` to fetch and store reviews.
  - [ ] Use idempotent upsert logic for reviews.
- [ ] Trigger initial sync
  - [ ] Trigger job after successful connection.
  - [ ] Record sync metadata (last sync time).
- [ ] Surface in inbox
  - [ ] Ensure reviews appear in inbox list UI.
- [ ] Tests
  - [ ] Add co-located tests for ingestion and idempotency.
  - [ ] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Keep feature code in `src/features/reviews` and `src/features/inbox`.
- Prefer background jobs in `src/lib/jobs/*` with thin triggers in `src/app/api/cron/*`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex
