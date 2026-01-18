# Story 5.6: Manual Re-sync Trigger

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a super admin,
I want to trigger a manual re-sync for an account,
so that I can recover from sync issues.

## Acceptance Criteria

1. Super admins can trigger a manual re-sync for a selected account.
2. Trigger is restricted to super admins.
3. Action is logged or reflected in sync status.

## Tasks / Subtasks

- [ ] Define manual trigger flow
  - [ ] Decide how support selects account/provider.
- [ ] Implement API handling
  - [ ] Add secured endpoint to enqueue manual sync.
- [ ] Update UI
  - [ ] Add trigger action in support sync health view.
- [ ] Access control
  - [ ] Enforce super admin access.
- [ ] Tests
  - [ ] Add co-located tests for manual trigger.
  - [ ] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Keep feature code in `src/features/support`.

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

TBD

### Completion Notes List

- TBD

### File List

- TBD
