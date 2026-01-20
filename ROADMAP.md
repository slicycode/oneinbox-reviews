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

### In Progress (Sprint 3)
- Server-side enforcement of plan limits
- Review limit enforcement (50 reviews for Free)
- Data retention enforcement

---

## Pre-MVP Polish (Sprint 4)

### UX/UI Overhaul

#### Billing & Subscription UI
- [ ] Redesign billing page with clearer plan comparison
- [ ] Add visual pricing table component
- [ ] Improve upgrade flow with feature highlights
- [ ] Add subscription status indicators throughout app
- [ ] Fix plan limit display consistency across all pages

#### Dashboard & Navigation
- [ ] Create proper dashboard landing page with key metrics
- [ ] Improve navigation structure and information architecture
- [ ] Add onboarding checklist for new users
- [ ] Implement empty states for all views

#### Review Inbox Improvements
- [ ] Add review filtering and sorting options
- [ ] Implement review search functionality
- [ ] Add bulk actions for review management
- [ ] Improve review card design and readability

#### Settings & Account
- [ ] Redesign settings page layout
- [ ] Add account deletion flow
- [ ] Improve Google account connection UI
- [ ] Add notification preferences

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

## Technical Debt & Infrastructure

### Code Quality
- [ ] Add comprehensive test coverage
- [ ] Set up CI/CD pipeline
- [ ] Implement error tracking (Sentry)
- [ ] Add performance monitoring

### Security
- [ ] Security audit of authentication flows
- [ ] Rate limiting on all API endpoints
- [ ] Input validation audit
- [ ] GDPR compliance review

### Performance
- [ ] Database query optimization
- [ ] Implement caching layer
- [ ] Image optimization
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
