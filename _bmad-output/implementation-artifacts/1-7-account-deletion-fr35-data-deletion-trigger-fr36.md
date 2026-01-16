# Story 1.7: Account Deletion (FR35) + Data Deletion Trigger (FR36)

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an account owner,
I want to delete my account,
so that my data is removed per policy.

## Acceptance Criteria

1. Account owners can request account deletion after confirming intent.
2. The account is marked deleted and access is revoked.
3. A deletion job is triggered to comply with platform data deletion policies.

## Tasks / Subtasks

- [x] Review account deletion requirements and data policy triggers
  - [x] Identify data that must be deleted or anonymized.
  - [x] Confirm deletion job mechanism (background job vs cron).
- [x] Implement account deletion flow
  - [x] Add UI for confirmation and delete action.
  - [x] Create API route to mark account as deleted.
- [x] Trigger data deletion process
  - [x] Enqueue deletion job or mark for scheduled cleanup.
  - [x] Record audit event if required.
- [x] Revoke access
  - [x] Ensure deleted accounts cannot sign in or access the app.
- [x] Tests
  - [ ] Add co-located tests for deletion flow.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use `withAuthRequired` for protected routes.
- Use `react-hook-form` + `zod` for any forms.
- Keep feature code in `src/features/accounts` and shared UI in `src/components/ui`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Background jobs should live under `src/lib/jobs/*` with triggers in `src/app/api/cron/*`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Debug Log References

No automated test runner configured; manual checks performed.

### Completion Notes List

- Added account deletion API route and client confirmation flow in profile settings.
- Marked users as deleted and blocked sign-in + protected API access when deleted.
- Triggered deletion job via lightweight enqueue helper with structured log event.
- Added account deletion job table and cron processor for queued deletions.
- Manual checks: delete account confirmation, sign-in blocked after deletion.

### File List

- src/db/schema/user.ts
- src/auth.ts
- src/lib/auth/withAuthRequired.ts
- src/lib/jobs/account-deletion.ts
- src/lib/validations/account-deletion.schema.ts
- src/app/api/app/account/delete/route.ts
- src/db/schema/account-deletion-job.ts
- src/app/api/cron/account-deletion/route.ts
- src/app/(in-app)/app/profile/page.tsx
