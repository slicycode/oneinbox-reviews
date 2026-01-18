# Manual Test Walkthrough: Epics 1-6

Status: done

## Purpose
Manual verification checklist for all user-facing features delivered in Epics 1-6.

## Epic 1: Accounts & Billing
- Sign up and sign in; confirm redirect to app and session persists after refresh.
- Password reset flow: request reset email, open link, set new password, sign in.
- Billing profile: open billing profile page, save required fields, confirm persistence.
- Account deletion: delete account, confirm access is revoked, profile shows deletion status.
- Data deletion status: profile page shows recent deletion jobs with provider/status.

## Epic 2: Integrations
- Connect Google Business Profile; confirm success UI and connection recorded.
- Connection status UI: verify "active/stale/failed" and last auth health labels.
- Re-authentication: simulate expired connection and re-authenticate successfully.
- Disconnect: disconnect provider and confirm UI updates.

## Epic 3: Reviews Ingestion & Inbox
- Trigger review sync; verify new reviews appear in inbox list.
- Sync status and last sync timestamp update after sync.
- Backfill after re-auth: trigger re-auth and confirm older reviews are ingested.
- Review details: open a review from list and verify detail view fields.
- Filters/search: rating range, date range, and text search narrow results correctly.

## Epic 4: Responses & Drafts
- Update review status from inbox list; verify persisted value and audit logged.
- Compose response and send; verify response appears in history with author info.
- Response history excludes drafts and shows sent/pending statuses.
- Draft flow: save draft, edit draft, delete draft; confirm UI clears.
- Deep link: if provider is Google and reply URL exists, CTA opens platform reply.

## Epic 5: Alerts & Support Tools
- Email alerts: enable alerts, set negative threshold, pause/resume; confirm settings save.
- New review alert: run a sync with new reviews below threshold and confirm email sent.
- Sync health alerts: simulate failed/stale status and confirm email after cooldown.
- Super admin sync health page: filter by status/provider/user and view results.
- Manual re-sync trigger: trigger re-sync and confirm queued state.

## Epic 6: Exports
- Export CSV from inbox; verify file downloads with correct columns and data.
- Export respects filters: apply filters and verify exported data matches.
- Export history: confirm a new history row appears with status, rows, and download link.

## Notes
- If any step fails, capture exact inputs, timestamps, and screenshots for follow-up.
