# Epic 1 Retrospective

Status: done

## Summary

Epic 1 delivered authentication, password reset, billing profile basics, and account deletion foundations. The scope matched MVP needs, with clear story sequencing and minimal rework.

## What went well

- Auth flows stabilized after aligning password sign-up and sign-in behavior.
- Story structure kept implementation focused and incremental.
- Code reviews consistently caught missing checks and documentation gaps.

## What could be improved

- Test coverage remains manual; add automated tests when a runner is ready.
- Clearer ownership/role modeling is needed before team features.
- DB changes require explicit local environment setup upfront.

## Manual Testing Required

Yes. Direct local app testing is needed for these flows:

- Sign-up/sign-in with credentials; invalid password shows errors.
- Password reset request → confirm link → new password works.
- Billing profile form loads, validates, and saves updates.
- Account deletion confirmation disables access and signs out.

## Action Items

- Add test runner and co-located tests for auth and account deletion.
- Define account ownership/roles before team-related stories.
- Document local env setup steps for DB schema updates.
