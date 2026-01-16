# Story 1.6: Deactivate Team Access (Post-MVP)

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an account owner,
I want to deactivate a teammate’s access,
so that only authorized users remain.

## Acceptance Criteria

1. Account owners can deactivate team members from the team list.
2. Deactivated members lose access to the app.
3. The UI reflects inactive status for deactivated members.

## Tasks / Subtasks

- [ ] Review team membership model and role handling
  - [ ] Confirm where team members and status should be stored.
- [ ] Implement deactivate action
  - [ ] Add UI action to deactivate a team member.
  - [ ] Create API route to update member status.
- [ ] Update access control
  - [ ] Ensure deactivated members cannot access protected routes.
- [ ] Update UI state
  - [ ] Show inactive status and prevent actions for deactivated users.
- [ ] Tests
  - [ ] Add co-located tests for deactivation and access control.
  - [ ] If no test runner is configured, document manual checks in Dev Agent Record.

## Dev Notes

- Post-MVP scope: implement minimal flow without advanced permissions.
- Use `react-hook-form` + `zod` for any forms.
- Keep feature code in `src/features/teams` and shared UI in `src/components/ui`.

### Project Structure Notes

- API routes should live under `src/app/api/*`.
- Database schema references: `src/db/schema/*` (see workspace rules).

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Epic-1]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication--Security]
- [Source: _bmad-output/project-context.md#Critical-Implementation-Rules]

## Dev Agent Record

### Agent Model Used

gpt-5.2-codex
