# Maxsas-AI Complete Project Summary (19 Feb 2026)

## 1) Project Overview
Maxsas-AI ek Expo + React Native based lead operations app hai jisme lead intake, batch-based calling workflow, real-time dashboard, wallet-billing controls, scheduling/follow-up, aur automation-ready data model implement hai.

## 2) Tech Stack
- Frontend: Expo, React Native, expo-router
- Backend: Firebase Auth + Firestore
- Data intake: expo-document-picker, expo-clipboard, xlsx, expo-image-picker
- AI extraction: Gemini Vision integration
- Testing: Jest + jest-expo

## 3) High-Level Architecture
- App layer: File-based routing (app folder)
- State layer: AuthProvider + WalletProvider + BatchProvider
- Service layer (primary batch flow): src/services/*
- Utility/legacy automation layer: src/lib/*
- Storage model: Firestore collections (users, system/runtime, batches, leads, wallets, wallets/{userId}/transactions)

## 4) Core Product Flows
### A. Authentication
- Signup/Login/Logout
- Signup ke time users doc create hota hai with concurrency defaults

### B. Lead Intake
- Manual entry
- Paste from clipboard (text se phone extraction)
- CSV/Excel import
- Image import (Gemini OCR + phone extraction)

### C. Batch Lifecycle (Main)
1. Import/entry ke baad local draft batch create hota hai
2. Draft dashboard me dikhai deta hai (Firebase write nahi)
3. User Call Now ya Schedule choose karta hai
4. Firestore writes:
   - 1 batch document in batches
   - N lead documents in leads (one per contact)
5. Real-time listeners se UI auto update

### D. Batch Monitoring
- Batch list tabs: all, draft, scheduled, running, completed
- Batch detail me live lead stats, statuses, retry indicators

### E. Follow-up System
- Follow-up schedule screen
- Scheduled follow-ups list
- Mark completed/interested actions

### F. Wallet & Billing
- Cost per call: ₹14
- Available balance check before batch start
- Locked/Reserved amount support
- Transaction history support

### G. Home Dashboard
- Real-time KPIs for leads and batches
- Live wallet summary
- Quick action sheet for intake methods

## 5) Data Model Summary
### Batches
- Metadata-focused batch doc
- status/action/source/count/timestamps

### Leads
- Per-contact lead docs
- batchId linkage mandatory
- callStatus, retryCount, nextRetryAt, aiDisposition fields

### Wallets
- balance, lockedAmount, totalSpent, totalRecharged
- nested transactions + global debit records

## 6) Real-Time Behavior
- Batches listener
- Leads listener (user-wide and batch-wise)
- Dashboard counters update via onSnapshot
- Wallet + transactions live subscriptions

## 7) Security & Rules
Firestore rules enforce:
- User-level isolation
- Batch-owner checks
- Required/valid status fields
- Leads must reference valid batchId
- Restriction on lock/billing/system fields
- Default deny fallback

## 8) Testing & Quality Assets
- Jest setup present
- Phone extractor unit tests present
- Firestore security rules practical test cases documented
- Extensive docs for architecture, deployment, regression, and troubleshooting

## 9) Important Notes (Current Codebase State)
- Project me dual lead layers exist karti hain:
  - src/services/leadService.ts (batch architecture & operational runtime)
  - src/lib/leadService.ts (schema/history/intake automation style)
- Isliye kuch screens/services different layers consume karte hain.

## 10) Feature Coverage Snapshot
Implemented modules include:
- Auth flows
- Onboarding routes
- Leads dashboard and batch dashboard
- Batch detail actions (call now, schedule, delete draft)
- Multi-source import
- Gemini image extraction
- Follow-up scheduling/listing
- Wallet balance/tracking
- Reports/notifications/profile/settings routes

## 11) Documentation Coverage
Repo me broad documentation set available hai:
- Architecture guides
- Batch system docs
- N8N readiness docs
- Phone extraction docs
- Firestore rules/setup docs
- Testing checklists and implementation summaries

## 12) Current Overall Status
System highly implemented and documentation-rich hai, with strong batch architecture, real-time updates, security rules, and wallet gating. Codebase feature-complete direction me hai, but module-level consolidation (services vs lib lead pipelines) future cleanup ka useful next step ho sakta hai.
