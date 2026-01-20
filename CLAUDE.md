# Claude Code Instructions

## Before Starting Any Task

1. Read `TASKS.md` to understand current sprint state
2. Find the next unchecked task in the current story
3. Implement ONLY that single task
4. Update `TASKS.md` when done

## File Patterns

- Schemas: `src/db/schema/*.ts`
- Services: `src/lib/<feature>/*.ts`
- API routes: `src/app/api/app/<resource>/route.ts`
- Components: `src/components/ui/*.tsx`

## Naming Conventions

- Database: snake_case
- Files: kebab-case
- Functions: camelCase
- REST endpoints: plural nouns

## Commit Messages

Format: `feat(sprint-X): TASK-X.X brief description`

Example: `feat(sprint-2): TASK-2.1 create plan configuration`

## When Blocked

1. Add `⚠️ BLOCKED: reason` under the task
2. Move to next unblocked task
3. Flag for human review