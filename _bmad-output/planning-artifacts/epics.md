---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - '_bmad-output/planning-artifacts/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

# oneinbox-reviews - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for oneinbox-reviews, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Business owners can create an account and sign in.  
FR2: Users can reset their password and regain access.  
FR3: Account owners can manage billing profile details.  
FR4: Account owners can invite team members and assign roles.  
FR5: Account owners can deactivate team access.  
FR6: Users can connect a Google Business Profile account.  
FR7: Users can connect Yelp and Facebook accounts (when supported).  
FR8: Users can re-authenticate when a connection expires.  
FR9: The system can show connection status per platform.  
FR10: Users can disconnect a platform.  
FR11: The system can ingest reviews from connected platforms.  
FR12: Users can see the last sync time for each platform.  
FR13: The system can backfill reviews after re-auth.  
FR14: Users can filter reviews by platform and time range.  
FR15: Users can view review details (rating, text, author, date).  
FR16: Users can view a unified review inbox across platforms.  
FR17: Users can mark reviews as unread, responded, or needs follow-up.  
FR18: Users can assign a follow-up status to a review.  
FR19: Users can search reviews by keyword.  
FR20: Users can filter by rating and status.  
FR21: Users can compose and send responses from the dashboard.  
FR22: Users can see response history for a review.  
FR23: Users can open a platform-native reply screen via deep link from a review.  
FR24: Users can edit or delete unsent drafts.  
FR25: The system can track who responded and when.  
FR26: Users can view a log of response actions.  
FR27: Users can enable email alerts for new reviews.  
FR28: Users can configure alert thresholds (e.g., negative reviews).  
FR29: Users can pause or resume alerts.  
FR30: The system can send alerts when sync fails or data is stale.  
FR31: Admins can view system health for platform syncs.  
FR32: Support agents can trigger a manual re-sync for an account.  
FR33: Admins can view audit logs for responses.  
FR34: Users can export review data to CSV (optional MVP-lite).  
FR35: Users can delete their account and associated data.  
FR36: The system can remove data per platform deletion policies.

### NonFunctional Requirements

NFR1: Performance targets for dashboard load and search/filter response times.  
NFR2: Security with TLS in transit and AES-256 at rest, RBAC enforcement.  
NFR3: Reliability targets (99.5% uptime, RPO 24h, RTO 4h).  
NFR4: Scalability for 50-100 active accounts (MVP) and 500-2,000 within 12 months.  
NFR5: Accessibility target WCAG 2.1 AA for core flows.  
NFR6: Integration SLAs (review sync 30–60 min, alert latency <5 min, rate-limit backoff).

### Additional Requirements

- Use Next.js App Router with TypeScript; server components by default.
- Auth.js (NextAuth) with database-backed sessions and RBAC roles.
- Drizzle ORM + Postgres (Neon), migrations via Drizzle.
- REST route handlers; standardized error shape `{ error: { code, message, details } }`.
- Polling + cron jobs for sync and alerts; no real-time infra in MVP.
- Vercel hosting with cron triggers in `src/app/api/cron/*` and jobs in `src/lib/jobs/*`.
- Feature-based folders under `src/features`, shared UI in `src/components/ui`.
- Naming conventions: snake_case DB, plural REST paths, kebab-case files.

### FR Coverage Map

