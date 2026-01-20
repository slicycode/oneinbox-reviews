# Ralph-Loop Prompts for OneInbox Reviews

Shell-safe prompts for ralph-wiggum:ralph-loop. Avoid angle brackets, single quotes, and special shell operators.

---

## Improvement Issues

### ONE-40: Show billing details prompt before plan upgrade
```
/ralph-wiggum:ralph-loop Implement ONE-40: Add billing details check before upgrade. When user clicks upgrade without billing details, show a modal prompting them to complete billing first. Check billing details exist in the upgrade flow, if missing show modal or redirect to billing form. Commit as feat ONE-40 Add billing details prompt before plan upgrade. Push to main and update Linear ONE-40 to Done. Output PROMISE ONE-40 COMPLETE when done. --completion-promise "ONE-40 COMPLETE" --max-iterations 12
```

### ONE-41: Redirect back to upgrade flow after completing billing details
```
/ralph-wiggum:ralph-loop Implement ONE-41: After user completes billing details, redirect them back to the upgrade flow. Store intended plan in URL params or session before redirect to billing. After billing form submit, check for pending upgrade and redirect. Commit as feat ONE-41 Redirect back to upgrade after billing. Push to main and update Linear ONE-41 to Done. Output PROMISE ONE-41 COMPLETE when done. --completion-promise "ONE-41 COMPLETE" --max-iterations 12
```

---

## Cleanup Issues

### ONE-28: Remove unused logo SVG components
```
/ralph-wiggum:ralph-loop Implement ONE-28: Remove 6 unused logo SVG files - Gemini.tsx, GooglePaLM.tsx, MagicUI.tsx, MediaWiki.tsx, Replit.tsx, VSCodium.tsx from src/components/logos. Verify no imports break. Run build to confirm. Commit as chore ONE-28 Remove unused logo SVG components. Push to main and update Linear ONE-28 to Done. Output PROMISE ONE-28 COMPLETE when done. --completion-promise "ONE-28 COMPLETE" --max-iterations 8
```

### ONE-29: Remove IndieKit branding component
```
/ralph-wiggum:ralph-loop Implement ONE-29: Remove src/components/built-with-indiekit.tsx file. Check for any imports and remove them. Run build to verify nothing breaks. Commit as chore ONE-29 Remove IndieKit branding component. Push to main and update Linear ONE-29 to Done. Output PROMISE ONE-29 COMPLETE when done. --completion-promise "ONE-29 COMPLETE" --max-iterations 8
```

### ONE-31: Remove waitlist page
```
/ralph-wiggum:ralph-loop Implement ONE-31: Remove the entire src/app/website-layout/join-waitlist directory. Remove any navigation links pointing to the waitlist page. Run build to verify. Commit as chore ONE-31 Remove waitlist page. Push to main and update Linear ONE-31 to Done. Output PROMISE ONE-31 COMPLETE when done. --completion-promise "ONE-31 COMPLETE" --max-iterations 8
```

### ONE-39: Remove unused npm dependencies
```
/ralph-wiggum:ralph-loop Implement ONE-39: Run npx depcheck to find unused packages. Review each unused package and remove if truly unused. Run pnpm install and build to verify. Commit as chore ONE-39 Remove unused npm dependencies. Push to main and update Linear ONE-39 to Done. Output PROMISE ONE-39 COMPLETE when done. --completion-promise "ONE-39 COMPLETE" --max-iterations 10
```

---

## Design Issues

### ONE-34: Update color palette and brand colors
```
/ralph-wiggum:ralph-loop Implement ONE-34: Update color palette in globals.css. Define new primary and secondary brand colors for OneInbox Reviews. Update CSS variables for light and dark modes. Verify contrast ratios meet accessibility standards. Commit as feat ONE-34 Update color palette and brand colors. Push to main and update Linear ONE-34 to Done. Output PROMISE ONE-34 COMPLETE when done. --completion-promise "ONE-34 COMPLETE" --max-iterations 12
```

### ONE-35: Update typography system
```
/ralph-wiggum:ralph-loop Implement ONE-35: Update typography in globals.css. Choose and install fonts via next/font. Update font-sans CSS variable. Define heading and body text scales. Verify fonts load correctly. Commit as feat ONE-35 Update typography system. Push to main and update Linear ONE-35 to Done. Output PROMISE ONE-35 COMPLETE when done. --completion-promise "ONE-35 COMPLETE" --max-iterations 12
```

