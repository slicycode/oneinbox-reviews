# Story 2.4: Disconnect Platform

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to disconnect Google,
so that sync stops and my connection is removed.

## Acceptance Criteria

1. Users can disconnect a connected Google account.
2. Sync jobs stop for that account.
3. Historical reviews are retained per data retention policy.

## Tasks / Subtasks

- [x] Identify disconnect behavior
  - [x] Confirm how to remove Google connection data.
  - [x] Confirm retention requirements for historical reviews.
- [x] Implement disconnect flow
  - [x] Add disconnect CTA in integrations UI.
  - [x] Create API route to remove connection.
- [x] Stop sync jobs
  - [x] Mark sync jobs as stopped or prevent new sync enqueue.
  - [x] Log or store disconnect event.
- [x] Access control
  - [x] Require authenticated session for disconnect.
- [x] Tests
  - [ ] Add co-located tests for disconnect flow.
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

- Added disconnect CTA for Google in integrations UI.
- API revokes Google tokens, removes account link, and stops sync jobs.
- Retains historical reviews by leaving review records untouched.
- Manual checks: disconnect removes connection and hides account info.

### File List

- src/features/integrations/google-connection-card.tsx
- src/app/api/app/integrations/google/route.ts
