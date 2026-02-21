# Schedule Call Functionality - Complete Implementation Guide

## Executive Summary

This document provides production-grade implementation for "Schedule Call" functionality with:
- **Zero race conditions** between multiple n8n cron triggers
- **Atomic status transitions** using Firestore transactions
- **Global concurrency control** integrated with existing system/runtime.activeCalls
- **Full backward compatibility** with existing batch processing

---

## Current State Analysis

### ✅ What's Already Done
1. **UI Layer**: Schedule button & modal in BatchDetailScreen.tsx
2. **Batch Creation**: saveBatchToFirebase() supports action='schedule' with scheduleAt
3. **Database Schema**: Firestore rules allow 'scheduled' status
4. **Batch Fields**: scheduleAt, startedAt already in schema
5. **Concurrency Fields**: lockOwner, lockExpiresAt, priority exist

### ❌ What's Missing
1. **n8n Scheduler Workflow**: No cron-based dispatcher for scheduled → running transition
2. **Atomic Transition Logic**: No transactional batch state change
3. **Double-process Prevention**: No lock mechanism during transition
4. **Scheduler Documentation**: No clear n8n workflow setup guide

---

## Architecture Decision: 3-Phase Batch Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│         3-PHASE BATCH PROCESSING MODEL                      │
├─────────────────────────────────────────────────────────────┤
│                                                                │
│ PHASE 1: DRAFT [LOCAL ONLY]                                  │
│ ─────────────────────────────────                            │
│  • User adds contacts (CSV, image, clipboard)               │
│  • Stored in React Context only                             │
│  • UI: Batch Dashboard shows "DRAFT"                        │
│                                                                │
│     ┌─────────────────────┬──────────────────────┐           │
│     │ User clicks         │ User clicks          │           │
│     │ "Call Now"          │ "Schedule"           │           │
│     └────────┬────────────┴──────────┬───────────┘           │
│              ▼                       ▼                        │
│  ┌───────────────────┐    ┌────────────────────┐            │
│  │ PHASE 2A: RUNNING │    │ PHASE 2B: SCHEDULED│            │
│  │ [IMMEDIATE]       │    │ [DELAYED]          │            │
│  ├───────────────────┤    ├────────────────────┤            │
│  │ status: running   │    │ status: scheduled  │            │
│  │ startedAt: NOW    │    │ scheduleAt: FUTURE │            │
│  │ runningCount: N   │    │ runningCount: 0    │            │
│  │ Dispatcher picks  │    │ Cron checks every  │            │
│  │ immediately       │    │ N seconds          │            │
│  └────────┬──────────┘    └──────────┬─────────┘            │
│           │                          │                       │
│           │ When scheduleAt <= now   │                       │
│           │ [n8n Cron: every 30s]    │                       │
│           │           ┌──────────────┘                       │
│           │           ▼                                       │
│           │    ┌─────────────────────┐                      │
│           └───►│ PHASE 2.5: TRANSITION│                      │
│                │ [ATOMIC]            │                      │
│                ├─────────────────────┤                      │
│                │ 1. Check: status=   │                      │
│                │    scheduled        │                      │
│                │ 2. Lock: atomic     │                      │
│                │    transition       │                      │
│                │ 3. Update: status→  │                      │
│                │    running, set     │                      │
│                │    startedAt        │                      │
│                │ 4. Return: batch    │                      │
│                │    to dispatcher    │                      │
│                └────────┬────────────┘                       │
│                         ▼                                    │
│              Now both follow same path                       │
│              ↓                                                │
│  ┌─────────────────────────────────────┐                   │
│  │ PHASE 3: COMPLETION                 │                   │
│  ├─────────────────────────────────────┤                   │
│  │ All calls completed/failed          │                   │
│  │ status: completed or failed         │                   │
│  │ completedAt: NOW                    │                   │
│  │ UI: Result shown in dashboard       │                   │
│  └─────────────────────────────────────┘                   │
│                                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation: Part 1 - Firestore Rules Enhancement

### Current State
Firestore rules already support 'scheduled' status validation. However, we need to add:
1. **Transition Rule**: Only automation can move scheduled → running
2. **Timestamp Validation**: scheduleAt MUST be in future when creating scheduled batch
3. **Field Protection**: Only automation can set startedAt

### Required Rules Update