### ONE-36: Refine component styling
```
/ralph-wiggum:ralph-loop Implement ONE-36: Refine styling of buttons, cards, and inputs in globals.css. Update focus states and borders. Ensure consistent shadows and backgrounds. Test all component variants. Commit as feat ONE-36 Refine component styling. Push to main and update Linear ONE-36 to Done. Output PROMISE ONE-36 COMPLETE when done. --completion-promise "ONE-36 COMPLETE" --max-iterations 12
```

### ONE-37: Polish dark mode theme
```
/ralph-wiggum:ralph-loop Implement ONE-37: Review and polish dark mode colors in globals.css. Ensure primary colors have appropriate dark variants. Check contrast ratios for WCAG AA. Test all pages in dark mode. Commit as feat ONE-37 Polish dark mode theme. Push to main and update Linear ONE-37 to Done. Output PROMISE ONE-37 COMPLETE when done. --completion-promise "ONE-37 COMPLETE" --max-iterations 12
```

### ONE-55: Rework marketing landing page
```
/ralph-wiggum:ralph-loop Implement ONE-55: Rework the marketing landing page. Replace IndieKit boilerplate with OneInbox Reviews branding and messaging. Create hero section, features, and CTA blocks. Use existing Tailark components. Commit as feat ONE-55 Rework marketing landing page. Push to main and update Linear ONE-55 to Done. Output PROMISE ONE-55 COMPLETE when done. --completion-promise "ONE-55 COMPLETE" --max-iterations 15
```

---

## Tech Debt Issues

### ONE-43: Add comprehensive test coverage
```
/ralph-wiggum:ralph-loop Implement ONE-43: Add test coverage for database queries, utility functions, and API handlers. Use vitest for unit tests. Focus on critical paths first. Commit as test ONE-43 Add comprehensive test coverage. Push to main and update Linear ONE-43 to Done. Output PROMISE ONE-43 COMPLETE when done. --completion-promise "ONE-43 COMPLETE" --max-iterations 15
```

### ONE-44: Set up CI/CD pipeline
```
/ralph-wiggum:ralph-loop Implement ONE-44: Set up GitHub Actions CI/CD pipeline. Add workflow for linting, type checking, tests, and build on PR. Add deploy workflow on merge to main. Commit as ci ONE-44 Set up CI/CD pipeline. Push to main and update Linear ONE-44 to Done. Output PROMISE ONE-44 COMPLETE when done. --completion-promise "ONE-44 COMPLETE" --max-iterations 12
```

### ONE-45: Implement error tracking with Sentry
```
/ralph-wiggum:ralph-loop Implement ONE-45: Install and configure Sentry for Next.js. Add sentry.client.config.ts and sentry.server.config.ts. Set up source maps and release tracking. Commit as feat ONE-45 Implement error tracking Sentry. Push to main and update Linear ONE-45 to Done. Output PROMISE ONE-45 COMPLETE when done. --completion-promise "ONE-45 COMPLETE" --max-iterations 12
```

### ONE-46: Add performance monitoring
```
/ralph-wiggum:ralph-loop Implement ONE-46: Add performance monitoring for Core Web Vitals and API response times. Use Sentry Performance or similar. Track frontend and backend metrics. Commit as feat ONE-46 Add performance monitoring. Push to main and update Linear ONE-46 to Done. Output PROMISE ONE-46 COMPLETE when done. --completion-promise "ONE-46 COMPLETE" --max-iterations 12
```

---

## Security Issues

### ONE-47: Security audit of authentication flows
```
/ralph-wiggum:ralph-loop Implement ONE-47: Audit NextAuth.js config, session management, and token handling. Check API route and server action protection. Review resource ownership checks. Document findings and fix issues. Commit as security ONE-47 Security audit of auth flows. Push to main and update Linear ONE-47 to Done. Output PROMISE ONE-47 COMPLETE when done. --completion-promise "ONE-47 COMPLETE" --max-iterations 12
```

### ONE-48: Implement rate limiting on API endpoints
```
/ralph-wiggum:ralph-loop Implement ONE-48: Add rate limiting to all API endpoints. Use stricter limits for auth and email endpoints. Implement using upstash ratelimit or similar. Add rate limit headers to responses. Commit as security ONE-48 Implement rate limiting. Push to main and update Linear ONE-48 to Done. Output PROMISE ONE-48 COMPLETE when done. --completion-promise "ONE-48 COMPLETE" --max-iterations 12
```

