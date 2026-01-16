# Story 2.1: Connect Google Business Profile

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to connect my Google Business Profile account,
so that reviews can be pulled into the inbox.

## Acceptance Criteria

1. Users who are signed in can complete Google OAuth.
2. The connection is stored and marked active.
3. The connected account appears in the UI.

## Tasks / Subtasks

- [x] Review existing OAuth/provider config
  - [x] Confirm Google OAuth setup in `src/auth.ts`.
  - [x] Identify where integrations should be stored.
- [x] Implement connection storage
  - [x] Use NextAuth accounts table as the connection source of truth.
  - [x] Treat Google account presence as active connection.
- [x] Implement connect UI
  - [x] Add UI under `src/features/integrations` to connect Google.
  - [x] Show connected account details after success.
- [x] Access control
  - [x] Require authenticated session for connect flow.
- [x] Tests
  - [ ] Add co-located tests for connection flow.
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

- Added integrations page and Google connect card using NextAuth OAuth flow.
- Connection state is derived from existing Google account link in `accounts`.
- Manual checks: connect Google, see status active, reload page shows connected account.

### File List

- src/app/(in-app)/app/integrations/page.tsx
- src/features/integrations/google-connection-card.tsx