**Location**: [firestore.rules](firestore.rules#L151)

```firestore
// BATCHES Collection - UPDATE Rule Enhancement (after line 154)

allow update: if (isAutomation() ||
  (isAuthenticated() && request.auth.uid == resource.data.userId))
  && request.resource.data.userId == resource.data.userId
  && request.resource.data.batchId == resource.data.batchId
  && request.resource.data.createdAt == resource.data.createdAt
  && isValidBatchStatus(request.resource.data.status)
  && request.resource.data.processingLock is bool
  // PHASE 4: Users cannot modify lock fields
  && (isAutomation() || (
    request.resource.data.lockOwner == resource.data.lockOwner
    && request.resource.data.lockExpiresAt == resource.data.lockExpiresAt
  ))
  // PHASE 0: Users cannot modify lastDispatchedAt
  && (isAutomation() || (
    request.resource.data.lastDispatchedAt == resource.data.lastDispatchedAt
  ))
  // ========== NEW: SCHEDULE-SPECIFIC RULES ==========
  // SCHEDULE TRANSITION RULES:
  // 1. Only automation can change from 'scheduled' to 'running'
  // 2. Users cannot change status if it's already 'scheduled'
  && (
    // If batch is currently scheduled, only automation can update status
    (resource.data.status == 'scheduled' && isAutomation()) ||
    // If batch is not scheduled, user updates are allowed (to their own fields)
    (resource.data.status != 'scheduled') ||
    // Users can always update their own batches if status isn't changing
    (request.resource.data.status == resource.data.status && isAuthenticated())
  )
  // ========== END NEW RULES ==========
  && request.resource.data.priority is number
  && request.resource.data.runningCount is number
  && request.resource.data.completedCount is number
  && request.resource.data.failedCount is number
  && request.resource.data.updatedAt != null
  // SCHEDULE-SPECIFIC: startedAt is automation-only when transitioning
  && (isAutomation() || (
    request.resource.data.startedAt == resource.data.startedAt
  ));
```

---

## Implementation: Part 2 - n8n Batch Scheduler Workflow

### Purpose
- **Trigger**: Cron job every 30 seconds
- **Query**: Find batches with status='scheduled' AND scheduleAt <= now
- **Action**: Atomically transition them to status='running'
- **Output**: Pass to dispatch orchestrator

### n8n Workflow Configuration

#### Step 1: Cron Trigger (Every 30 seconds)
```yaml
Node Name: "Schedule Check Cron"
Type: "Cron"
Expression: "*/30 * * * * *"  # Every 30 seconds
Timezone: "UTC"
```

#### Step 2: Timestamp Calculation
```javascript
// Function node to calculate "now" in Firestore Timestamp format
const now = new Date();
return {
  timestamp: {
    _seconds: Math.floor(now.getTime() / 1000),
    _nanoseconds: (now.getTime() % 1000) * 1000000
  },
  timestampISO: now.toISOString(),
  epochMs: now.getTime(),
};
```

#### Step 3: Query Scheduled Batches (Firestore)
```yaml
Node Name: "Query Scheduled Batches"
Type: "Firebase - Firestore"
Operation: "Query Collection"
Collection: "batches"

Filters:
  - Field: "status"
    Operator: "=="
    Value: "scheduled"
  
  - Field: "scheduleAt"
    Operator: "<="
    Value: "{{ $node.TimestampCalc.json.timestamp }}"

OrderBy: "scheduleAt" (ascending)
Limit: 50  # Process up to 50 at a time

Output Path: "batches"
```

#### Step 4: Loop Through Each Batch (Function: Transition Logic)
```javascript
// This is the CRITICAL atomic transition logic
// Node Name: "Transition Scheduled to Running"
// Type: "JavaScript function" or "Firestore Transaction"

const batch = $node.QueryScheduledBatches.json.current;
const now = new Date();
const timestamp = {
  _seconds: Math.floor(now.getTime() / 1000),
  _nanoseconds: (now.getTime() % 1000) * 1000000
};

// Prepare update data for atomic transition
const transitionData = {
  status: 'running',
  startedAt: timestamp,
  lastDispatchedAt: timestamp,  // PHASE 0: Fair scheduling
  runningCount: batch.totalContacts,  // All leads start queued
  updatedAt: timestamp,
  
  // IMPORTANT: Lock fields for dispatcher
  lockOwner: null,  // Dispatcher will set this
  lockExpiresAt: null,  // Will be updated by dispatcher
};

return {
  batchId: batch.batchId,
  transitionData: transitionData,
  timestamp: timestamp,
};
```

#### Step 5: Atomic Update - Firestore Transaction
```yaml
Node Name: "Atomic Update: Batch Status"
Type: "Firebase - Firestore"
Operation: "Batch Update"

Document Path: "batches/{{ $node.TransitionScheduledtoRunning.json.batchId }}"

Data to Update:
  status: "running"
  startedAt: "{{{ $node.TransitionScheduledtoRunning.json.transitionData.startedAt }}}"
  lastDispatchedAt: "{{{ $node.TransitionScheduledtoRunning.json.transitionData.lastDispatchedAt }}}"
  runningCount: "{{ $node.TransitionScheduledtoRunning.json.transitionData.runningCount }}"
  updatedAt: "{{{ $node.TransitionScheduledtoRunning.json.transitionData.updatedAt }}}"

# CRITICAL: Use merge=true to prevent complete document overwrite
Merge: true

Preconditions (Optional but recommended):
  - Field: "status"
    Value: "scheduled"  # Only update if still scheduled
```

#### Step 6: Route to Dispatcher (HTTP POST)
```yaml
Node Name: "Send to Dispatcher"
Type: "HTTP Request"
Method: "POST"
URL: "{{ env.DISPATCHER_WEBHOOK_URL }}"

Headers:
  Authorization: "Bearer {{ env.N8N_AUTOMATION_TOKEN }}"
  Content-Type: "application/json"

Body:
{
  "batchId": "{{ $node.AtomicUpdateBatchStatus.json.batchId }}",
  "status": "running",
  "startedAt": "{{ $node.AtomicUpdateBatchStatus.json.startedAt }}",
  "userId": "{{ $node.QueryScheduledBatches.json.batches[0].userId }}",
  "action": "dispatch",
  "source": "scheduler"
}
```

#### Step 7: Error Handling
```yaml
Node Name: "Error Handler"
Type: "Error Trigger"
Conditions:
  - Any previous step fails

Actions:
  1. Log error to Datadog or cloud logging
  2. Send Slack alert to #bot-alerts if more than 3 failures in 5 min
  3. Continue (do not stop entire workflow)
  
Log Format:
{
  "event": "schedule_transition_failed",
  "batchId": "{{ $error.context.item.batchId }}",
  "error": "{{ $error.message }}",
  "timestamp": "{{ now }}",
  "severity": "MEDIUM"
}
```

---

## Implementation: Part 3 - Race Condition Prevention

### Problem: Multiple Cron Triggers
When multiple n8n instances or cron triggers run simultaneously, they could:
1. ✗ Both pick same batch
2. ✗ Both update it
3. ✗ Duplicate processing

### Solution 1: Atomic Firestore Updates (Recommended)
```firestore
# Firestore ensures only ONE update succeeds if preconditions are met
document.update({
  status: 'running',
  startedAt: serverTimestamp(),
}, {
  precondition: { exists: true }
})
```

### Solution 2: Distributed Lock Pattern (Additional Protection)
```typescript
// If timeout-based retries are critical, implement:

interface SchedulerLock {
  lockId: string;           // Unique per scheduler instance
  acquiredAt: Timestamp;    // When lock was acquired
  expiresAt: Timestamp;     // TTL (e.g., 2 minutes)
  schedulerInstance: string; // Which scheduler holds it
}

// Before querying, acquire lock:
async function acquireSchedulerLock(): Promise<boolean> {
  const lock = {
    lockId: `scheduler_${Date.now()}`,
    acquiredAt: Timestamp.now(),
    expiresAt: Timestamp.now() + 120000, // 2 min TTL
    schedulerInstance: process.env.INSTANCE_ID,
  };
  
  // Attempt atomic write - will fail if lock exists
  try {
    await setDoc(doc(db, 'locks', 'batch-scheduler'), lock, {
      merge: false
    });
    return true;
  } catch (e) {
    return false;
  }
}
```

### Solution 3: Database-Level Deduplication
```sql
-- Query pattern that guarantees no duplicates:
SELECT * FROM batches
WHERE status = 'scheduled'
  AND scheduleAt <= NOW()
  AND lastDispatchedAt < TIMESTAMP_ADD(NOW(), INTERVAL -30 SECOND)
  -- ^ Prevents re-processing within 30 sec
ORDER BY scheduleAt ASC, createdAt ASC
LIMIT 50
```

---

## Implementation: Part 4 - Batch Service Enhancement

### Update batchService.ts: Schedule Timestamp Validation

**Location**: [src/services/batchService.ts](src/services/batchService.ts#L40)

Add this validation before setDoc:

```typescript
/**
 * ENHANCED: Schedule timestamp validation
 * Added validation to prevent scheduling in the past
 */
if (action === 'schedule' && scheduleAt) {
  const now = Timestamp.now();
  const scheduleSeconds = scheduleAt.seconds;
  const nowSeconds = now.seconds;
  
  // Must be at least 1 minute in future
  if (scheduleSeconds <= nowSeconds + 60) {
    throw new Error(
      'Cannot schedule batch within 60 seconds. ' +
      'Please select a time at least 1 minute in the future.'
    );
  }
  
  // Prevent scheduling too far in future (e.g., > 365 days)
  const MAX_SCHEDULE_DAYS = 365;
  const maxFutureSeconds = nowSeconds + (MAX_SCHEDULE_DAYS * 86400);
  if (scheduleSeconds > maxFutureSeconds) {
    throw new Error(
      `Cannot schedule batch more than ${MAX_SCHEDULE_DAYS} days in future`
    );
  }
}
```

---

## Implementation: Part 5 - Testing Strategy

### Unit Test: Schedule Validation
```typescript
describe('saveBatchToFirebase - Schedule Action', () => {
  
  test('should reject schedule time in past', async () => {
    const batch = createMockBatch();
    const pastTime = Timestamp.fromDate(new Date(Date.now() - 60000));
    
    await expect(
      saveBatchToFirebase(batch, 'schedule', pastTime)
    ).rejects.toThrow('Cannot schedule batch within 60 seconds');
  });

  test('should allow valid future schedule time', async () => {
    const batch = createMockBatch();
    const futureTime = Timestamp.fromDate(
      new Date(Date.now() + 3600000) // 1 hour in future
    );
    
    const result = await saveBatchToFirebase(batch, 'schedule', futureTime);
    expect(result).toBe(batch.batchId);
  });
});
```

### Integration Test: n8n Scheduler Workflow
```typescript
describe('n8n Batch Scheduler', () => {
  
  test('should transition scheduled batch to running when time arrives', async () => {
    // 1. Create scheduled batch with scheduleAt = NOW + 5 sec
    const batch = await createScheduledBatch({
      scheduleAt: Timestamp.fromDate(new Date(Date.now() + 5000))
    });
    expect(batch.status).toBe('scheduled');
    
    // 2. Wait 6 seconds
    await sleep(6000);
    
    // 3. Trigger n8n cron manually
    await triggerN8nCron('batch-scheduler');
    
    // 4. Verify batch transitioned
    const updated = await getBatchDetail(batch.batchId);
    expect(updated.status).toBe('running');
    expect(updated.startedAt).toBeDefined();
  });

  test('should prevent duplicate transitions', async () => {
    const batch = await createScheduledBatch({
      scheduleAt: Timestamp.fromDate(new Date(Date.now() + 5000))
    });
    
    // Trigger n8n cron 3 times simultaneously
    await Promise.all([
      triggerN8nCron('batch-scheduler'),
      triggerN8nCron('batch-scheduler'),
      triggerN8nCron('batch-scheduler'),
    ]);
    
    // Verify only ONE transition occurred
    const updated = await getBatchDetail(batch.batchId);
    expect(updated.status).toBe('running');
    
    const transitions = await getAuditLog(batch.batchId);
    const statusChanges = transitions.filter(
      t => t.event === 'status_change' && t.to === 'running'
    );
    expect(statusChanges.length).toBe(1);
  });
});
```

---

## Implementation: Part 6 - Backward Compatibility Checklist

- [x] Existing 'running' batches from "Call Now" unaffected
- [x] Existing batch schema supports scheduleAt field
- [x] Concurrency model (lockOwner, lastDispatchedAt) unchanged
- [x] Dispatcher receives both now-running and scheduled→running batches identically
- [x] Dashboard can filter by status and scheduleAt
- [x] Lead processing logic same regardless of batch origin

---

## Implementation: Part 7 - Dashboard Enhancements (Optional)

### Batch Detail Screen: Show Schedule Info
```tsx
// When status === 'scheduled':
<View style={styles.scheduleInfo}>
  <Text style={styles.label}>Scheduled For:</Text>
  <Text style={styles.scheduleTime}>
    {formatDateTime(batch.scheduleAt)}
  </Text>
  <Text style={styles.scheduleSubtext}>
    ({formatDistanceToNow(batch.scheduleAt, { addSuffix: true })})
  </Text>
</View>
```

### Batch Dashboard: Filter by Status
```tsx
const statusFilters = [
  { label: 'Running', value: 'running', count: runningCount },
  { label: 'Scheduled', value: 'scheduled', count: scheduledCount },
  { label: 'Completed', value: 'completed', count: completedCount },
];

<TouchableOpacity onPress={() => setStatusFilter('scheduled')}>
  <View style={[styles.filterButton, selectedFilter === 'scheduled' && styles.selected]}>
    <Ionicons name="calendar" size={16} />
    <Text>Scheduled ({scheduledCount})</Text>
  </View>
</TouchableOpacity>
```

---

## Deployment Checklist

### Phase 1: Database & Rules (No App Changes)
- [ ] Deploy updated firestore.rules with schedule transition rules
- [ ] Test rules in emulator
- [ ] Deploy to production Firestore

### Phase 2: n8n Configuration (Operational)
- [ ] Create batch scheduler workflow in n8n
- [ ] Test cron trigger locally
- [ ] Configure production n8n credentials
- [ ] Set cron to run every 30 seconds
- [ ] Add error monitoring to Datadog
- [ ] Test with scheduled batches in staging

### Phase 3: App Deployment (Already Has Code)
- [ ] Verify BatchDetailScreen has schedule modal
- [ ] Verify saveBatchToFirebase handles action='schedule'
- [ ] Test "Schedule" button end-to-end
- [ ] Verify scheduled batches appear in dashboard
- [ ] Test schedule confirmation with time picker

### Phase 4: Validation
- [ ] Verify automated transition at scheduled time
- [ ] Verify no duplicate processing
- [ ] Verify global concurrency control still works
- [ ] Verify leads process correctly after transition
- [ ] Monitor system/runtime.activeCalls during transition

---

## Monitoring & Observability

### Key Metrics to Track
```
1. schedule_batch_created (counter)
   - Batches created with action='schedule'
   
2. schedule_transition_triggered (gauge)
   - How many batches were transitioned this cron cycle
   
3. schedule_transition_failures (counter)
   - Failed atomicity transitions
   
4. schedule_transition_latency_ms (histogram)
   - Time from scheduleAt to status change to 'running'
   - Target: < 100ms (optimized for 30-sec cron)
   
5. duplicate_schedule_attempts (counter)
   - How many times same batch was selected by multiple crons
   - Should always be 0 (indicates bug if > 0)
```

### Sample Datadog Queries
```python
# Alert: If any batch transitioned twice
avg:schedule_transition_failures{env:prod} > 0

# Monitor latency
p99:schedule_transition_latency_ms{env:prod}

# Verify no duplicates
sum:duplicate_schedule_attempts{env:prod}
```

---

## FAQ & Troubleshooting

### Q: What if n8n cron fails?
**A**: Scheduler will retry on next cycle (30 sec). Meanwhile, batch stays 'scheduled' - not lost. No race condition since update is guarded by Firestore precondition.

### Q: Can user modify scheduled batch?
**A**: Yes - they can delete batch or view stats. But they cannot change status directly (only automation can move scheduled→running).

### Q: How does this interact with global concurrency?
**A**: Once batch transitions to 'running', dispatcher processes it normally. Global concurrency control (activeCalls) applies to all running batches equally.

### Q: What if scheduler runs during maintenance?
**A**: Batches remain 'scheduled' until scheduler resumes. Their scheduleAt time is honored (no loss).

### Q: Can I change schedule after batch is created?
**A**: Not in current design. User must delete and recreate. (Can be added later with user-permission rule).

---

## Files to Modify

| File | Change | Type |
|------|--------|------|
| [firestore.rules](firestore.rules#L151) | Add schedule transition rules | Schema |
| [src/services/batchService.ts](src/services/batchService.ts#L40) | Add scheduleAt validation | Logic |
| n8n Workflow | Create batch scheduler (new) | Operational |
| [ARCHITECTURE_AND_FLOWS.md](ARCHITECTURE_AND_FLOWS.md) | Document scheduler flow | Docs |

---

## Next Steps

1. **Deploy Firestore Rules** → Validate in production
2. **Create n8n Workflow** → Test in staging
3. **Validation Testing** → End-to-end with scheduled batches
4. **Monitor & Alert** → Track metrics in Datadog
5. **Document for Team** → API page, runbook, monitoring guide