FR1: Epic 1 - Account access  
FR2: Epic 1 - Password recovery  
FR3: Epic 1 - Billing profile basics  
FR4: Epic 1 - Team invites and roles  
FR5: Epic 1 - Deactivate team access  
FR6: Epic 2 - Google connection  
FR7: Deferred - Yelp/Facebook (post-MVP)  
FR8: Epic 2 - Re-auth flows  
FR9: Epic 2 - Connection status  
FR10: Epic 2 - Disconnect platform  
FR11: Epic 3 - Review ingestion  
FR12: Epic 3 - Last sync visibility  
FR13: Epic 3 - Backfill after re-auth  
FR14: Epic 3 - Platform/time filters  
FR15: Epic 3 - Review detail view  
FR16: Epic 3 - Unified inbox  
FR17: Epic 4 - Review status updates  
FR18: Epic 4 - Follow-up status  
FR19: Epic 3 - Keyword search  
FR20: Epic 3 - Rating/status filters  
FR21: Epic 4 - Compose/send response  
FR22: Epic 4 - Response history  
FR23: Epic 4 - Deep-link replies  
FR24: Epic 4 - Draft edit/delete  
FR25: Epic 4 - Response attribution  
FR26: Epic 4 - Response audit log  
FR27: Epic 5 - Email alerts  
FR28: Epic 5 - Alert thresholds  
FR29: Epic 5 - Pause/resume alerts  
FR30: Epic 5 - Sync failure alerts  
FR31: Epic 5 - Sync health view  
FR32: Epic 5 - Manual re-sync  
FR33: Epic 4 - Response audit logs  
FR34: Epic 6 - CSV export (optional)  
FR35: Epic 1 - Account deletion  
FR36: Epic 5 - Data deletion policies

## Epic List

### Epic 1: Account Access & Billing Basics

Users can create accounts, sign in, and manage access and billing basics.  
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR35

### Epic 2: Platform Connections (Google First)

Users can connect/disconnect Google and manage connection health.  
**FRs covered:** FR6, FR8, FR9, FR10

### Epic 3: Review Ingestion & Unified Inbox

Reviews sync into a single inbox with filtering and details.  
**FRs covered:** FR11, FR12, FR13, FR14, FR15, FR16, FR19, FR20

### Epic 4: Review Response Workflow

Users respond to reviews and track response history and audit logs.  
**FRs covered:** FR17, FR18, FR21, FR22, FR23, FR24, FR25, FR26, FR33

### Epic 5: Alerts & Support Ops

Users receive alerts and support can troubleshoot sync and data handling.  
**FRs covered:** FR27, FR28, FR29, FR30, FR31, FR32, FR36

### Epic 6: Reporting & Export (Optional MVP-Lite)

Users can export review data.  
**FRs covered:** FR34

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic 1: Account Access & Billing Basics

Users can create accounts, sign in, and manage access and billing basics.

### Story 1.1: Project Initialization (Starter Template)

As a developer,
I want to initialize the project from the approved starter template,
So that the codebase matches the architecture baseline.

**Acceptance Criteria:**

**Given** the starter template is available
**When** I initialize the project from the template
**Then** the repository contains the template structure and baseline configuration
**And** the app can start in a local dev environment

### Story 1.2: Account Registration & Sign-In

As a business owner,
I want to create an account and sign in,
So that I can access the dashboard securely.

**Acceptance Criteria:**

**Given** I am on the sign-up page
**When** I register with valid credentials
**Then** my account is created and I’m signed in
**And** I can sign out and sign back in using the same credentials

### Story 1.3: Password Reset

As a business owner,
I want to reset my password,
So that I can regain access if I forget it.

**Acceptance Criteria:**

**Given** I request a password reset
**When** I follow a valid reset link
**Then** I can set a new password and sign in
**And** expired/invalid links are rejected

### Story 1.4: Billing Profile Basics

As an account owner,
I want to manage basic billing profile details,
So that my account records stay accurate.

**Acceptance Criteria:**

**Given** I’m signed in as the account owner
**When** I view billing settings
**Then** I can see and update billing profile details
**And** validation errors are shown for invalid inputs

### Story 1.5: Team Invites & Roles (Post-MVP)

As an account owner,
I want to invite team members and assign roles,
So that access is controlled.

**Acceptance Criteria:**

**Given** I am the account owner
**When** I invite a teammate and select a role
**Then** they receive an invite and appear in the team list
**And** roles reflect permissions in the UI

### Story 1.6: Deactivate Team Access (Post-MVP)

As an account owner,
I want to deactivate a teammate’s access,
So that only authorized users remain.

**Acceptance Criteria:**

**Given** I have team members listed
**When** I deactivate a member
**Then** their access is revoked
**And** the UI reflects their inactive status

### Story 1.7: Account Deletion (FR35) + Data Deletion Trigger (FR36)

As an account owner,
I want to delete my account,
So that my data is removed per policy.

