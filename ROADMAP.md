# OneInbox Reviews - Product Roadmap

> This document outlines the product roadmap for OneInbox Reviews MVP and beyond.
> Tasks will be synced to Linear for detailed tracking and sprint planning.

---

## Current State (January 2025)

### Completed
- Google OAuth integration for Business Profile access
- Review fetching and display (inbox view)
- DodoPayments subscription integration
- Free and Starter plan tiers
- Email alerts feature (Starter only)
- Basic billing management UI
- Soft-gating upgrade CTAs
- Server-side enforcement of plan limits (Sprint 3)
- Review limit enforcement (50 reviews for Free) (Sprint 3)
- Data retention enforcement (Sprint 3)

---

## Pre-MVP Polish (Sprint 4) ✓ Complete

### UX/UI Overhaul

#### Billing & Subscription UI
- [x] Redesign billing page with clearer plan comparison
- [x] Add visual pricing table component
- [x] Improve upgrade flow with feature highlights
- [x] Add subscription status indicators throughout app
- [x] Fix plan limit display consistency across all pages

#### Dashboard & Navigation
- [x] Create proper dashboard landing page with key metrics
- [x] Improve navigation structure and information architecture
- [x] Add onboarding checklist for new users
- [x] Implement empty states for all views

#### Review Inbox Improvements
- [x] Add review filtering and sorting options
- [x] Implement review search functionality
- [x] Add bulk actions for review management
- [x] Improve review card design and readability

#### Settings & Account
- [x] Redesign settings page layout
- [x] Add account deletion flow
- [x] Improve Google account connection UI
- [x] Add notification preferences

---

## Post-MVP Features (Future Sprints)

### Analytics & Insights
- [ ] Review sentiment analysis
- [ ] Rating trends over time
- [ ] Response rate metrics
- [ ] Comparison with industry benchmarks

### Review Response Features
- [ ] AI-powered response suggestions
- [ ] Response templates
- [ ] Direct reply to Google reviews
- [ ] Response scheduling

### Multi-Platform Support
- [ ] Yelp integration
- [ ] Facebook reviews integration
- [ ] TripAdvisor integration
- [ ] Unified inbox for all platforms

### Team Features (Business Plan)
- [ ] Multi-user workspace support
- [ ] Role-based permissions
- [ ] Team activity log
- [ ] Shared response templates

### Advanced Notifications
- [ ] Slack integration for alerts
- [ ] Webhook support
- [ ] Custom alert rules (negative reviews only, etc.)
- [ ] Daily/weekly digest emails

---

## Design & Accessibility (Sprint 5)

> Issues from Web Interface Guidelines audit. Tracked in Linear with "Design" label.

### High Priority
- [ ] [ONE-66] Fix Image component in testimonials section (conflicting fill prop)
- [ ] [ONE-67] Fix invalid HTML structure in super-admin users table (Link wrapping TableCell)
- [ ] [ONE-61] Fix input font sizes to prevent iOS auto-zoom
- [ ] [ONE-59] Fix layout shift issues with dynamic content and numbers

### Medium Priority
- [ ] [ONE-68] Add focus-visible styles to ShareButton
- [ ] [ONE-69] Replace native confirm() with AlertDialog in coupons page
- [ ] [ONE-65] Optimize blur filter animations for performance
- [ ] [ONE-62] Implement consistent z-index scale across the application
- [ ] [ONE-60] Add `@media (hover: hover)` guards for all hover effects
- [ ] [ONE-58] Add `prefers-reduced-motion` support for all animations
- [ ] [ONE-57] Replace `transition: all` and height animations with transform/opacity

### Low Priority
- [ ] [ONE-70] Replace native img tags with Next.js Image in Tailark pricing
- [ ] [ONE-64] Replace hardcoded colors with design tokens
- [ ] [ONE-56] Fix animation durations exceeding 400ms for UI elements

---

## Technical Debt & Infrastructure

### Code Quality
- [x] Add comprehensive test coverage
- [x] Set up CI/CD pipeline
- [x] Implement error tracking (Sentry)
- [x] Add performance monitoring

### Security
- [ ] Security audit of authentication flows
- [ ] Rate limiting on all API endpoints
- [ ] Input validation audit
- [x] GDPR compliance review

### Performance
- [x] Database query optimization
- [ ] Implement caching layer
- [x] Image optimization
- [ ] Bundle size optimization

---

## Plan Feature Matrix

| Feature | Free | Starter | Business (Future) |
|---------|------|---------|-------------------|
| Reviews | 50 max | Unlimited | Unlimited |
| Google Accounts | 1 | 1 | 5 |
| Email Alerts | No | Yes | Yes |
| Data Retention | 30 days | 365 days | Unlimited |
| Advanced Filters | No | Yes | Yes |
| AI Responses | No | No | Yes |
| Team Members | 1 | 1 | 10 |
| Priority Support | No | No | Yes |

---

## Notes

- All tasks should be created as Linear issues before starting work
- Use conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- Create feature branches from `main`
- PRs require passing checks before merge
