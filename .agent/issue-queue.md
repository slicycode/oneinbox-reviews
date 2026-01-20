# OneInbox Reviews - Issue Queue

Issues to process in order. Mark `[x]` when complete.

---

## High Priority

- [x] **ONE-45** | Implement error tracking (Sentry)
  - Category: Tech Debt
  - Install @sentry/nextjs, configure client and server, set up source maps
  - Files: sentry.client.config.ts, sentry.server.config.ts, next.config.js

- [ ] **ONE-44** | Set up CI/CD pipeline
  - Category: Tech Debt
  - GitHub Actions for lint, typecheck, test, build on PR. Deploy on merge to main
  - Files: .github/workflows/

- [ ] **ONE-47** | Security audit of authentication flows
  - Category: Security
  - Audit NextAuth.js config, session management, token handling, API protection
  - Files: auth config, API routes, middleware

- [ ] **ONE-48** | Implement rate limiting on all API endpoints
  - Category: Security
  - Add rate limiting using upstash/ratelimit. Stricter limits for auth/email endpoints
  - Files: API routes, middleware

- [ ] **ONE-49** | Input validation audit
  - Category: Security
  - Audit all user inputs, ensure zod validation, check for injection vulnerabilities
  - Files: API routes, forms, validation schemas

- [ ] **ONE-34** | Design: Update color palette and brand colors
  - Category: Design
  - Define new primary/secondary brand colors in globals.css for light/dark modes
  - Files: globals.css, tailwind.config.ts

- [ ] **ONE-55** | Design: Rework marketing/landing page with custom content
  - Category: Design
  - Complete landing page redesign - requires design decisions first
  - Files: landing page components

---

## Medium Priority

- [ ] **ONE-43** | Add comprehensive test coverage
  - Category: Tech Debt
  - Unit tests for database queries, utilities, API handlers using vitest
  - Files: __tests__/, vitest.config.ts

- [ ] **ONE-46** | Add performance monitoring
  - Category: Performance / Tech Debt
  - Track Core Web Vitals, API response times using Sentry Performance
  - Files: instrumentation.ts, monitoring utils

- [ ] **ONE-50** | GDPR compliance review
  - Category: Security
  - Privacy policy, data export/deletion endpoints, cookie consent
  - Files: privacy page, API routes, legal pages

- [ ] **ONE-51** | Database query optimization
  - Category: Performance
  - Add indexes, optimize review queries and dashboard aggregations
  - Files: schema, queries, indexes

- [ ] **ONE-53** | Image optimization
  - Category: Performance
  - Convert to WebP/AVIF, use Next.js Image component, lazy loading
  - Files: images, components using images

- [ ] **ONE-35** | Design: Update typography system
  - Category: Design
  - Install custom fonts via next/font, update font-sans CSS variable
  - Files: globals.css, layout.tsx, fonts

- [ ] **ONE-36** | Design: Refine component styling (buttons, cards, inputs)
  - Category: Design
  - Update focus states, borders, shadows for consistent design system
  - Files: globals.css, component styles

- [ ] **ONE-31** | Remove waitlist page
  - Category: Cleanup
  - Delete: src/app/(website-layout)/join-waitlist/, remove nav links
  - Files: app routes, navigation

- [ ] **ONE-29** | Remove IndieKit branding component
  - Category: Cleanup
  - Delete: src/components/built-with-indiekit.tsx
  - Files: src/components/

---

## Low Priority

- [ ] **ONE-52** | Implement caching layer
  - Category: Performance
  - Cache user session data, dashboard metrics, plan definitions
  - Files: cache utils, API routes

- [ ] **ONE-54** | Bundle size optimization
  - Category: Performance
  - Dynamic imports, remove duplicates, code splitting
  - Files: imports, next.config.js

- [ ] **ONE-37** | Design: Polish dark mode theme
  - Category: Design
  - Review dark mode colors, ensure WCAG AA contrast ratios
  - Files: globals.css

- [ ] **ONE-39** | Remove unused npm dependencies
  - Category: Cleanup
  - Run depcheck, remove unused packages
  - Files: package.json

- [ ] **ONE-28** | Remove unused logo SVG components (6 files)
  - Category: Cleanup
  - Delete: Gemini.tsx, GooglePaLM.tsx, MagicUI.tsx, MediaWiki.tsx, Replit.tsx, VSCodium.tsx
  - Files: src/components/logos/

---

## Design System & UX Improvements

- [ ] **ONE-56** | Fix animation durations exceeding 400ms for UI elements
  - Category: Design
  - Reduce hero section and text effect animations to ≤400ms per Emil Kowalski guidelines
  - Files: hero-section.tsx, text-effect.tsx

- [ ] **ONE-57** | Replace `transition: all` and height animations with transform/opacity
  - Category: Performance / Design
  - Use GPU-accelerated transforms instead of layout-triggering properties
  - Files: tailwind.config.ts, accordion components

- [ ] **ONE-58** | Add `prefers-reduced-motion` support for all animations
  - Category: Design / Accessibility
  - Respect user motion preferences for vestibular disorder accessibility
  - Files: text-effect.tsx, hero-section.tsx, animation components

- [ ] **ONE-59** | Fix layout shift issues with dynamic content and numbers
  - Category: Design
  - Use tabular-nums and fixed widths for dynamic number displays
  - Files: UnreadMessagesBell.tsx, dashboard components

- [ ] **ONE-60** | Add `@media (hover: hover)` guards for all hover effects
  - Category: Design
  - Prevent stuck hover states on touch devices
  - Files: header.tsx, badge.tsx, button components

- [ ] **ONE-61** | Fix input font sizes to prevent iOS auto-zoom
  - Category: Design
  - Ensure all inputs are ≥16px on mobile to prevent Safari zoom
  - Files: input.tsx, textarea.tsx, select.tsx

- [ ] **ONE-62** | Implement consistent z-index scale across the application
  - Category: Design
  - Create z-index hierarchy: base → dropdown → sticky → modal → toast
  - Files: dialog.tsx, dropdown-menu.tsx, sheet.tsx, sonner config

- [ ] **ONE-63** | Improve accessibility: aria-labels, focus states, and keyboard navigation
  - Category: Accessibility
  - Add proper ARIA attributes, focus-visible states, and keyboard support
  - Files: theme-switcher.tsx, share-button.tsx, interactive components

- [ ] **ONE-64** | Replace hardcoded colors with design tokens
  - Category: Design
  - Use semantic tokens like text-muted-foreground instead of gray-600
  - Files: share-button.tsx, components with hardcoded colors

- [ ] **ONE-65** | Optimize blur filter animations for performance
  - Category: Performance / Design
  - Replace expensive CSS blur filters with opacity-only animations
  - Files: text-effect.tsx

---

## Backlog (Needs Triage)

- [ ] **ONE-41** | Redirect back to upgrade flow after completing billing details
  - Category: Improvement
  - Store intended plan in URL params before redirect to billing
  - Files: billing form, upgrade flow
  - Note: Implementation may already exist - verify status

---

## Progress Tracking

| Status | Count |
|--------|-------|
| Total  | 32    |
| Done   | 1     |
| Remaining | 31 |

Last updated: 2026-01-21
