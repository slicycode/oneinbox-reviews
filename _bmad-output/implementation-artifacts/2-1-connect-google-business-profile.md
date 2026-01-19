# Story 2.1: Connect Google Business Profile

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to connect my Google Business Profile account,
so that reviews can be pulled into the inbox.

## Acceptance Criteria

1. **Given** I am signed in **when** I complete Google OAuth **then** the Google connection is stored and marked active.
2. **Given** I am signed in **when** I return from OAuth with denied consent **then** I see a clear error message and no connection is stored.
3. **Given** I am signed in **when** OAuth completes with partial permissions **then** the UI shows an error that the required scopes were not granted and the connection is not marked active.
4. **Given** I have an active Google connection **when** I load the integrations page **then** I see the connected account details and an active status indicator.
5. **Given** I do not have a Google connection **when** I load the integrations page **then** I see a connect CTA and no sync/inbox functionality is triggered.

## Error & Edge Cases

- OAuth denied or cancelled: show a user-friendly error; do not store a connection.
- Partial permissions/scopes: show a required-scopes message; do not mark active.
- Token expiry on return or invalid token: show error and require reconnect; do not mark active.
- Duplicate connect attempt: existing connection remains; no duplicate account records created.

## UI Expectations

- Minimal UI updates only (no design overhaul).
- Integrations page shows:
  - Connect button when disconnected.
  - Connected account display (name/email) and status when connected.
  - Inline error messaging for OAuth failures.

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
  - [x] Add co-located tests for connection flow.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

### Developer Context

- Goal is Google-only connection for MVP; no Yelp/Facebook in this story.
- Connection is represented by the existing NextAuth accounts table.
- Keep UX minimal: connect button, connected account details, status indicator, and inline errors.

### Technical Requirements

- Use Auth.js (NextAuth) OAuth flow; do not build custom OAuth handling.
- Use database-backed sessions and require auth for any connection status API routes.
- Errors must follow `{ error: { code, message, details } }`.
- Do not introduce review sync, inbox data, or alerts in this story.

### Architecture Compliance

- App Router only; server components by default; add `"use client"` only for hooks.
- Feature UI lives in `src/features/integrations`; shared UI in `src/components/ui`.
- API routes under `src/app/api/*` with plural REST naming if introduced.

### File Structure Requirements

- Integration UI under `src/features/integrations/*`.
- Route handlers (if needed) under `src/app/api/app/integrations/*`.
- Drizzle schemas live in `src/db/schema/*`; do not add new schema for this story.

### Testing Requirements

- Co-locate tests as `*.test.ts(x)` where feasible.
- If no test runner is configured, document manual checks in Dev Agent Record.

### Project Context Reference

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-2]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation-Patterns--Consistency-Rules]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]
- [Source: src/auth.ts]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Debug Log References

No automated test runner configured; manual checks performed.
Tests: `node --test --import tsx src/lib/auth/google-connection.test.ts`

### Completion Notes List

- Added integrations page and Google connect card using NextAuth OAuth flow.
- Connection state is derived from existing Google account link in `accounts`.
- Manual checks: connect Google, see status active, reload page shows connected account.
- Added `resolveGoogleConnectionStatus` helper and unit tests for connection status logic.

### File List

- src/app/(in-app)/app/integrations/page.tsx
- src/features/integrations/google-connection-card.tsx
- src/lib/auth/google-connection.ts
- src/lib/auth/google-connection.test.ts

### Change Log

- 2026-01-19: Added connection status helper and unit tests; updated integrations page to use helper.

## Senior Developer Review (AI)

**Outcome:** Approved  
**Date:** 2026-01-19  
**Reviewer:** Root

### Review Notes

- OAuth error handling and missing-scope messaging added via helper utilities.
- Integrations page now surfaces OAuth error state for denied/failed sign-in.
- Connection status logic is isolated and unit-tested.

### Action Items

- [x] Add handling for OAuth denied or cancelled (error messaging).
- [x] Validate required Google scopes and surface missing-scope errors.
- [x] Remove debug logging from integrations page.