**Acceptance Criteria:**

**Given** I confirm account deletion
**When** I submit the request
**Then** my account is marked deleted and access is revoked
**And** a deletion job is triggered to comply with platform data deletion policies

## Epic 2: Platform Connections (Google First)

Users can connect/disconnect Google and manage connection health.

### Story 2.1: Connect Google Business Profile

As a business owner,
I want to connect my Google Business Profile account,
So that reviews can be pulled into the inbox.

**Acceptance Criteria:**

**Given** I am signed in
**When** I complete Google OAuth
**Then** the connection is stored and marked active
**And** I see the connected account in the UI

### Story 2.2: Connection Status & Last Auth Health

As a business owner,
I want to see connection status and auth health,
So that I know if sync will succeed.

**Acceptance Criteria:**

**Given** a connected Google account
**When** I view integrations
**Then** I see current status (active/expired/error)
**And** last successful auth time is shown

### Story 2.3: Re-authenticate Expired Connection

As a business owner,
I want to re-authenticate if my connection expires,
So that review sync resumes.

**Acceptance Criteria:**

**Given** my connection is expired
**When** I re-auth successfully
**Then** status returns to active
**And** a backfill sync is queued (idempotent)

### Story 2.4: Disconnect Platform

As a business owner,
I want to disconnect Google,
So that sync stops and my connection is removed.

**Acceptance Criteria:**

**Given** a connected account
**When** I disconnect
**Then** the connection is removed
**And** sync jobs stop for that account
**And** historical reviews are retained per data retention policy

## Epic 3: Review Ingestion & Unified Inbox

Reviews sync into a single inbox with filtering and details.

### Story 3.1: Ingest Google Reviews (Initial Sync)

As a business owner,
I want my Google reviews ingested,
So that they appear in my inbox.

**Acceptance Criteria:**

**Given** a connected Google account
**When** a sync job runs
**Then** new reviews are stored and visible in the inbox
**And** reruns are idempotent (no duplicates, no regressions)

### Story 3.2: Sync Status & Last Sync Time

As a business owner,
I want to see the last sync time,
So that I know data freshness.

**Acceptance Criteria:**

**Given** reviews are syncing
**When** I view integrations or inbox
**Then** I see the last successful sync time
**And** stale data is indicated when overdue

### Story 3.3: Backfill After Re-auth

As a business owner,
I want missed reviews backfilled after re-auth,
So that the inbox is complete.

**Acceptance Criteria:**

**Given** a prior auth failure
**When** re-auth succeeds
**Then** a backfill sync runs
**And** missing reviews are added without duplicating existing items

### Story 3.4: Review Inbox List & Detail

As a business owner,
I want a unified inbox with review details,
So that I can read each review.

**Acceptance Criteria:**

**Given** reviews exist
**When** I open the inbox
**Then** I see a list of reviews
**And** selecting a review shows rating, text, author, and date

### Story 3.5: Filtering & Search

As a business owner,
I want to filter and search reviews,
So that I can find relevant feedback quickly.

**Acceptance Criteria:**

**Given** the inbox has reviews
**When** I filter by rating/ingestion status/time or search by keyword
**Then** the list updates correctly
**And** filters are combinable

## Epic 4: Review Response Workflow

Users respond to reviews and track response history and audit logs.

### Story 4.1: Review Status Updates

As a business owner,
I want to mark reviews as unread/responded/needs follow-up,
So that I can track response state.

**Acceptance Criteria:**

**Given** a review in the inbox
**When** I update its status
**Then** the status persists and is visible in the list
**And** status changes are captured in a single audit trail

### Story 4.2: Compose & Send Response

As a business owner,
I want to compose and send a response,
So that I can reply to reviews from the dashboard.

**Acceptance Criteria:**

**Given** a review is selected
**When** I write and send a response
**Then** the response is posted via the platform API
**And** the response content is stored with timestamp and author
**And** if posting is queued, the UI shows a pending/sent state

### Story 4.3: Response History

As a business owner,
I want to see response history for a review,
So that I can track what was said.

**Acceptance Criteria:**

