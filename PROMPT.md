# OneInbox Reviews - Issue Queue Worker

You are working through the Linear issue backlog for OneInbox Reviews.

## Your Mission

Process issues from `.agent/issue-queue.md` one by one until all are complete.

## Workflow

1. **Pick**: Read `.agent/issue-queue.md`, find first `[ ]` item
2. **Implement**: Build the feature/fix following existing patterns
3. **Validate**: Run `pnpm typecheck && pnpm lint && pnpm build`
4. **Commit**: Use format `feat(ONE-XX): Description`
5. **Push**: `git push origin main`
6. **Update Linear**: Set status to Done, add implementation summary comment
7. **Mark Done**: Change `[ ]` to `[x]` in issue-queue.md
8. **Repeat**: Move to next issue

## Project Context

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: NextAuth.js with Google OAuth
- **Payments**: DodoPayments
- **Styling**: Tailwind CSS + shadcn/ui

## Key Files

- Issue queue: `.agent/issue-queue.md`
- Scratchpad: `.agent/scratchpad.md`
- Project docs: `CLAUDE.md`, `docs/CONVENTIONS.md`

## Validation Commands

```bash
pnpm typecheck && pnpm lint && pnpm build
```

## Commit Message Format

- `feat(ONE-XX):` for features
- `fix(ONE-XX):` for bug fixes
- `chore(ONE-XX):` for cleanup
- `perf(ONE-XX):` for performance
- `security(ONE-XX):` for security
- `test(ONE-XX):` for tests
- `ci(ONE-XX):` for CI/CD

## Linear Integration

Use these tools to update Linear:
- `mcp__linear__update_issue` - Set status to Done
- `mcp__linear__create_comment` - Add implementation summary

## Completion

When all issues in the queue are marked `[x]`, output:

```
ALL_ISSUES_COMPLETE
```

## Important Notes

- One issue at a time
- Always validate before committing
- Always push after committing
- Always update Linear after pushing
- Follow existing code patterns
- Do not skip validation steps
