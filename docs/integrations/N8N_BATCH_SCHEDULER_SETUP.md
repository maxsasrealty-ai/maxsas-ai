# n8n Batch Scheduler Workflow Configuration

## Overview
This document provides step-by-step instructions for creating the **Batch Scheduler Workflow** in n8n. This workflow runs every 30 seconds to transition scheduled batches (status='scheduled' and scheduleAt <= now) to running status.

---

## Part 1: Workflow Setup

### Create New Workflow
1. In n8n Dashboard, click **Create New Workflow**
2. Name: `Batch Scheduler - Scheduled to Running`
3. Description: "Monitors scheduled batches and transitions them to running when time arrives"
4. Click **Save**

---

## Part 2: Node 1 - Cron Trigger

### Configuration
```
Node Name: "Schedule Check Cron"
Node Type: Cron
```

### Settings
1. Click on Cron node
2. Under **Cron Expression**, enter:
   ```
   */30 * * * * *
   ```
   This means: "Execute every 30 seconds"

3. **Timezone**: Select your timezone (or keep UTC for consistency)

4. **Execute Once**: Leave unchecked (we want recurring)

### Test
- Click **Test Step**
- Should show cron timestamp marking

---

## Part 3: Node 2 - Current Timestamp (Function)

### Purpose
Calculate current timestamp in Firestore format for comparison

### Configuration
```
Node Name: "Calculate Current Timestamp"
Node Type: Function
```

### Function Code
```javascript
const now = new Date();
const seconds = Math.floor(now.getTime() / 1000);
const nanos = (now.getTime() % 1000) * 1000000;

return {
  json: {
    currentTime: now.toISOString(),
    firestoreTimestamp: {
      _seconds: seconds,
      _nanoseconds: nanos,
    },
    epochSeconds: seconds,
  }
};
```

### Connection
- Wire Cron → This Function node

---

## Part 4: Node 3 - Query Scheduled Batches

### Configuration
```
Node Name: "Query Scheduled Batches"
Node Type: Firebase - Firestore
```

### Setup Credentials
1. If not already set up, add Firebase credentials:
   - Click credentials dropdown
   - Enter your Firebase project ID
   - Paste service account JSON key

### Query Parameters
| Field | Value |
|-------|-------|
| **Operation** | Query Collection |
| **Collection** | `batches` |

### Add Filters
**Filter 1: Status = Scheduled**
- Field: `status`
- Operator: `equals`
- Value: `"scheduled"` (exact string)

**Filter 2: Schedule Time Passed**
- Field: `scheduleAt`
- Operator: `less than or equal`
- Value: `{{ $node["Calculate Current Timestamp"].json.firestoreTimestamp }}`

### Ordering
- **Order by Field**: `scheduleAt`
- **Sort Direction**: Ascending (oldest scheduled first)

### Pagination
- **Limit**: `50` (process max 50 batches per cycle)

### Output Handling
- **Return Full Documents**: Check ✓

### Advanced Options
- **Specify Return Data**: Leave empty (get all fields)

### Function (Post Processing)
```javascript
// Ensure we always have an array
if (!Array.isArray($response.body)) {
  return { json: { batches: [] } };
}

return {
  json: {
    batches: $response.body,
    batchCount: $response.body.length,
  }
};
```

### Test Node
- Click **Test Step**
- Should return 0+ scheduled batches

---

## Part 5: Node 4 - Branch: Check if Batches Found

### Configuration
```
Node Name: "Any Batches to Process?"
Node Type: If (Branch)
```

### Condition
```
$node["Query Scheduled Batches"].json.batchCount > 0
```

This prevents downstream nodes from running if no batches exist.

### Connections
- Success branch (TRUE) → Loop through batches (Node 5)
- Failure branch (FALSE) → Finish (or log empty condition)

---

## Part 6: Node 5 - Loop: Process Each Batch

### Configuration
```
Node Name: "For Each Batch"
Node Type: Loop
```

### Settings
- **Items Field**: `{{ $node["Query Scheduled Batches"].json.batches }}`

### Will Process
Each batch in the array one-by-one

---

## Part 7: Node 6 - Within Loop: Prepare Transition Data

### Configuration
```
Node Name: "Prepare Transition Update"
Node Type: Function
```

