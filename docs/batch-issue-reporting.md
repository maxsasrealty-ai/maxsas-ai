# Batch Issue Reporting

## Overview

Batch Issue Reporting is a lightweight feedback layer for completed calling campaigns.

It appears on the Batch Results screen only when a batch reaches terminal state:
- `status = completed`

The feature allows agents to flag operational/system issues without interrupting the normal flow:
- open Batch Results
- review outcomes
- tap Report Issue only if needed

## User Experience

### Entry point
On `Batch Results`, show a small issue card/banner:
- message: "How did this campaign perform? Report any issue if something looks wrong."
- CTA: `Report Issue`

### Report Issue modal
The modal includes:
1. **Issue Type selector**
   - Lead classification incorrect
   - AI conversation incorrect
   - Too many failed calls
   - Billing issue
   - Retry issue
   - Lead marked wrong
   - Other issue
2. **Optional description**
   - free text, any language accepted
3. **Optional related lead selector**
   - attach one lead if issue is lead-specific

### Behavior
- Feature is visible only for completed batches.
- Submission is non-blocking and does not change batch flow.
- Issue remains open for later review by internal teams.

## Firestore Data Model

Collection:
- `batchIssues`

Document ID:
- generated Firestore document ID

Stored fields:
- `issueId: string` (same as document ID)
- `batchId: string`
- `userId: string`
- `issueType: string`
- `description: string | null`
- `relatedLeadId: string | null`
- `createdAt: Timestamp`
- `issueStatus: "open"`
- `batchStatus: string` (snapshot value at submit time)
- `appVersion: string`
- `platform: "ios" | "android" | "web" | ...`

Example document:

```json
{
  "issueId": "a1b2c3d4",
  "batchId": "9e2d8a61-0b54-462a-a5c9-01d6ade79171",
  "userId": "uid_123",
  "issueType": "Billing issue",
  "description": "Charged even though calls failed",
  "relatedLeadId": "lead_789",
  "createdAt": "Firestore Timestamp",
  "issueStatus": "open",
  "batchStatus": "completed",
  "appVersion": "1.0.0",
  "platform": "android"
}
```

## Expected Workflow

1. Agent runs campaign and reaches `Batch Results`.
2. If mismatch/problem is observed, agent submits issue.
3. System writes issue to `batchIssues` with context metadata.
4. Internal/admin tools later triage and resolve issue.

## Developer Admin Dashboard (Future)

This schema is designed for an admin operations console that can:
- list issues by recency (`createdAt` desc)
- filter by `issueStatus`, `issueType`, `platform`, `appVersion`
- filter by specific `batchId` or `userId`
- drill into batch + related lead context
- update issue state (`open` -> `in_progress` -> `resolved`)

### Suggested query patterns

- All open issues:
  - `where("issueStatus", "==", "open")`
- Issues for one batch:
  - `where("batchId", "==", "<batchId>")`
- Issues by type:
  - `where("issueType", "==", "Billing issue")`
- Newest issues first:
  - `orderBy("createdAt", "desc")`

### Suggested index strategy

Add composite indexes as admin querying grows, e.g.:
- `issueStatus + createdAt desc`
- `batchId + createdAt desc`
- `issueType + issueStatus + createdAt desc`

## Notes

- This feature intentionally does **not** alter calling, retry, or billing workflows.
- It is feedback-first and analytics-ready.
- Admin dashboard logic should treat `batchStatus` as historical context captured at report time.
