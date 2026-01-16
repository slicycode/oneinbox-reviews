# Story 2.2: Connection Status & Last Auth Health

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to see connection status and auth health,
so that I know if sync will succeed.

## Acceptance Criteria

1. With a connected Google account, integrations show current status (active/expired/error).
2. Last successful auth time is shown.

## Tasks / Subtasks

- [x] Determine status rules
  - [x] Define how status is derived from auth metadata.
  - [x] Identify where last auth time is stored or inferable.
- [x] Persist auth health metadata
  - [x] Add fields to store connection status and last auth time.
  - [x] Update during OAuth callback or sync.
- [x] UI updates
  - [x] Display status badge for Google connection.
  - [x] Show last successful auth time in integrations UI.
- [x] Access control
  - [x] Require authenticated session for integrations view.
- [x] Tests
  - [ ] Add co-located tests for status logic and UI rendering.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Use App Router and server components by default; add `"use client"` only where needed.
- Use `withAuthRequired` for authenticated API routes.
- Keep feature code in `src/features/integrations`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

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

- Added `connection_status` and `last_auth_at` to OAuth accounts.
- Updates auth health metadata on Google sign-in event.
- Integrations UI now shows status and last auth time.
- Manual checks: sign in with Google, status shows active, last auth time appears.

### File List

- src/db/schema/user.ts
- src/auth.ts
- src/app/(in-app)/app/integrations/page.tsx
- src/features/integrations/google-connection-card.tsx
