---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
inputDocuments: []
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 0
classification:
  projectType: web_app
  domain: reputation management / SMB SaaS (local business marketing)
  complexity: medium
  projectContext: greenfield
workflowType: 'prd'
date: '2026-01-15'
---

# Product Requirements Document - OneInbox Review

**Author:** Root
**Date:** 2026-01-15

## Executive Summary

- **Problem:** SMBs and agencies must check multiple platforms manually, causing missed reviews and slow responses.
- **Vision:** unify local business reviews and enable fast, compliant responses from one dashboard.
- **Target users:** SMB owners/marketing managers and boutique agencies serving 1-20 locations.
- **Differentiator:** compliant multi-platform aggregation with email alerts and click-to-reply deep links.
- **MVP focus:** Google-first aggregation, unified inbox, response workflow, and secure auth/credential storage.

## Success Criteria

### User Success

- Owners/agency users see all reviews in one place and respond without manual platform hopping.
- Median response time drops below 4 hours; 60%+ of reviews are responded to within 24 hours.
- "Aha" moment: first negative-review alert leads to a response within 15 minutes from a single dashboard.

### Business Success

- 3 months: 40%+ weekly active response rate; 50%+ of active accounts respond from the product; feedback confirms it replaces manual checking.
- 12 months: 200-500 active accounts, 70%+ monthly retention, and meaningful MRR traction (~$20-50k depending on pricing).

### Technical Success

- Review sync every 30-60 minutes.
- Alert latency under 5 minutes.
- 99.5% uptime.
- Secure credential storage.
- Compliant integration coverage for top 2-3 platforms.

### Measurable Outcomes

- Median response time under 4 hours.
- 60%+ of reviews responded to within 24 hours.
- Weekly active response rate >40%.
- 30%+ of agency accounts export monthly review reports.
- Retention and MRR targets as above.

## Product Scope

### MVP - Minimum Viable Product

- Multi-platform review aggregation.
- Basic alerts (email/notifications).
- Response workflow from one dashboard.
- Click-to-reply deep links to platform reply pages when needed.
- Account management + secure auth/credential storage.

### Growth Features (Post-MVP)

- Sentiment analysis.
- AI reply drafting.
- Review request campaigns.
- Deeper analytics.

### Vision (Future)

- Multi-location enterprise controls.
- Advanced insights and automation for agencies.
- Expanded platform coverage and smarter prioritization.

## Pricing Plan

### Pricing Principles

- Per-business monthly subscription; optional annual discount.
- Pricing scales with team size and platform coverage.
- Free trial to reduce onboarding friction.

### Draft Tiers (subject to pilot validation)

- **Starter:** $49/mo per business, 1 user, Google only, email alerts, basic inbox/response.
- **Growth:** $99/mo per business, up to 5 users, Google + Yelp/Facebook, triage statuses, audit logs.
- **Agency:** $299/mo, up to 10 client accounts, team roles, bulk triage; multi-location add-on later.

## User Journeys

### Primary User - Owner/Marketing Manager (Success Path)

**Opening scene:** Jamie runs a 3-location restaurant group and checks Google/Yelp weekly, usually too late.  
**Rising action:** Jamie connects Google and Yelp, sees all reviews in one dashboard, and enables email alerts.  
**Climax:** A negative Yelp review arrives; within minutes Jamie gets an alert, responds from the dashboard, and receives a "resolved" follow-up.  
**Resolution:** Response time drops from days to hours; Jamie feels in control and sees reputation stabilize.

### Primary User - Owner/Marketing Manager (Edge Case / Recovery)

**Opening scene:** Jamie connects Facebook but permissions expire.  
**Rising action:** Reviews stop syncing; the dashboard shows a stale data banner and prompts re-auth.  
**Climax:** Jamie re-authenticates in 2 minutes and sees backfilled reviews.  
**Resolution:** Trust is preserved because the product surfaced the failure early and provided a fix path.

### Secondary User - Agency Account Manager

**Opening scene:** Alex manages 12 SMB clients and logs into multiple platforms daily.  
**Rising action:** Alex onboards each client, maps locations, and sets alert thresholds.  
**Climax:** Alex triages a batch of new reviews, replies quickly from a single queue, and exports a monthly CSV report for client updates.  
**Resolution:** Agency time spent on review ops drops; service quality improves.

### Admin/Ops - Internal Admin

