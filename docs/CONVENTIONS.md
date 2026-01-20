# Code Conventions

## File Patterns

- **Database Schemas:** `src/db/schema/*.ts`
- **Services/Logic:** `src/lib/<feature>/*.ts`
- **API Routes:** `src/app/api/app/<resource>/route.ts`
- **UI Components:** `src/components/ui/*.tsx`
- **Feature Components:** `src/features/<feature>/*.tsx`
- **Pages:** `src/app/(in-app)/app/**/*.tsx`

## Naming Conventions

- Database columns: `snake_case`
- File names: `kebab-case`
- Functions/variables: `camelCase`
- React components: `PascalCase`
- REST endpoints: plural nouns (`/reviews`, `/subscriptions`)