**Given** a review with responses
**When** I view review details
**Then** I see past responses with timestamps and authors

### Story 4.4: Deep-Link to Platform Reply

As a business owner,
I want a deep link to the platform reply screen,
So that I can reply natively when needed.

**Acceptance Criteria:**

**Given** a review supports native reply
**When** I click “Reply on platform”
**Then** I’m taken to the correct platform URL

### Story 4.5: Draft Edit/Delete

As a business owner,
I want to save, edit, or delete unsent drafts,
So that I can manage responses before posting.

**Acceptance Criteria:**

**Given** a draft exists
**When** I edit or delete it
**Then** changes persist or the draft is removed
**And** drafts are never posted until explicitly sent

### Story 4.6: Unified Response & Status Audit Log

As a business owner/admin,
I want a unified audit log of response and status actions,
So that I can see who changed what and when.

**Acceptance Criteria:**

**Given** responses have been sent
**When** I view the response log
**Then** I see reviewer, responder, timestamp, and action type
**And** status changes are included in the same audit trail

## Epic 5: Alerts & Support Ops

Users receive alerts and support can troubleshoot sync and data handling.

### Story 5.1: Email Alerts for New Reviews

As a business owner,
I want email alerts for new reviews,
So that I can respond quickly.

**Acceptance Criteria:**

**Given** email alerts are enabled
**When** new reviews are ingested
**Then** an email is sent within SLA
**And** alerts include review summary and link to inbox
**And** only email is supported in MVP (other channels later)

### Story 5.2: Alert Thresholds (Negative Reviews)

As a business owner,
I want to configure alert thresholds,
So that I can prioritize negative reviews.

**Acceptance Criteria:**

**Given** alert settings are available
**When** I set a threshold (e.g., rating ≤ 3)
**Then** only matching reviews trigger alerts
**And** thresholds apply to email alerts only in MVP

### Story 5.3: Pause/Resume Alerts

As a business owner,
I want to pause or resume alerts,
So that I can control notifications.

**Acceptance Criteria:**

**Given** alerts are enabled
**When** I pause alerts
**Then** no email alerts are sent until resumed

### Story 5.4: Sync Failure & Stale Data Alerts

As a business owner,
I want alerts when sync fails or data is stale,
So that I can re-auth or take action.

**Acceptance Criteria:**

**Given** sync errors or stale data
**When** a failure threshold is met
**Then** an alert is sent with remediation guidance

### Story 5.5: Support Sync Health View

As a support/admin user,
I want to view sync health and logs,
So that I can troubleshoot issues.

**Acceptance Criteria:**

**Given** I have admin access
**When** I open the support view
**Then** I see sync status and recent errors
**And** I can identify accounts with failures

### Story 5.6: Manual Re-Sync Trigger

As a support/admin user,
I want to trigger a manual re-sync,
So that I can resolve missing reviews.

**Acceptance Criteria:**

**Given** an account has sync issues
**When** I trigger re-sync
**Then** a sync job is queued and status updates

### Story 5.7: Data Deletion Policy Handling (FR36)

As an account owner/support admin,
I want data deletion to follow platform policies,
So that compliance is maintained.

**Acceptance Criteria:**

**Given** an account or platform is disconnected
**When** retention windows expire
**Then** data deletion jobs run per policy
**And** deletions are logged in the audit trail
**And** deletion jobs reuse the same policy engine triggered in Story 1.6

## Epic 6: Reporting & Export (Optional MVP-Lite)

Users can export review data.

### Story 6.1: Export Reviews to CSV

As a business owner,
I want to export review data to CSV,
So that I can share/report externally.

**Acceptance Criteria:**

**Given** reviews exist in the inbox
**When** I export reviews
**Then** a CSV is generated with key fields
**And** filters applied in the inbox are respected
**And** for MVP-lite this is a synchronous download unless export volume requires async

### Story 6.2: Export Status & History (Optional)

As a business owner,
I want to see export status/history,
So that I know when exports completed.

**Acceptance Criteria:**

**Given** I initiated an export
**When** the export completes
**Then** I see a success state
**And** the download link is available
