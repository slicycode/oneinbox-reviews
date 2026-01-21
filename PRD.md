# Product Requirements Document

> Ralph picks tasks from this file. Check items off as they're completed.

## Current Sprint: Design & Accessibility

### High Priority

- [ ] **ONE-66**: Fix Image component in testimonials section
  - File: `src/components/website/testimonials.tsx:73-78`
  - Issue: Image uses `fill` prop with explicit h-10 w-10 classes (conflict)
  - Fix: Remove `fill`, add explicit `width={40} height={40}` props

- [ ] **ONE-67**: Fix invalid HTML structure in super-admin users table
  - File: `src/app/super-admin/users/page.tsx:107-117`
  - Issue: Link wraps TableCell (invalid HTML)
  - Fix: Move Link inside TableCell, wrap Avatar and name with Link

- [ ] **ONE-61**: Fix input font sizes to prevent iOS auto-zoom
  - Files: `src/components/ui/input.tsx`, `src/components/ui/textarea.tsx`
  - Issue: Font sizes below 16px trigger iOS Safari zoom
  - Fix: Ensure all inputs use `text-base` (16px) on mobile

- [ ] **ONE-59**: Fix layout shift issues with dynamic content
  - File: `src/components/UnreadMessagesBell.tsx`
  - Issue: Badge width changes when number grows (9 to 10)
  - Fix: Add `min-w-[1.25rem]` and `tabular-nums` classes

### Medium Priority

- [ ] **ONE-68**: Add focus-visible styles to ShareButton
  - File: `src/components/share-button.tsx:26-30`
  - Issue: Button lacks keyboard focus indicator
  - Fix: Add `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`

- [ ] **ONE-69**: Replace native confirm() with AlertDialog
  - File: `src/app/super-admin/coupons/page.tsx:216`
  - Issue: Uses `window.confirm()` which is not accessible
  - Fix: Use AlertDialog component from shadcn/ui

- [ ] **ONE-65**: Optimize blur filter animations
  - File: `src/components/ui/text-effect.tsx:74-93`
  - Issue: CSS blur filters are GPU-expensive
  - Fix: Replace blur with opacity-only or add `transform-gpu`

- [ ] **ONE-62**: Implement consistent z-index scale
  - Files: dialog.tsx, alert-dialog.tsx, dropdown-menu.tsx, sheet.tsx
  - Issue: Multiple components use z-50 without hierarchy
  - Fix: Create z-index scale (dropdown:40, sticky:30, modal:50, toast:60)

- [ ] **ONE-60**: Add hover media query guards
  - Files: header.tsx, badge.tsx, button components
  - Issue: Hover states get stuck on touch devices
  - Fix: Use `@media (hover: hover)` or Tailwind hover variant

- [ ] **ONE-58**: Add prefers-reduced-motion support
  - Files: text-effect.tsx, hero-section.tsx, infinite-slider.tsx
  - Issue: Animations don't respect user motion preferences
  - Fix: Add `motion-safe:` and `motion-reduce:` variants

- [ ] **ONE-57**: Replace transition-all with transform/opacity
  - Files: tailwind.config.ts (accordion), hero-section.tsx
  - Issue: `transition-all` and height animations cause layout recalcs
  - Fix: Use only transform and opacity for animations

### Low Priority

- [ ] **ONE-70**: Replace native img tags with Next.js Image
  - File: `src/components/tailark/pricing.tsx:47-74`
  - Issue: Native img tags miss optimization
  - Fix: Add domain to next.config, use Image component

- [ ] **ONE-64**: Replace hardcoded colors with design tokens
  - File: `src/components/share-button.tsx:28`
  - Issue: Uses `text-gray-600` instead of semantic tokens
  - Fix: Use `text-muted-foreground` and `text-foreground`

- [ ] **ONE-56**: Fix animation durations exceeding 400ms
  - Files: hero-section.tsx, text-effect.tsx, input-otp.tsx
  - Issue: Some animations exceed 400ms (feel sluggish)
  - Fix: Reduce to 150-400ms per Emil Kowalski guidelines

---

## Completion

When all tasks are checked, output:
```
<promise>COMPLETE</promise>
```