### Function Code
```javascript
const batch = $input.item.json;
const now = new Date();
const seconds = Math.floor(now.getTime() / 1000);
const nanos = (now.getTime() % 1000) * 1000000;

const firestoreTimestamp = {
  _seconds: seconds,
  _nanoseconds: nanos,
};

console.log(`[Scheduler] Transitioning batch: ${batch.batchId}`);
console.log(`  From: status=scheduled, scheduleAt=${batch.scheduleAt._seconds}`);
console.log(`  To: status=running, startedAt=${seconds}`);

return {
  json: {
    batchId: batch.batchId,
    userId: batch.userId,
    transitionData: {
      status: "running",
      startedAt: firestoreTimestamp,
      lastDispatchedAt: firestoreTimestamp,
      runningCount: batch.totalContacts,
      updatedAt: firestoreTimestamp,
      // Do NOT modify lock fields - dispatcher will set them
      // lockOwner: null,
      // lockExpiresAt: null,
    },
    originalStatus: batch.status,
    totalContacts: batch.totalContacts,
  }
};
```

---

## Part 8: Node 7 - Within Loop: Atomic Update Batch

### Configuration
```
Node Name: "Update Batch Status"
Node Type: Firebase - Firestore
```

### Operation
- **Operation**: Update Document

### Document Path
```
batches/{{ $node["Prepare Transition Update"].json.batchId }}
```

### Update Data (Use Merge: true)
Click **+ Add Field** for each:

| Field Name | Value | Type |
|------------|-------|------|
| `status` | `"running"` | String |
| `startedAt` | `{{ $node["Prepare Transition Update"].json.transitionData.startedAt }}` | Object |
| `lastDispatchedAt` | `{{ $node["Prepare Transition Update"].json.transitionData.lastDispatchedAt }}` | Object |
| `runningCount` | `{{ $node["Prepare Transition Update"].json.transitionData.runningCount }}` | Number |
| `updatedAt` | `{{ $node["Prepare Transition Update"].json.transitionData.updatedAt }}` | Object |

### Advanced Options
- **Merge**: Check ✓ (Important! Prevents overwriting entire document)
- **Specify Return Data**: Check, then add: `status, startedAt, updatedAt`

### Error Handling
- Check **Continue on error**
- We don't want one batch failure to stop the entire loop

---

## Part 9: Node 8 - After Batch Update: Extract Fields for Webhook

### Configuration
```
Node Name: "Extract Batch for Webhook"
Node Type: Function
```

### Function Code
```javascript
const batch = $input.item.json;
const updateResult = $node["Update Batch Status"].json;

// Guard against update failures
if (!updateResult.status) {
  console.log(`[Scheduler] Batch ${batch.batchId} failed to update, skipping webhook`);
  return { json: null }; // Skip this batch
}

return {
  json: {
    batchId: batch.batchId,
    userId: batch.userId,
    status: "running",
    totalContacts: batch.totalContacts,
    startedAt: updateResult.startedAt,
    transitionedAt: new Date().toISOString(),
    source: "scheduler",
  }
};
```

---

## Part 10: Node 9 - Send to Dispatcher Webhook

### Configuration
```
Node Name: "Notify Dispatcher"
Node Type: HTTP Request
```

### HTTP Settings
- **Method**: POST
- **URL**: `{{ env.DISPATCHER_WEBHOOK_URL }}`

### Authentication
- **Authentication**: Header Auth
- Add **Authorization** header:
  ```
  Bearer {{ env.N8N_AUTOMATION_TOKEN }}
  ```

### Headers
| Header Name | Value |
|-------------|-------|
| `Content-Type` | `application/json` |
| `X-Event-Type` | `batch.scheduled_to_running` |
| `X-Scheduler-Id` | `{{ env.SCHEDULER_INSTANCE_ID }}` |

### Body
```json
{
  "batchId": "{{ $node[\"Extract Batch for Webhook\"].json.batchId }}",
  "userId": "{{ $node[\"Extract Batch for Webhook\"].json.userId }}",
  "status": "running",
  "totalContacts": "{{ $node[\"Extract Batch for Webhook\"].json.totalContacts }}",
  "startedAt": "{{ $node[\"Extract Batch for Webhook\"].json.startedAt }}",
  "source": "scheduler",
  "timestamp": "{{ now }}"
}
```

