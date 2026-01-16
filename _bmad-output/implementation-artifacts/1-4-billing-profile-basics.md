# Story 1.4: Billing Profile Basics

Status: review

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an account owner,
I want to manage basic billing profile details,
so that my account records stay accurate.

## Acceptance Criteria

1. Users who are signed in as account owner can view billing settings.
2. Users can update billing profile details successfully.
3. Invalid inputs show validation errors.

## Tasks / Subtasks

- [x] Review current billing profile UI and data model
  - [x] Check existing billing settings page and any billing-related schemas.
  - [x] Confirm where billing profile data should live (db table or provider metadata).
- [x] Implement billing profile form
  - [x] Add UI under `src/features/billing` using `react-hook-form` + `zod`.
  - [x] Load existing billing profile details into the form.
  - [x] Show validation errors inline.
- [x] Save billing profile updates
  - [x] Create API route handler under `src/app/api/*` with auth required.
  - [x] Validate input on the server with Zod.
  - [x] Persist updates and return success state.
- [x] Verify access control
  - [x] Allow only account owners to update billing profile details.
  - [x] Show appropriate error if not owner.
- [x] Tests
  - [ ] Add co-located tests for validation and access control.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Follow project context rules: App Router, server components by default, `"use client"` only for forms/hooks.
- Use `react-hook-form` + `zod` for form validation.
- Keep feature code in `src/features/billing` and shared UI in `src/components/ui`.
- Use authenticated API routes via `withAuthRequired` when needed.

### Project Structure Notes

- Likely page location: `src/app/(in-app)/app/subscribe/billing-form` or billing settings area.
- API routes live under `src/app/api/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

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

- Added `billing_profile` table and schema for storing billing details per user.
- Implemented billing profile API routes with auth and server-side validation.
- Created billing profile form under `src/features/billing` with prefilled data.
- Added billing profile settings page for signed-in users.
- Manual checks: load billing profile page, update fields, verify validation errors.
- MVP assumption: account owner == authenticated user (no team roles yet).

### File List

- src/db/schema/billing-profile.ts
- src/lib/validations/billing-profile.schema.ts
- src/app/api/billing/profile/route.ts
- src/features/billing/billing-profile-form.tsx
- src/app/(in-app)/app/billing/profile/page.tsx
