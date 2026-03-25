# Backend Core Architecture

- **dispatcher.ts**: Handles queued leads, assigns processing, concurrency limits
- **scheduler.ts**: Handles scheduled batches
- **retryEngine.ts**: Replaces webhook retry logic, uses nextRetryAt, exponential backoff
- **billingEngine.ts**: Handles backend-driven billing, idempotent, no UI dependency
- **planResolver.ts**: Returns correct processor based on user planType
- **firestorePlanCollections.ts**: Plan-aware Firestore collection names

## Plan Strategy
- Core contains only generic logic
- Plan-specific logic is in plans/nexus and plans/enterprise