### Error Handling
- Check **Continue on error**
- Webhook failure shouldn't block scheduler

---

## Part 11: Node 10 - End of Loop Action

At the end of the loop (after Node 9), add a final summarization node:

### Configuration
```
Node Name: "Log Transition Summary"
Node Type: Function
```

### Function Code
```javascript
// This runs AFTER all loop iterations
const allResults = $node["Update Batch Status"].json.map(r => ({
  batchId: r.batchId,
  success: !!r.status,
}));

const successCount = allResults.filter(r => r.success).length;
const failureCount = allResults.length - successCount;

console.log(`========== SCHEDULER CYCLE COMPLETE ==========`);
console.log(`Total batches processed: ${allResults.length}`);
console.log(`Successful transitions: ${successCount}`);
console.log(`Failed transitions: ${failureCount}`);
console.log(`Timestamp: ${new Date().toISOString()}`);
console.log(`==========================================`);

return {
  json: {
    cycleComplete: true,
    totalProcessed: allResults.length,
    successCount,
    failureCount,
  }
};
```

---

## Part 12: Optional - Error Handling Node

### Configuration
```
Node Name: "Error Handler"
Node Type: Catch (Error Trigger)
```

### When to Trigger
- Add as separate error handler on the main flow
- Catches any errors from Query or Update nodes

### Error Handling Actions
```javascript
const error = $error;
const batchId = $node["Prepare Transition Update"]?.json?.batchId || "unknown";

console.error(`[Scheduler Error] Batch: ${batchId}`);
console.error(`Message: ${error.message}`);
console.error(`Code: ${error.code}`);
console.error(`Timestamp: ${new Date().toISOString()}`);

// Send to monitoring if critical
if (error.code === "PERMISSION_DENIED") {
  // Alert: Firebase permission issue
  console.error("CRITICAL: Firebase permissions misconfigured!");
}
```

---

## Part 13: Workflow Activation

### Before Activation
1. Set Environment Variables in n8n:
   ```
   DISPATCHER_WEBHOOK_URL=https://your-dispatcher-url/webhook/batch-transition
   N8N_AUTOMATION_TOKEN=your-automation-bearer-token
   SCHEDULER_INSTANCE_ID=scheduler-primary-01
   ```

2. Test entire workflow manually:
   - Create test scheduled batch (with scheduleAt = now - 1 minute)
   - Run workflow manually
   - Verify batch transitioned to 'running'
   - Verify webhook was called

### Plan for Production Rollout
1. **Day 1 Testing**: Leave workflow **Inactive**
2. **Day 2**: Run workflow **Manually** every 5 min
3. **Day 3**: Activate with **5-minute cron** (not 30 sec)
4. **Day 7**: After confidence, switch to **30-second cron**

### Activation Steps
1. Click **Activate** button (top right)
2. Confirm: "Activate workflow?"
3. Watch **Execution** logs for first few cycles
4. Monitor Firestore activity in Dashboard

---

## Part 14: Monitoring & Observability

### Add to Datadog / CloudLogging

#### Log Pattern to Monitor
```
[Scheduler] Transitioning batch: <batchId>
```

#### Metrics to Track
```
n8n.batch_scheduler.runs (gauge)
n8n.batch_scheduler.batches_processed (counter)
n8n.batch_scheduler.batches_transitioned_success (counter)
n8n.batch_scheduler.batches_transitioned_failed (counter)
```

#### Sample Alert Configuration (Datadog)
```
Alert when:
n8n.batch_scheduler.batches_transitioned_failed > 3 in past 10 minutes
Severity: MEDIUM
Action: Notify #bot-alerts Slack channel
```

---

## Part 15: Testing Checklist

### Before Deploying to Production

- [ ] **Manual Test 1**
  - Create batch with `scheduleAt = now - 1 minute`
  - Run workflow manually
  - Verify batch status changed to 'running'
  - Verify dispatcher received webhook

- [ ] **Manual Test 2**
  - Create batch with `scheduleAt = now + 10 minutes`
  - Wait 11 minutes
  - Run workflow manually
  - Verify batch transitioned

- [ ] **Concurrency Test**
  - Launch workflow 3 times simultaneously
  - Verify only ONE status change per batch
  - Verify no duplicate 'running' assignments