### ONE-49: Input validation audit
```
/ralph-wiggum:ralph-loop Implement ONE-49: Audit all user inputs across API routes and forms. Ensure proper validation with zod schemas. Check for injection vulnerabilities. Add sanitization where needed. Commit as security ONE-49 Input validation audit. Push to main and update Linear ONE-49 to Done. Output PROMISE ONE-49 COMPLETE when done. --completion-promise "ONE-49 COMPLETE" --max-iterations 12
```

### ONE-50: GDPR compliance review
```
/ralph-wiggum:ralph-loop Implement ONE-50: Review GDPR compliance for user data handling. Add privacy policy page if missing. Implement data export and deletion endpoints. Document data retention policies. Commit as compliance ONE-50 GDPR compliance review. Push to main and update Linear ONE-50 to Done. Output PROMISE ONE-50 COMPLETE when done. --completion-promise "ONE-50 COMPLETE" --max-iterations 12
```

---

## Performance Issues

### ONE-51: Database query optimization
```
/ralph-wiggum:ralph-loop Implement ONE-51: Optimize database queries for review listing and dashboard aggregations. Add missing indexes. Use EXPLAIN ANALYZE to identify slow queries. Implement query caching where appropriate. Commit as perf ONE-51 Database query optimization. Push to main and update Linear ONE-51 to Done. Output PROMISE ONE-51 COMPLETE when done. --completion-promise "ONE-51 COMPLETE" --max-iterations 12
```

### ONE-52: Implement caching layer
```
/ralph-wiggum:ralph-loop Implement ONE-52: Add caching for user session data, dashboard metrics, and plan definitions. Use Redis or in-memory cache. Set appropriate TTLs. Add cache invalidation logic. Commit as perf ONE-52 Implement caching layer. Push to main and update Linear ONE-52 to Done. Output PROMISE ONE-52 COMPLETE when done. --completion-promise "ONE-52 COMPLETE" --max-iterations 12
```

### ONE-53: Image optimization
```
/ralph-wiggum:ralph-loop Implement ONE-53: Optimize images across the app. Convert to WebP/AVIF formats. Use Next.js Image component everywhere. Add lazy loading for below-fold images. Commit as perf ONE-53 Image optimization. Push to main and update Linear ONE-53 to Done. Output PROMISE ONE-53 COMPLETE when done. --completion-promise "ONE-53 COMPLETE" --max-iterations 12
```

### ONE-54: Bundle size optimization
```
/ralph-wiggum:ralph-loop Implement ONE-54: Optimize JavaScript bundle size. Run bundle analyzer. Add dynamic imports for heavy components. Remove duplicate packages. Implement code splitting. Commit as perf ONE-54 Bundle size optimization. Push to main and update Linear ONE-54 to Done. Output PROMISE ONE-54 COMPLETE when done. --completion-promise "ONE-54 COMPLETE" --max-iterations 12
```

---

## Design System & UX Issues

### ONE-56: Fix animation durations exceeding 400ms
```
/ralph-wiggum:ralph-loop Implement ONE-56: Fix animation durations exceeding 400ms for UI elements. Find animations using duration-500 or higher in hero-section.tsx, text-effect.tsx and other components. Reduce to 300-400ms max per Emil Kowalski guidelines. Test that animations still feel smooth. Commit as fix ONE-56 Fix animation durations exceeding 400ms. Push to main and update Linear ONE-56 to Done. Output PROMISE ONE-56 COMPLETE when done. --completion-promise "ONE-56 COMPLETE" --max-iterations 10
```

### ONE-57: Replace transition-all with transform and opacity
```
/ralph-wiggum:ralph-loop Implement ONE-57: Replace transition-all and height animations with transform and opacity. Find transition-all classes and accordion height animations in tailwind.config.ts and components. Use GPU-accelerated transforms instead of layout-triggering properties. Commit as perf ONE-57 Replace transition-all with transform opacity. Push to main and update Linear ONE-57 to Done. Output PROMISE ONE-57 COMPLETE when done. --completion-promise "ONE-57 COMPLETE" --max-iterations 10
```

### ONE-58: Add prefers-reduced-motion support
```
/ralph-wiggum:ralph-loop Implement ONE-58: Add prefers-reduced-motion support for all animations. Add motion-safe and motion-reduce variants to animated components. Check text-effect.tsx, hero-section.tsx, and other animation components. Disable or simplify animations when user prefers reduced motion. Commit as a11y ONE-58 Add prefers-reduced-motion support. Push to main and update Linear ONE-58 to Done. Output PROMISE ONE-58 COMPLETE when done. --completion-promise "ONE-58 COMPLETE" --max-iterations 10
```

