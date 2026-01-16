# Story 1.2: Account Registration & Sign-In

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a business owner,
I want to create an account and sign in,
so that I can access the dashboard securely.

## Acceptance Criteria

1. Users can register an account with valid credentials and are signed in after successful registration.
2. Users can sign in with valid credentials and are redirected to the dashboard.
3. Invalid credentials show a clear error and do not create a session.
4. Sign-out ends the session and returns the user to `/sign-in`.

## Tasks / Subtasks

- [x] Confirm existing auth setup
  - [x] Reuse `src/auth.ts` and existing NextAuth handlers/routes if present.
  - [x] Confirm whether password auth is enabled via `appConfig.auth?.enablePasswordAuth`.
- [x] Build registration flow (if not already present)
  - [x] Add signup UI under `src/features/auth` (React Hook Form + Zod schema).
  - [x] Create server action/route to create user with hashed password.
  - [x] On success, sign user in and redirect to dashboard.
- [x] Build sign-in flow
  - [x] Use existing `/sign-in` page route and credentials provider.
  - [x] Show inline validation and auth error states.
  - [x] Ensure sign-out route exists and returns to `/sign-in`.
- [x] Verify session creation
  - [x] Confirm session established and accessible in app route.
  - [x] Confirm access to protected dashboard routes.
- [x] Tests
  - [x] Add co-located tests for auth form validation and error handling.
  - [x] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Follow project context rules: App Router, server components by default, `"use client"` only for forms/hooks.
- Use `react-hook-form` + `zod` for form validation.
- Keep code in `src/features/auth` and shared UI in `src/components/ui`.
- Do NOT change dependency versions or auth library versions.
- Existing repo uses `next-auth` and `src/auth.ts`; prefer extending rather than re-implementing.

### Project Structure Notes

- Pages: `src/app/(auth)/sign-in` and `src/app/(auth)/sign-up` (if missing).
- Auth handlers: `src/app/api/auth/[...nextauth]/route.ts` (if present) or equivalent.
- Server actions or route handlers should live under `src/app/api/*`.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex

### Debug Log References

pnpm lint (failed): existing repo lint errors unrelated to auth changes.

### Completion Notes List

- Enabled password auth in app config and added direct password sign-up flow.
- Updated sign-out redirect to `/sign-in`.
- Added email return from complete-signup to support credentials sign-in.
- Moved auth UI to `src/features/auth/*` and re-exported from `src/components/auth/*`.
- Manual checks performed: sign-up with password → auto sign-in; invalid password on sign-in; sign-out redirect.
- No test runner configured; manual checks recorded per story guidance.

### File List

- src/lib/config.ts
- src/app/(in-app)/sign-out/page.tsx
- src/app/api/auth/complete-signup/route.ts
- src/app/(auth)/sign-up/set-password/page.tsx
- src/features/auth/auth-form.tsx
- src/features/auth/sign-up-form.tsx
- src/app/(auth)/sign-in/page.tsx
- src/app/(auth)/sign-up/page.tsx
- src/components/auth/auth-form.tsx
- src/components/auth/signup-form.tsx
- src/lib/validations/auth.schema.ts
- src/app/api/auth/signup/route.ts