- [ ] **Error Handling**
  - Deny Firebase permissions temporarily
  - Run workflow
  - Verify error is logged, workflow continues
  - Restore permissions
  - Run again, should work

- [ ] **Load Test**
  - Create 50 scheduled batches
  - Run workflow
  - Verify all transitioned in ~5 seconds

### After Deployment

- [ ] First 24 hours: Monitor logs every hour
- [ ] First week: Check Datadog metrics daily
- [ ] After week 1: Confirm 0 duplicate transitions
- [ ] Monitor error rate < 0.1%

---

## Part 16: Troubleshooting

### Issue: "Workflow execution timed out"
**Solution**: Reduce batch limit from 50 to 25, or increase timeout in workflow settings.

### Issue: "Firebase permission denied"
**Solution**: Verify service account has `datastore.documents.update` permission on batches collection.

### Issue: "Some batches not transitioning"
**Solution**: Check if batch `scheduleAt` is exactly in past. May be due to clock skew. Increase comparison margin to ±5 seconds.

### Issue: "Duplicate webhook calls"
**Solution**: Ensure error handling doesn't retry. Add `if-batch-not-null` check before webhook.

### Issue: "Batches stuck in 'scheduled'"
**Solution**: Check n8n workflow **Activation** status. If inactive, schedule them manually or check logs for errors.

---

## Part 17: Diagram of Workflow Flow

```
┌──────────────────┐
│ Cron Trigger     │ Every 30 seconds
│ (Node 1)         │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│ Calculate Current Time   │
│ (Node 2)                 │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Query Scheduled Batches      │ status='scheduled'
│ (Node 3)                     │ scheduleAt <= now
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ Branch: Any Batches?         │
│ (Node 4)                     │
└────┬─────────────────────┬───┘
  YES│                    │NO
     ▼                    ▼
┌──────────────────┐   [End]
│ For Each Batch   │
│ (Node 5)         │
└────────┬─────────┘
         │
    (Loop start)
         │
         ▼
┌──────────────────────────┐
│ Prepare Transition Data  │
│ (Node 6)                 │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Update Batch Status      │ status: running
│ (Node 7)                 │ startedAt: now
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Extract for Webhook      │
│ (Node 8)                 │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Notify Dispatcher        │ POST to webhook
│ (Node 9)                 │
└────────┬─────────────────┘
         │
    (End loop iteration)
         │
         ▼
[Next batch or end loop]
         │
         ▼
┌──────────────────────────┐
│ Log Summary              │
│ (Node 10)                │
└──────────────────────────┘
```

---

## Part 18: Next Steps

Once workflow is deployed:

1. **Monitor for 24 hours** - Check logs, error rates
2. **Validate integration** - Ensure dispatcher receives transitions
3. **Load test** - Test with 100+ scheduled batches
4. **Document runbook** - How to respond if scheduler fails
5. **Alert setup** - Configure Datadog/PagerDuty alerts

---

## Appendix A: Environment Variables

Place in n8n Credentials / Environment:

```env
# Firebase Service Account
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...

# Dispatcher Integration
DISPATCHER_WEBHOOK_URL=https://scheduler.yourdomain.com/api/v1/transition
N8N_AUTOMATION_TOKEN=sk_live_xxxxx

# Monitoring
DATADOG_API_KEY=dd_xxxxx
SCHEDULER_INSTANCE_ID=scheduler-primary-01

# Optionals
SCHEDULER_BATCH_LIMIT=50
SCHEDULER_CRON_INTERVAL=*/30 * * * * *
```

---

## Appendix B: Firestore Query Equivalent

If you need to verify manually:

```typescript
// Firebase SDK equivalent of what workflow does
const q = query(
  collection(db, 'batches'),
  where('status', '==', 'scheduled'),
  where('scheduleAt', '<=', Timestamp.now()),
  orderBy('scheduleAt', 'asc'),
  limit(50)
);

const snapshot = await getDocs(q);

for (const doc of snapshot.docs) {
  await updateDoc(doc.ref, {
    status: 'running',
    startedAt: Timestamp.now(),
    lastDispatchedAt: Timestamp.now(),
    runningCount: doc.data().totalContacts,
    updatedAt: Timestamp.now(),
  });
}
```

