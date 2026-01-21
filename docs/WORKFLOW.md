# Development Workflow

## Task Management

Tasks tracked in Linear. Branch naming: `feat/ONE-XX-description` or `fix/ONE-XX-description`.

## Explore-Plan-Code-Commit

This workflow produces better results than jumping straight to code.

### 1. Explore
- Read relevant files before proposing changes
- Use subagents for complex codebase searches
- Understand existing patterns before adding new ones

### 2. Plan
- For non-trivial tasks, use Plan Mode (Shift+Tab twice)
- Write plans to `PLAN.md` for complex features (external memory)
- Break large tasks into Linear sub-issues

### 3. Code
- Implement incrementally, verifying each step
- Run `npm run type-check` after significant changes
- Follow patterns in [CONVENTIONS.md](./CONVENTIONS.md)

### 4. Commit
- Conventional commits: `feat:`, `fix:`, `chore:`, `perf:`, `docs:`
- Include Linear issue: `feat(ONE-XX): add review filtering`
- One logical change per commit

## Context Management

Context quality degrades around 30% usage, not 100%.

**Strategies:**
- `/clear` between unrelated tasks
- Write complex plans to `PLAN.md` before implementing
- One feature per conversation session
- Use subagents for isolated subtasks (they get fresh 200K context)

**Copy-Paste Reset:** When context bloats, copy key decisions, run `/clear`, paste back essentials.

## Model Selection

**Use Opus for:**
- Architecture decisions
- Complex debugging
- Multi-file refactors
- Planning sessions

**Use Sonnet (Shift+Tab) for:**
- Implementing pre-planned features
- Boilerplate code
- Simple fixes
- Repetitive tasks

## Git Workflow

```bash
# Feature branch
git checkout -b feat/ONE-XX-description

# After implementation
git add -A
git commit -m "feat(ONE-XX): description"

# Push and create PR
git push -u origin HEAD
gh pr create --fill
```

## Pre-PR Checklist

- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Tested manually in browser
- [ ] No console errors/warnings
- [ ] Linear issue updated

## Breaking Stuck Loops

If Claude repeats the same failing approach:
1. `/clear` for fresh context
2. Simplify the task scope
3. Show example of desired output
4. Try different approach/framing
