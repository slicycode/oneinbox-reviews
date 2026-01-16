# Story 1.5: Team Invites & Roles (Post-MVP)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an account owner,
I want to invite team members and assign roles,
so that access is controlled.

## Acceptance Criteria

1. Account owners can invite teammates and select a role.
2. Invited teammates receive an invite and appear in the team list.
3. Roles reflect permissions in the UI.

## Tasks / Subtasks

- [ ] Review current auth/team data model and role handling
  - [ ] Identify where team membership and roles should be stored.
  - [ ] Confirm invitation mechanism (email, magic link, etc.).
- [ ] Implement invite flow
  - [ ] Create invite UI under `src/features/teams`.
  - [ ] Add role selection during invite.
  - [ ] Send invite email and store pending invite.
- [ ] Implement team list with roles
  - [ ] Display current members and their roles.
  - [ ] Show invite status for pending teammates.
- [ ] Enforce role permissions in UI
  - [ ] Hide/disable actions based on role.
- [ ] Tests
  - [ ] Add co-located tests for invite flow and role UI behavior.
  - [ ] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Post-MVP scope: implement minimal flow without advanced permissions.
- Use `react-hook-form` + `zod` for form validation.
- Keep feature code in `src/features/teams` and shared UI in `src/components/ui`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Email templates should live under `src/emails/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex
