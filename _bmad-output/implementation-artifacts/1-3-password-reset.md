# Story 1.3: Password Reset

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to reset my password,
so that I can regain access if I forget it.

## Acceptance Criteria

1. Users can request a password reset link by email.
2. Valid reset links allow setting a new password.
3. Invalid or expired reset links are rejected.

## Tasks / Subtasks

- [x] Confirm existing reset password flow
  - [x] Check `/reset-password` page and request API route.
  - [x] Check `/reset-password/confirm` page and confirm API route.
- [x] Ensure reset token validation
  - [x] Reject missing, invalid, or expired tokens.
  - [x] Return clear error to the client for invalid tokens.
- [x] Align feature-based structure
  - [x] Move reset password form to `src/features/auth`.
  - [x] Re-export from `src/components/auth` for compatibility.
- [x] Tests
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Follow project context rules: App Router, server components by default, `"use client"` only for forms/hooks.
- Use `react-hook-form` + `zod` for form validation.
- Keep feature code in `src/features/auth` and shared UI in `src/components/ui`.
- Do NOT change dependency versions or auth library versions.

### Project Structure Notes

- Pages: `src/app/(auth)/reset-password` and `src/app/(auth)/reset-password/confirm`.
- API routes: `src/app/api/auth/reset-password-request` and `src/app/api/auth/reset-password-confirm`.
- Email template: `src/emails/ResetPasswordEmail`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Completion Notes List

- Kept reset password request/confirm flow in place using Zod validation.
- Added invalid token handling to return a clear 400 error.
- Moved reset password form into `src/features/auth` and re-exported from `src/components/auth`.
- Manual checks performed: request reset, invalid token shows error, expired token rejected.
- No test runner configured; manual checks recorded per story guidance.

### File List

- src/app/api/auth/reset-password-request/route.ts
- src/app/api/auth/reset-password-confirm/route.ts
- src/app/(auth)/reset-password/page.tsx
- src/app/(auth)/reset-password/confirm/page.tsx
- src/features/auth/reset-password-form.tsx
- src/components/auth/reset-password-form.tsx
