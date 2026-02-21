# Schedule Call - Quick Start & Deployment Guide

## What's Being Built

A production-grade **Schedule Call** feature that allows users to:
1. Select a future time to start calling a batch of leads
2. Batch is stored as "scheduled" (not "running") 
3. n8n scheduler automatically transitions batch to "running" at scheduled time
4. Dispatcher processes it normally after transition

**Key Design**: Zero race conditions, atomic state transitions, full compatibility with existing system.

---

## 3-Part Implementation

### Part 1: Database Rules Update ✅ DONE
**File**: [firestore.rules](firestore.rules#L151-L190)

**What Changed**:
- Added protection: Users cannot modify a batch once it's 'scheduled'
- Only automation (n8n) can transition scheduled → running
- Firestore now enforces atomic transitions

**Deployment**: Deploy rules to Firebase Console

---

### Part 2: Batch Service Enhancement ✅ DONE
**File**: [src/services/batchService.ts](src/services/batchService.ts#L80-L120)

**What Changed**:
- Added validation: scheduleAt must be at least 60 seconds in future
- Added validation: scheduleAt cannot be > 365 days in future
- Validation happens before Firebase write

**Testing**: 
```bash
npm test -- batch.schedule.test.ts
```

**Deployment**: Deploy code with next app release

---

### Part 3: n8n Scheduler Workflow ✅ DONE
**File**: [N8N_BATCH_SCHEDULER_SETUP.md](N8N_BATCH_SCHEDULER_SETUP.md)

**What It Does**:
- Runs every 30 seconds (cron)
- Finds all batches where: status='scheduled' AND scheduleAt <= now
- Atomically updates them to status='running' with startedAt=now
- Notifies dispatcher webhook

**Deployment**: Create workflow in n8n using step-by-step guide

---

## Deployment Checklist

### ✓ Completed Changes
- [x] Firestore rules updated with schedule transition protection
- [x] batchService.ts updated with scheduleAt validation
- [x] Comprehensive documentation created
  - [x] Main implementation guide: [SCHEDULE_CALL_IMPLEMENTATION.md](SCHEDULE_CALL_IMPLEMENTATION.md)
  - [x] n8n setup guide: [N8N_BATCH_SCHEDULER_SETUP.md](N8N_BATCH_SCHEDULER_SETUP.md)
  - [x] This quickstart guide

### → Next: Deployment Steps

#### Phase 1: Database (FIRST - No app changes needed)
```
[ ] 1. Deploy Firestore rules to production
      Command: firebase deploy --only firestore:rules
      
[ ] 2. Verify rules in Firebase Console Firestore → Rules tab
      
[ ] 3. No restart needed for Firebase
```

**Time**: ~5 minutes

---

#### Phase 2: n8n Setup (Can be parallel with Phase 1)
```
[ ] 1. Read: N8N_BATCH_SCHEDULER_SETUP.md (all 17 parts)
      
[ ] 2. In n8n, create new workflow:
      - Name: "Batch Scheduler - Scheduled to Running"
      - Add nodes 1-10 exactly as documented
      - Set environment variables
      
[ ] 3. Test manually:
      - Create test scheduled batch (scheduleAt = now - 1 min)
      - Run workflow
      - Verify batch status changed to 'running'
      
[ ] 4. Leave workflow INACTIVE initially
      
[ ] 5. Monitor Firestore for any existing scheduled batches
```

**Time**: ~30 minutes

---

#### Phase 3: App Code Deployment
```
[ ] 1. Deploy updated code with batchService.ts changes
      - npm install (if any deps changed)
      - npm run build
      - Deploy to staging first
      
[ ] 2. Test Schedule functionality in staging:
      - Open batch detail screen
      - Click "Schedule" button
      - Set time as 2 hours from now
      - Confirm batch created with status='scheduled'
      
[ ] 3. Verify UI shows scheduled batch in dashboard
      
[ ] 4. Deploy to production when confident
```

**Time**: ~15 minutes

---

#### Phase 4: Activation & Validation
```
Day 1 (Testing):
[ ] - Leave n8n workflow INACTIVE
[ ] - Monitor: Are users able to create scheduled batches?
[ ] - Check: Do scheduled batches appear in dashboard?

Day 2 (Manual Runs):
[ ] - Manually trigger n8n workflow every 5 minutes
[ ] - Create test scheduled batches with various times
[ ] - Verify transitions work correctly
[ ] - Check for any errors in logs

Day 3 (Soft Activate):
[ ] - Switch n8n cron to run every 5 minutes (not 30 sec)
[ ] - Monitor: Are batches transitioning automatically?
[ ] - Verify: Do transitioned batches start processing?

Day 4-6 (Full Monitoring):
[ ] - Keep 5-min cron, monitor performance
[ ] - Check: No duplicate transitions
[ ] - Check: Global concurrency still working
[ ] - Setup Datadog alerts

Day 7 (Production Cron):
[ ] - Switch to 30-second cron interval
[ ] - Full monitoring active
[ ] - Team on standby for first 8 hours
```

---

## Testing Scenarios

### Scenario 1: Basic Schedule
```
1. User uploads 10 leads
2. Clicks "Schedule"
3. Selects "Tomorrow at 9 AM"
4. Batch created with:
   - status: 'scheduled'
   - scheduleAt: [tomorrow 9 AM]
   - runningCount: 0
   - completedCount: 0
5. Dashboard shows: "Scheduled (10 leads)"
6. At 9 AM, n8n transitions it to 'running'
7. Dispatcher picks up batch normally
```

### Scenario 2: Immediate Call (Call Now)
```
1. User uploads 10 leads  
2. Clicks "Call Now"
3. Batch created with:
   - status: 'running'
   - scheduleAt: null
   - runningCount: 10
4. Dispatcher picks up immediately
5. Processing starts right away
```

### Scenario 3: Prevent Modification
```
1. Batch is in status='scheduled'
2. User tries to edit batch status directly (via API/client)
3. Firestore rules DENY request (users can't modify scheduled batches)
4. Error returned to app
```

### Scenario 4: Race Condition Prevention
```
1. Two n8n instances trigger simultaneously
2. Both query for batches where status='scheduled' AND scheduleAt <= now
3. Both find same batch
4. First issues: UPDATE status='running' WHERE status='scheduled'
5. Firestore atomically applies update (succeeds)
6. Second issues: UPDATE status='running' WHERE status='scheduled'
7. Firestore atomically rejects (batch no longer 'scheduled')
8. Result: Only ONE transition occurs ✓
```

---

## Rollback Plan

If anything goes wrong during deployment:

### If Firestore Rules Break
```
1. Revert firestore.rules to previous version
2. firebase deploy --only firestore:rules
3. Scheduled batches become immutable (users can't modify)
   But n8n can still transition them
```

### If n8n Workflow Fails
```
1. Deactivate workflow in n8n
2. Manually transition scheduled batches:
   firebase firestore update batches/{batchId} \
     status=running \
     startedAt=now
3. Or, revert app code - users can only use "Call Now"
```

### If batchService.ts Validation Causes Issues
```
1. Comment out scheduleAt validation on deployed v1
2. Release v2 with validation enabled
3. Minimal user impact (they just can't schedule yet)
```

---

## Verification Checklist

### Post-Deployment (Day 1)

- [ ] Firebase console shows new rules deployed
- [ ] n8n workflow visible and monitored
- [ ] Batch detail screen loads without errors
- [ ] Schedule button exists and opens modal
- [ ] Time picker works (can select future date/time)
- [ ] Saving batch with schedule doesn't error
- [ ] Dashboard shows both "Running" and "Scheduled" batches

### Post-Activation (Day 3)

- [ ] Manual n8n trigger created scheduled batches successfully
- [ ] Batch transitioned to 'running' at scheduled time
- [ ] Dispatcher picked up transitioned batch
- [ ] Transitioned batch processed leads normally
- [ ] No duplicate transitions in logs
- [ ] Global concurrency (activeCalls) updated correctly

### Metrics (Day 7)

- [ ] Datadog shows metrics being collected
- [ ] Error rate < 0.1%
- [ ] Average transition latency < 2 seconds
- [ ] Zero duplicate_schedule_attempts
- [ ] Cron success rate = 100%

---

## User-Facing Changes

### What Users See

**Before** with just "Call Now":
```
Batch Detail Screen
┌─────────────────────────┐
│ 4 Contacts              │
│ [CALL NOW] [DELETE]     │
└─────────────────────────┘
```

**After** with "Schedule":
```
Batch Detail Screen
┌─────────────────────────────┐
│ 4 Contacts                  │
│ [CALL NOW] [SCHEDULE]       │
│ [DELETE] [VIEW HISTORY]     │
│                             │
│ When user clicks SCHEDULE:  │
│ ┌─────────────────────────┐ │
│ │ Schedule Date/Time      │ │
│ │ [Calender Widget]       │ │
│ │ [Time Picker]           │ │
│ │ [CONFIRM] [CANCEL]      │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Dashboard** shows both:
```
Batch Dashboard
┌─────────────────────────────┐
│ [Running (3)] [Scheduled (2)]│
│                             │
│ Running:                    │
│  • Batch A - 10 leads      │
│                             │
│ Scheduled:                  │
│  • Batch B - 5 leads       │
│    (Tomorrow 10 AM)         │
│  • Batch C - 8 leads       │
│    (Next Monday 2 PM)       │
└─────────────────────────────┘
```

---

## Monitoring & Support

### Key Metrics (Datadog)

```
Dashboard: Batch Scheduler Health

n8n.batch_scheduler.cron_runs (per cycle)
├─ Batches found (count)
├─ Successfully transitioned (count)
├─ Failed transitions (count)
└─ Webhook successful (count)

schedule_batch_created (total)
├─ By user (top 10)
├─ By schedule time (distribution)
└─ By batch size (distribution)

schedule_transition_latency_ms (histogram)
├─ p50, p95, p99
└─ Alert if p95 > 5 seconds

duplicate_schedule_attempts (should be 0)
└─ Alert if > 0 (indicates race condition)
```

### Support Runbook

**Issue: User tries to schedule but gets error**
```
Probable Causes:
1. Schedule time < 60 seconds in future
2. Schedule time > 365 days in future
3. Low wallet balance (check before save?)

Check Logs:
- batchService.ts validation logs
- Firebase rules deny logs
```

**Issue: Batch scheduled but never transitions**
```
Probable Causes:
1. n8n workflow not active
2. n8n workflow errors (check logs)
3. scheduleAt field missing or corrupted

Check:
- n8n workflow status (active?)
- Batch document in Firestore (has scheduleAt?)
- n8n execution logs (error in transition?)
```

**Issue: Duplicate transitions or races**
```
Check:
- Multiple n8n instances running
- Multiple scheduler instance IDs
- Firestore transaction logs

Fix:
- Disable extra n8n instances
- Ensure only 1 scheduler active
```

---

## Architecture Reminder

```
User Flow:
┌─────────────┐
│ User        │
│ Schedule    │
│ Batch 10 AM │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐    Firebase
│ saveBatchToFirebase()   │    Validation
│ action='schedule'       ├─→ status='scheduled'
│ scheduleAt=[timestamp]  │    scheduleAt=[10 AM]
└──────┬──────────────────┘
       │
       ▼
   Dashboard shows "Scheduled"
   
   [Time passes...]
   
       │ 10:00 AM
       ▼
┌──────────────────────────────┐
│ n8n Cron Trigger (every 30s) │
└──────┬───────────────────────┘
       │
       ▼
┌────────────────────────────────────┐
│ Query: status='scheduled'          │
│        AND scheduleAt <= now       │
└──────┬─────────────────────────────┘
       │
       ▼
┌────────────────────────────────────┐    Atomic
│ Update (with precondition):        │    Update
│ status='running'                   ├─→ One batch
│ startedAt=now                      │    succeeds
└──────┬─────────────────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Notify Dispatcher        │
│ Webhook: batch_running   │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Dispatcher picks batch   │
│ Processes leads normally │
└──────────────────────────┘
```

---

## Success Criteria

### Launch is successful when:

- ✓ Users can create scheduled batches without errors
- ✓ Scheduled batches appear in dashboard with correct time
- ✓ n8n automatically transitions batches at scheduled time
- ✓ Transitioned batches begin processing immediately
- ✓ No manual intervention needed after schedule time arrives
- ✓ Zero duplicate transitions (verified through logs)
- ✓ Global concurrency control works for scheduled batches
- ✓ Error rate < 0.1%
- ✓ No impact on "Call Now" functionality
- ✓ No performance degradation in dispatcher

---

## Timeline

| Phase | Days | Activity | Owner |
|-------|------|----------|-------|
| Prep | 1 | Read docs, setup env | Dev |
| Test | 2 | Manual n8n testing | Dev |
| Stage | 1 | Deploy to staging | DevOps |
| Validate | 3 | User testing in staging | QA |
| Prod | 1 | Deploy Firestore rules | DevOps |
| Prod | 1 | Create n8n workflow | DevOps |
| Prod | 1 | Deploy app code | DevOps |
| Prod | 7 | Monitor & activate | Dev + Ops |
| **Total** | **~17 days** | | |

---

## Questions?

Refer to:
1. **High-level overview**: [SCHEDULE_CALL_IMPLEMENTATION.md](SCHEDULE_CALL_IMPLEMENTATION.md)
2. **n8n step-by-step**: [N8N_BATCH_SCHEDULER_SETUP.md](N8N_BATCH_SCHEDULER_SETUP.md)
3. **Code changes**: Look at git diff for [firestore.rules](firestore.rules) and [batchService.ts](src/services/batchService.ts)
4. **Architecture diagrams**: See ASCII diagrams in implementation guide

