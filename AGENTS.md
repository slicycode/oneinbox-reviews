# AI Agent Rules

Rules for AI-assisted code review, refactoring, and implementation. Prioritized by real-world impact.

## Priority Levels

- **CRITICAL** - Fix immediately, blocks performance/security
- **HIGH** - Fix soon, noticeable user impact
- **MEDIUM** - Fix when touching related code
- **LOW** - Nice to have, minimal impact

---

## Performance Rules

### CRITICAL: Eliminate Async Waterfalls

Sequential async calls that could run in parallel.

```tsx
// BAD
const user = await getUser(id);
const reviews = await getReviews(id);
const stats = await getStats(id);

// GOOD
const [user, reviews, stats] = await Promise.all([
  getUser(id),
  getReviews(id),
  getStats(id)
]);
```

### CRITICAL: Check Conditions Before Await

Move early-exit checks before expensive operations.

```tsx
// BAD
async function processReview(id: string, skip: boolean) {
  const review = await fetchReview(id);
  if (skip) return null; // Fetched unnecessarily
  return transform(review);
}

// GOOD
async function processReview(id: string, skip: boolean) {
  if (skip) return null;
  const review = await fetchReview(id);
  return transform(review);
}
```

### HIGH: Prefer Server Components

Client components increase bundle size and hydration time.

```tsx
// BAD - Client component just for display
'use client';
export function ReviewCard({ review }) {
  return <div>{review.content}</div>;
}

// GOOD - Server component (default)
export function ReviewCard({ review }) {
  return <div>{review.content}</div>;
}
```

### HIGH: Lazy Load Heavy Components

Charts, editors, and modals should load on demand.

```tsx
// BAD
import { Chart } from 'heavy-chart-lib';

// GOOD
const Chart = dynamic(() => import('heavy-chart-lib').then(m => m.Chart), {
  loading: () => <Skeleton />,
  ssr: false
});
```

### MEDIUM: Use Lazy State Initialization

Expensive initial values should use callback form.

```tsx
// BAD - Parses on every render
const [items, setItems] = useState(JSON.parse(localStorage.getItem('items') || '[]'));

// GOOD - Parses only once
const [items, setItems] = useState(() =>
  JSON.parse(localStorage.getItem('items') || '[]')
);
```

### MEDIUM: Consolidate Array Iterations

Multiple passes over same data should be combined.

```tsx
// BAD
const total = items.reduce((sum, i) => sum + i.price, 0);
const count = items.filter(i => i.active).length;
const names = items.map(i => i.name);

// GOOD
const { total, count, names } = items.reduce(
  (acc, item) => ({
    total: acc.total + item.price,
    count: acc.count + (item.active ? 1 : 0),
    names: [...acc.names, item.name]
  }),
  { total: 0, count: 0, names: [] }
);
```

---

## Database Rules

### CRITICAL: No N+1 Queries

Fetching related data in loops instead of joins.

```tsx
// BAD
const reviews = await db.select().from(reviewsTable);
for (const review of reviews) {
  review.user = await db.select().from(usersTable).where(eq(usersTable.id, review.userId));
}

// GOOD
const reviews = await db
  .select()
  .from(reviewsTable)
  .leftJoin(usersTable, eq(reviewsTable.userId, usersTable.id));
```

### HIGH: Use Indexes for Common Queries

Queries filtering/sorting on unindexed columns.

```tsx
// Ensure indexes exist for:
// - Foreign keys (userId, businessId, etc.)
// - Frequently filtered columns (status, createdAt)
// - Composite indexes for multi-column filters
```

### MEDIUM: Limit Query Results

Unbounded queries that could return thousands of rows.

```tsx
// BAD
const allReviews = await db.select().from(reviewsTable);

// GOOD
const reviews = await db.select().from(reviewsTable).limit(50).offset(page * 50);
```

---

## Security Rules

### CRITICAL: Validate User Ownership

Always verify the authenticated user owns the resource.

```tsx
// BAD
const review = await getReview(params.id);

// GOOD
const session = await auth();
const review = await getReview(params.id);
if (review.userId !== session.user.id) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### CRITICAL: Sanitize User Input

Never trust client data in database queries or rendered output.

```tsx
// BAD
const results = await db.execute(`SELECT * FROM reviews WHERE id = '${input}'`);

// GOOD
const results = await db.select().from(reviewsTable).where(eq(reviewsTable.id, input));
```

### HIGH: Check Session in API Routes

API routes must verify authentication before processing.

```tsx
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... proceed with authenticated logic
}
```

---

## Code Quality Rules

### MEDIUM: Explicit Return Types

Public functions should have explicit return types for better type inference.

```tsx
// BAD
export async function getReviews(userId: string) {
  return db.select()...
}

// GOOD
export async function getReviews(userId: string): Promise<Review[]> {
  return db.select()...
}
```

### LOW: Prefer Composition Over Prop Drilling

Deep prop passing should use composition or context.

```tsx
// BAD - Drilling through 3+ levels
<Parent data={data}>
  <Child data={data}>
    <GrandChild data={data} />

// GOOD - Composition
<Parent>
  <DataConsumer />
</Parent>
```

---

## When Reviewing Code

1. Check for CRITICAL issues first
2. Flag HIGH issues for immediate attention
3. Note MEDIUM issues as tech debt
4. Mention LOW issues only if already touching that code
