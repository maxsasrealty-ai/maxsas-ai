<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Notification and Dashboard UX

## Goal
This update makes product value visible on the Home dashboard and Alerts tab so real estate agents can clearly see outcomes from AI calling spend.

The UX now emphasizes:
- Qualified leads generated
- Completed campaign outcomes
- Active calling momentum
- Wallet readiness

## Home Dashboard Signals
The Home screen (`src/features/home/HomeScreen.tsx`) now prioritizes value-first metrics before operational details.

### Value Generated Today
Primary card set:
- Qualified Leads Today
- Batches Completed (today)
- Active Calls
- Wallet Balance

These are backed by live Firestore data from `useDashboardStats` and wallet listeners.

### Success Banner for Qualified Leads
When qualified leads are detected today, a prominent success card appears:
- Title: `Hot Leads Found Today`
- Message includes qualified lead count
- CTA: `View` (routes to leads dashboard)

This creates a clear positive reinforcement loop: outreach completed -> buyer intent detected -> immediate follow-up action.

### Live AI Insights (Value Framing)
Insights now focus on outcomes:
- Qualified leads identified from completed batches
- Running + pending pipeline activity with completed call volume

## Alerts/Notifications System
The Alerts tab (`src/features/notifications/NotificationsScreen.tsx`) now uses Firestore-backed persistent notifications instead of mock data.

Service file:
- `src/services/notificationService.ts`

### Notification Event Types
Generated notifications include:
- `batch_completed`: campaign finished successfully
- `qualified_lead`: potential buyer showed interest
- `manual_retry_required`: lead requires retry action
- `wallet_low`: recharge needed to avoid interruption
- `wallet_recharge_success`: recharge confirmation
- `billing_transaction`: debit/refund/transaction recorded
- `ai_insight`: important conversion/interest insight

### Message Style
Language is agent-friendly and outcome-oriented, for example:
- "A potential buyer showed interest"
- "Your campaign finished successfully"
- "New qualified lead ready for follow-up"
- "Wallet recharge successful - your AI calls are ready"

### CTA Behavior
Each notification can include a direct action:
- Open leads
- Open wallet
- Open batch dashboard
- Open transaction history

This reduces friction between alert and action.

## Firestore Schema
Notifications are stored per user in:
- `users/{userId}/notifications/{dedupeKey}`

Document fields:
- `userId: string`
- `type: 'batch_completed' | 'qualified_lead' | 'manual_retry_required' | 'wallet_low' | 'wallet_recharge_success' | 'billing_transaction' | 'ai_insight'`
- `title: string`
- `body: string`
- `ctaLabel: string | null`
- `ctaRoute: string | null`
- `priority: 'high' | 'medium' | 'low'`
- `isRead: boolean`
- `entityId: string | null`
- `entityType: 'batch' | 'lead' | 'wallet' | 'transaction' | 'system'`
- `metadata: map | null`
- `dedupeKey: string`
- `eventAt: timestamp`
- `createdAt: timestamp`

## Deduplication Strategy
Events use deterministic `dedupeKey` values so notifications are idempotent:
- Same event writes to the same document id
- Prevents duplicate rows from repeated listeners/snapshots
- Supports persistence across sessions

## Firestore Rules Update
`firestore.rules` now allows users to read/write only their own notification documents under `users/{uid}/notifications/*`.

## Dashboard Metrics Source
`src/hooks/useDashboardStats.ts` now includes:
- `qualifiedLeadsToday`
- `qualifiedLeadsTodayFromCompletedBatches`
- `completedBatchesToday`
- `qualifiedLeadsFromCompletedBatches`

Qualified leads are currently derived from dispositions:
- `interested`
- `callback_requested`
- `meeting_scheduled`

## Product Value Reinforcement
These UX changes strengthen perceived ROI in three steps:
1. Visible outcomes: agents see lead quality, not just call volume.
2. Positive framing: system language highlights wins and readiness.
3. Actionability: every meaningful alert can be acted on in one tap.

This structure is ready to be extended for:
- Admin dashboards
- Team analytics
- Notification preferences
- Conversion funnel reporting


