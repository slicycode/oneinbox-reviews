# OneInbox Reviews - Sprint Tasks

> This file is the single source of truth for current sprint implementation tasks.
> Agents should read this file at the start of each session and update task status.

## Current Sprint: Sprint 2 - Monetization

**Sprint Goal:** Introduce DodoPayments without breaking Sprint 1 flows.

**Sprint Constraints:**
- ❌ No UX redesign
- ❌ No analytics
- ❌ No feature expansion
- ✅ Preserve onboarding flow
- ✅ Gentle upgrade CTAs only

---

## Story 1: billing-foundation-dodo-payments-integration
**Status:** ✅ COMPLETE

- [x] Create `src/db/schema/subscriptions.ts`
- [x] Generate and apply migration
- [x] Add DodoPayments helper functions
- [x] Create GET /api/app/subscriptions
- [x] Create POST /api/app/subscriptions/cancel
- [x] Create POST /api/app/subscriptions/resume
- [x] Enhance webhook handler for subscription events

---

## Story 2: define-plans-and-subscription-states
**Status:** ✅ COMPLETE

### Tasks:

- [x] **TASK-2.1:** Create plan configuration
  - File: `src/lib/plans/config.ts`
  - Define: free, starter tiers
  - Include: pricing, features, quotas, Dodo product IDs
  - Pattern: Export typed config object

- [x] **TASK-2.2:** Create subscription state machine
  - File: `src/lib/subscriptions/state-machine.ts`
  - Define: Valid state transitions
  - Include: `canTransition(from, to)` function
  - States: none → trialing → active → canceled

- [x] **TASK-2.3:** Create access control helpers
  - File: `src/lib/subscriptions/access-control.ts`
  - Functions:
    - `canAccessFeature(userId, feature): boolean`
    - `getPlanLimits(planTier): PlanLimits`
    - `requiresUpgrade(userId, feature): boolean`

- [x] **TASK-2.4:** Update getUserPlan utility
  - File: `src/lib/plans/getUserPlan.ts`
  - Change: Read from subscriptions table
  - Return: Plan config + subscription status

- [x] **TASK-2.5:** Add environment variables
  - File: `.env.example`
  - Add: DODO_STARTER_MONTHLY_PRODUCT_ID
  - Add: DODO_STARTER_YEARLY_PRODUCT_ID (optional)

### Decisions (for agent reference):
- Trial period: 14 days
- Quota enforcement: Soft gate (show prompt, don't block)
- Downgrade: At period end, not immediate

---

## Story 3: billing-lifecycle-start-cancel-resume
**Status:** ✅ COMPLETE

### Tasks:

- [x] **TASK-3.1:** Create checkout initiation endpoint
  - File: `src/app/api/app/subscriptions/checkout/route.ts`
  - Method: POST
  - Input: { planTier: 'starter' }
  - Output: { checkoutUrl: string }

- [x] **TASK-3.2:** Create checkout success handler
  - File: `src/app/api/app/subscriptions/success/route.ts`
  - Handle: Redirect from Dodo after payment
  - Action: Verify payment, redirect to /app

- [x] **TASK-3.3:** Implement cancel flow
  - Verify: POST /api/app/subscriptions/cancel works
  - Test: User can cancel, keeps features until period end

- [x] **TASK-3.4:** Implement resume flow
  - Verify: POST /api/app/subscriptions/resume works
  - Test: User can resume before period ends

- [x] **TASK-3.5:** Add subscription to /api/app/me response
  - File: `src/app/api/app/me/route.ts`
  - Add: subscription object to response
  - Include: status, planTier, currentPeriodEnd

---

## Story 4: soft-gating-and-upgrade-ctas
**Status:** ✅ COMPLETE

### Tasks:

- [x] **TASK-4.1:** Create UpgradeBanner component
  - File: `src/components/ui/upgrade-banner.tsx`
  - Props: { feature: string, currentPlan: string }
  - Style: Gentle, non-intrusive

- [x] **TASK-4.2:** Add upgrade CTA to inbox (free users)
  - Location: Review inbox page
  - Condition: Show if planTier === 'free'
  - Message: "Upgrade for unlimited reviews and email alerts"

- [x] **TASK-4.3:** Add upgrade CTA to alerts (free users)
  - Location: Alerts settings page
  - Condition: Show if planTier === 'free'
  - Message: "Email alerts are a Starter feature"

- [x] **TASK-4.4:** Create billing settings page
  - File: `src/app/(in-app)/app/settings/billing/page.tsx`
  - Show: Current plan, usage, upgrade/cancel buttons
  - Pattern: Follow existing settings page structure

---

## Agent Instructions

When starting a task:
1. Read this file first
2. Find the next unchecked task
3. Implement ONLY that task
4. Mark task as complete: `- [x]`
5. Update "Status" if story is complete
6. Commit with message: `feat(sprint-2): TASK-X.X description`

When blocked:
1. Add note under the task: `⚠️ BLOCKED: reason`
2. Move to next unblocked task
3. Flag in commit message

When completing a story:
1. Mark all tasks as `[x]`
2. Update story status to `✅ COMPLETE`
3. Move to next story

---

## Reference Files

- Sprint plan: `sprint-status.yaml`
- Architecture: `architecture.md`
- Naming rules: `project-context.md`
- PRD: `prd.md`
