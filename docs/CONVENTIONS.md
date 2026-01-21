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

## React/Next.js Patterns

### Server vs Client Components

```tsx
// Default: Server Component (no directive needed)
async function ReviewList() {
  const reviews = await getReviews(); // Direct DB access
  return <ul>{reviews.map(r => <ReviewItem key={r.id} review={r} />)}</ul>;
}

// Only when needed: Client Component
'use client';
function ReviewFilter({ onFilter }) {
  const [value, setValue] = useState('');
  // ... interactive logic
}
```

### Data Fetching

```tsx
// GOOD: Parallel fetches
const [reviews, stats] = await Promise.all([
  getReviews(userId),
  getReviewStats(userId)
]);

// BAD: Sequential waterfall
const reviews = await getReviews(userId);
const stats = await getReviewStats(userId); // Waits unnecessarily
```

### State Initialization

```tsx
// GOOD: Lazy initialization for expensive operations
const [data, setData] = useState(() => JSON.parse(localStorage.getItem('key')));

// BAD: Runs on every render
const [data, setData] = useState(JSON.parse(localStorage.getItem('key')));
```

### Dynamic Imports

```tsx
// Heavy components loaded on demand
const Chart = dynamic(() => import('@/components/chart'), {
  loading: () => <ChartSkeleton />
});
```

## Performance Anti-Patterns

### Avoid

1. **Async waterfalls** - Sequential awaits that could be parallel
2. **Unnecessary client components** - Adding `'use client'` without interactivity
3. **Large client bundles** - Importing heavy libs in client components
4. **Redundant re-renders** - Missing memo/useMemo for expensive computations
5. **N+1 queries** - Fetching related data in loops instead of joins

### Prefer

1. **Server components** for data display
2. **Streaming** with Suspense boundaries
3. **Static generation** where possible
4. **Edge functions** for low-latency APIs
5. **Composite indexes** for common query patterns

## TypeScript

```tsx
// Prefer explicit return types for public functions
export async function getReviews(userId: string): Promise<Review[]> {
  // ...
}

// Use Drizzle's inferred types
type Review = typeof reviews.$inferSelect;
type NewReview = typeof reviews.$inferInsert;
```

## Error Handling

```tsx
// API routes: Return typed errors
return NextResponse.json(
  { error: 'Review not found' },
  { status: 404 }
);

// Services: Throw descriptive errors
throw new Error(`Review ${id} not found for user ${userId}`);
```