**Opening scene:** Priya handles billing and access for a growing team.  
**Rising action:** Priya assigns roles, limits who can respond vs. view, and ensures billing is correct.  
**Climax:** A teammate leaves; Priya revokes access and transfers ownership seamlessly.  
**Resolution:** Access control and billing stay accurate with minimal admin overhead.

### Support/Troubleshooting - Support Agent

**Opening scene:** A customer reports missing Google reviews.  
**Rising action:** Support checks sync logs, sees an API quota issue, and triggers a re-sync.  
**Climax:** The customer sees new reviews appear and receives a status update.  
**Resolution:** Support resolves issues quickly using internal diagnostics.

### Optional/Future - API/Integration User

**Opening scene:** A partner platform wants to sync review data into their CRM.  
**Rising action:** Developer obtains API key and tests endpoints in sandbox.  
**Climax:** Integration pulls reviews and status changes reliably.  
**Resolution:** Partner expands automation without manual review handling.

### Tertiary/Future - Multi-location Manager / Franchise Ops

**Opening scene:** Morgan oversees 40 locations across regions.  
**Rising action:** Morgan uses location filters and bulk workflows to manage responses.  
**Climax:** A regional spike in negative feedback is detected and addressed quickly.  
**Resolution:** Ops visibility and reputation control scale across locations.

### Journey Requirements Summary

- Multi-platform connection with secure re-auth flows.
- Unified inbox/queue for reviews and responses.
- Alerts and SLA visibility (stale data, response lag).
- Role-based access and billing management.
- Support tooling: sync status, logs, and re-sync actions.
- Future: API access plus multi-location grouping and controls.

## Domain-Specific Requirements

### Compliance & Regulatory