### ONE-59: Fix layout shift with dynamic content
```
/ralph-wiggum:ralph-loop Implement ONE-59: Fix layout shift issues with dynamic content and numbers. Add tabular-nums font-variant to number displays. Use fixed widths or min-widths for dynamic badges like UnreadMessagesBell. Prevent CLS when content changes. Commit as fix ONE-59 Fix layout shift with dynamic content. Push to main and update Linear ONE-59 to Done. Output PROMISE ONE-59 COMPLETE when done. --completion-promise "ONE-59 COMPLETE" --max-iterations 10
```

### ONE-60: Add hover media query guards
```
/ralph-wiggum:ralph-loop Implement ONE-60: Add media hover hover guards for all hover effects. Find hover classes in header.tsx, badge.tsx, and button components. Wrap hover styles with media query to prevent stuck states on touch devices. Use Tailwind hover-hover variant or custom CSS. Commit as fix ONE-60 Add hover media query guards. Push to main and update Linear ONE-60 to Done. Output PROMISE ONE-60 COMPLETE when done. --completion-promise "ONE-60 COMPLETE" --max-iterations 10
```

### ONE-61: Fix input font sizes for iOS
```
/ralph-wiggum:ralph-loop Implement ONE-61: Fix input font sizes to prevent iOS auto-zoom. Ensure all input, textarea, and select elements use at least 16px font size on mobile. Check input.tsx, textarea.tsx, select.tsx components. Use text-base class on mobile breakpoints. Commit as fix ONE-61 Fix input font sizes for iOS. Push to main and update Linear ONE-61 to Done. Output PROMISE ONE-61 COMPLETE when done. --completion-promise "ONE-61 COMPLETE" --max-iterations 10
```

### ONE-62: Implement consistent z-index scale
```
/ralph-wiggum:ralph-loop Implement ONE-62: Implement consistent z-index scale across the application. Create z-index hierarchy - base 0, dropdown 10, sticky 20, modal 30, toast 40. Update dialog.tsx, alert-dialog.tsx, dropdown-menu.tsx, sheet.tsx, and sonner config. Document the scale in comments. Commit as fix ONE-62 Implement consistent z-index scale. Push to main and update Linear ONE-62 to Done. Output PROMISE ONE-62 COMPLETE when done. --completion-promise "ONE-62 COMPLETE" --max-iterations 10
```

### ONE-63: Improve accessibility attributes
```
/ralph-wiggum:ralph-loop Implement ONE-63: Improve accessibility with aria-labels, focus states, and keyboard navigation. Add proper aria-label attributes to icon buttons in theme-switcher.tsx and share-button.tsx. Add focus-visible styles for keyboard users. Ensure interactive elements are keyboard accessible. Commit as a11y ONE-63 Improve accessibility attributes. Push to main and update Linear ONE-63 to Done. Output PROMISE ONE-63 COMPLETE when done. --completion-promise "ONE-63 COMPLETE" --max-iterations 10
```

### ONE-64: Replace hardcoded colors with design tokens
```
/ralph-wiggum:ralph-loop Implement ONE-64: Replace hardcoded colors with design tokens. Find hardcoded color classes like text-gray-600 in share-button.tsx and other components. Replace with semantic tokens like text-muted-foreground. Ensure consistency across light and dark modes. Commit as fix ONE-64 Replace hardcoded colors with design tokens. Push to main and update Linear ONE-64 to Done. Output PROMISE ONE-64 COMPLETE when done. --completion-promise "ONE-64 COMPLETE" --max-iterations 10
```

### ONE-65: Optimize blur filter animations
```
/ralph-wiggum:ralph-loop Implement ONE-65: Optimize blur filter animations for performance. Find CSS blur filter usage in text-effect.tsx and other components. Replace expensive blur animations with opacity-only alternatives or use will-change hints. Test performance improvement. Commit as perf ONE-65 Optimize blur filter animations. Push to main and update Linear ONE-65 to Done. Output PROMISE ONE-65 COMPLETE when done. --completion-promise "ONE-65 COMPLETE" --max-iterations 10
```

---

## Notes on Shell-Safe Prompts

1. **Avoid angle brackets** - Use PROMISE instead of wrapping in tags
2. **Avoid single quotes** - Rephrase sentences or omit quoted text
3. **Keep prompts concise** - Shorter prompts have fewer parsing issues
4. **Use simple punctuation** - Periods and commas are safe
5. **Double quotes in flags are OK** - The completion-promise flag handles them