- Must-have platforms: Google Business Profile (priority #1), Yelp, Facebook; TripAdvisor only if targeting hospitality.
- Prefer official APIs only; no scraping where prohibited.
- Respect rate limits and display requirements per platform.
- Responses must post via authorized APIs; no auto-posting without user confirmation in MVP.

### Technical Constraints

- Auth: OAuth for Google/Facebook; API key/partner access for Yelp; TripAdvisor partner API likely.
- Retention: store review/response content while account is active; delete on account closure; honor platform data deletion policies.
- Audit logs: required for responses (who/when/where), even in MVP-lite.

### Integration Requirements

- Multi-location: not required in MVP, but design to add later.
- Exports/Integrations: CSV export optional; Slack/CRM can wait.

### Risk Mitigations

- Integration risk: API quotas, access revocation, OAuth friction; mitigate with clear auth UX, refresh token handling, and graceful degradation.
- Brand risk: avoid "auto-reply" positioning; emphasize human-in-the-loop, fast response.

## Web App Specific Requirements

### Project-Type Overview

- Authenticated SPA dashboard for the core product.
- Optional lightweight MPA shell for marketing/landing pages later.

### Technical Architecture Considerations

- Client: SPA with authenticated routes; marketing pages can be static/MPA if needed.
- Data freshness: polling acceptable for MVP (5-15 min); websockets later.
- Security: secure session handling for authenticated dashboard.

### Browser Matrix

- Latest two versions of Chrome, Firefox, Safari, Edge.
- Mobile: iOS Safari and Android Chrome.

### Responsive Design

- Responsive UI required for desktop and mobile browsers.
- Priority on dashboard usability on small screens.

### Performance Targets

- Dashboard should feel fast under typical agency workloads (review list and filters).
- Polling cadence should not degrade UI responsiveness.

### SEO Strategy

- SEO not required for the app (behind login).
- Marketing pages optional; can be SEO-optimized later.

### Accessibility Level

- Target WCAG 2.1 AA for core flows (review list, response composer, alerts).

### Implementation Considerations

- SPA routing and authentication gating.
- Polling strategy plus "last sync" indicators.
- Future-proofed architecture for real-time updates.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-solving MVP to prove aggregation plus response flow works with a good-enough experience to retain users.
**Resource Requirements:** Small team with limited integration bandwidth; prioritize Google first, then Yelp/Facebook.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- Owner/manager success path: connect platforms, see unified inbox, respond fast.
- Agency manager core flow: onboard clients, triage and respond.

**Must-Have Capabilities:**

- Review aggregation for Google Business Profile integration ONLY.
- Unified review inbox
- Alerts (email).
- Click-to-reply deep links
- Single-business, single-user account

**Explicitly NOT in MVP:**

- Yelp / Facebook
- Agency workflows
- Team roles
- Audit logs
- CSV exports

### Post-MVP Features

**Phase 2 (Growth):**

- Analytics.
- Multi-location support.
- Advanced filtering/SLAs.
- Slack/CRM integration.
- Sentiment analysis (AI drafts optional).

**Phase 3 (Expansion):**

- Agency automation (bulk ops, client reporting).
- Automation rules.
- Expanded platform coverage.
- Franchise ops and multi-location at scale.
- Review request campaigns.
- AI reply assist.

### Risk Mitigation Strategy

**Technical Risks:** API access/quotas and OAuth friction; start with 1-2 platforms, validate auth UX, build robust token handling.  
**Market Risks:** Users may not switch from manual or existing tools; run paid pilots with SMBs/agencies early.  
**Resource Risks:** Small team and limited integration bandwidth; prioritize Google first and defer non-core integrations.

## Functional Requirements

All non-functional requirements are target benchmarks, not hard MVP acceptance blockers unless explicitly stated.

### Account & Access

- FR1: Business owners can create an account and sign in.
- FR2: Users can reset their password and regain access.
- FR3: Account owners can manage billing profile details.
- FR4: Account owners can invite team members and assign roles.
- FR5: Account owners can deactivate team access.

### Platform Connections & Auth

- FR6: Users can connect a Google Business Profile account.
- FR7: Users can connect Yelp and Facebook accounts (when supported).
- FR8: Users can re-authenticate when a connection expires.
- FR9: The system can show connection status per platform.
- FR10: Users can disconnect a platform.

### Review Ingestion & Sync

- FR11: The system can ingest reviews from connected platforms.
- FR12: Users can see the last sync time for each platform.
- FR13: The system can backfill reviews after re-auth.
- FR14: Users can filter reviews by platform and time range.
- FR15: Users can view review details (rating, text, author, date).

### Inbox & Triage

- FR16: Users can view a unified review inbox across platforms.
- FR17: Users can mark reviews as unread, responded, or needs follow-up.
- FR18: Users can assign a follow-up status to a review.
- FR19: Users can search reviews by keyword.
- FR20: Users can filter by rating and status.

### Responses & Workflow

- FR21: Users can compose and send responses from the dashboard.
- FR22: Users can see response history for a review.
- FR23: Users can open a platform-native reply screen via deep link from a review.
- FR24: Users can edit or delete unsent drafts.
- FR25: The system can track who responded and when.
- FR26: Users can view a log of response actions.

### Alerts & Notifications

- FR27: Users can enable email alerts for new reviews.
- FR28: Users can configure alert thresholds (e.g., negative reviews).
- FR29: Users can pause or resume alerts.
- FR30: The system can send alerts when sync fails or data is stale.

### Admin & Support Tooling

- FR31: Admins can view system health for platform syncs.
- FR32: Support agents can trigger a manual re-sync for an account.
- FR33: Admins can view audit logs for responses.

### Reporting & Export (MVP-lite)

- FR34: Users can export review data to CSV (optional MVP-lite).

### Data & Compliance

- FR35: Users can delete their account and associated data.
- FR36: The system can remove data per platform deletion policies.

## Non-Functional Requirements

### Performance

- Dashboard load time is under 2.5s on average and under 4s at p95, measured via RUM/APM in production over a rolling 30-day window, excluding planned maintenance.
- Search/filter responses are under 300ms for cached/local data and under 1s for server queries, measured via APM p95 under typical agency workloads.

### Security

- Data in transit uses TLS 1.2 or higher; data at rest uses AES-256 with managed KMS, verified by periodic security audits and cloud provider encryption reports.
- Role-based access control enforces owner, manager, agent, and admin permissions, verified by role-based access tests per release.
- Audit logs are retained for 12 months in MVP, with longer retention configurable later, measured by retention policy enforcement checks.

### Reliability

- Uptime target is 99.5% for MVP, measured by uptime monitoring over a rolling 30-day window.
- Recovery objectives: RPO 24 hours and RTO 4 hours for MVP, verified by quarterly recovery tests.

### Scalability

- Supports 50-100 active accounts in MVP and 500-2,000 active accounts within 12 months, validated by load testing and production telemetry.
- Handles 1k-5k reviews per day initially with a 10x growth buffer, measured via ingestion throughput tests.

### Accessibility

- Core flows meet WCAG 2.1 AA requirements, validated by automated audits and manual spot checks each release.

### Integration

- Review sync runs every 30-60 minutes, measured by sync job timestamps in production.
- Alert latency is under 5 minutes from sync event, measured by alert pipeline latency metrics.
- Rate-limit handling uses backoff and queueing with delayed sync status surfaced to users, verified by quota simulation tests.
