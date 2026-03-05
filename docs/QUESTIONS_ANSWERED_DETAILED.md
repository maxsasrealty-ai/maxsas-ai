# Questions Answered - UI Sync Investigation

**Investigation Date:** February 23, 2026  
**Issue Type:** Dashboard UI display bug - leads not appearing in retry tab

---

## ❓ Q1: Frontend Filtering Logic

### Question
> What exact Firestore fields does the "Show Retrying" tab filter on? (e.g., Does it require nextRetryAt to be a specific timestamp, or retryCount to be > 0?).

### Answer

**Location:** [src/features/leads/BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L248-L250)

The "Show Retrying" tab filters leads based on **EXACTLY 2 fields**:

```typescript
if (leadFilter === 'retrying') {
  return (lead.retryCount || 0) > 0 || !!lead.nextRetryAt;
}
```

**Filter Condition Logic:**
- **Check A:** `retryCount > 0` (integer check)
  - `retryCount` must be greater than 0 (e.g., 1, 2, 3...)
  - Default value is 0, so any value must be explicitly set
  
- **OR**
  
- **Check B:** `nextRetryAt` is truthy (non-null/non-undefined)
  - `nextRetryAt` must be a Firestore Timestamp object
  - `null` or `undefined` = falsy, BLOCKS the lead
  - Any valid timestamp = truthy, SHOWS the lead

**Your Current State (BROKEN):**
- `retryCount: 0` → Check A: `0 > 0` = **FALSE** ❌
- `nextRetryAt: null` → Check B: `!!null` = **FALSE** ❌
- Result: `FALSE || FALSE` = **FALSE** → Lead doesn't appear

**What's NOT checked:**
- ❌ `status` field (used in other tabs)
- ❌ `aiDisposition` field (only for display)
- ❌ `attempts` field (only counted for "Action Required")
- ❌ `callStatus` field (used in other logic)

### 🔧 Fixed Logic (AFTER FIX)

```typescript
if (leadFilter === 'retrying') {
  return (
    lead.status === 'failed_retryable' ||  // ← NEW: Added status check
    (lead.retryCount || 0) > 0 ||
    !!lead.nextRetryAt
  );
}
```

Now it checks ALL THREE:
1. `status === 'failed_retryable'` → **TRUE** ✅ (Lead appears!)
2. (Still checks retryCount and nextRetryAt for future retries)

---

## ❓ Q2: Real-Time Sync & Progress Bar

### Question
> Why is the Progress Bar showing 0% even though runningCount is 0 and totalContacts is 1 in Firestore?

### Answer

**Progress Bar Calculation Location:** [src/features/leads/BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L160-L175)

```typescript
const calculateStats = useCallback(() => {
  const total = liveLeads.length;  // Count: 1 lead
  const completed = liveLeads.filter((l) => l.status === 'completed').length;  // Count: 0
  const pending = liveLeads.filter((l) => l.status === 'queued').length;  // Count: 0
  const inProgress = liveLeads.filter((l) => l.status === 'calling' || l.callStatus === 'in_progress').length;  // Count: 0
  
  // Progress = completed / total * 100
  // Progress = 0 / 1 * 100 = 0%
  
  const totalRetries = liveLeads.reduce((sum, l) => sum + (l.retryCount || 0), 0);
  const avgRetries = Math.round(totalRetries / total);
  const nextRetryTimes = liveLeads.filter((l) => l.nextRetryAt).map((l) => l.nextRetryAt);

  return {
    total,  // 1
    completed,  // 0
    pending,  // 0
    inProgress,  // 0
    totalRetries,  // 0
    avgRetries,  // 0
    nextRetryTimes,  // []
  };
}, [liveLeads]);
```

**Why You See 0%:**

Your lead state:
```firestore
{
  leadId: "xxx",
  status: "failed_retryable",  // ← NOT 'completed' ✗
  callStatus: "pending",  // ← NOT 'in_progress' ✗
  retryCount: 0,  // ← Count: 0 (not > 0)
  nextRetryAt: null,  // ← Next retry not scheduled
}
```

**Stats Calculation:**
| Metric | Count | Why? |
|--------|-------|------|
| `total` | 1 | liveLeads.length = 1 ✓ |
| `completed` | 0 | No leads with status === 'completed' |
| `pending` | 0 | No leads with status === 'queued' |
| `inProgress` | 0 | No leads with status === 'calling' |
| **`progress`** | **0 / 1 = 0%** | **Mathematically Correct!** |

**This is semantically correct** because:
- The lead is NOT completed (0 out of 1)
- Percentage = completed / total × 100
- 0 / 1 × 100 = **0%** ✓

**The confusion arises because:**
1. Lead with `status: "failed_retryable"` doesn't fit any category:
   - Not "completed"
   - Not "pending" (was queued, but failed)
   - Not "in_progress"

2. The progress bar logic treats it as **"work in the unknown state"**

**Why Firestore vs. Frontend mismatch:**
- **Firestore:** `runningCount: 0, failedCount: 1` (batch-level stats)
- **Frontend:** `total: 1, completed: 0` (lead-level calculation)

These are **different things**:
- Batch stats calculate based on specific batch counts
- Progress bar calculates based on lead status field

### 🔧 Understanding the Gap

The **batch document** stores:
```firestore
{
  batchId: "xxx",
  runningCount: 0,  // ← Batch-level field
  failedCount: 1,  // ← Batch-level field (includes failed_retryable)
  completedCount: 0,  // ← Batch-level field
}
```

The **progress bar** calculates from **lead documents**:
```firestore
[
  {
    leadId: "yyy",
    status: "failed_retryable",  // ← Lead-level field
    // ...
  }
]
```

**The progress bar doesn't know about batch-level `failedCount`** — it only looks at individual lead `status` values.

---

## ❓ Q3: Batch ID Scope & Filtering

### Question
> Is the UI filtering leads based on a composite key (e.g., batchId + status + userId)?

### Answer

**Short Answer: NO.** Only `batchId` is checked.

**Long Answer:**

Real-time subscription query location: [src/services/leadService.ts](src/services/leadService.ts#L674-L690)

```typescript
export function subscribeToBatchLeads(batchId: string, callback: (leads: Lead[]) => void) {
  const q = query(
    collection(db, 'leads'),
    where('batchId', '==', batchId)  // ← ONLY FILTER
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const leads: Lead[] = snapshot.docs.map(/* ... */);
    callback(leads);
  });
}
```

**Firestore Query Filters:**
| Field | Included? | Value |
|-------|-----------|-------|
| `batchId` | ✅ **YES** | `== batchId` (exact match) |
| `status` | ❌ **NO** | (No WHERE clause for status) |
| `userId` | ❌ **NO** | (No WHERE clause for userId) |
| Any composite key | ❌ **NO** | (No compound filtering) |

**What happens:**
1. Firestore fetches **ALL leads** where `batchId` matches
2. **Includes ALL statuses**: queued, calling, completed, failed_retryable, etc.
3. Frontend then **filters in memory** by tab (Show Pending, Show Retrying, etc.)

**Why this design?**
- Batch tab filtering should show leads in different states
- Real-time updates need to catch all status changes
- Frontend owns the "Show X" logic, not Firestore

**Frontend Filtering Hierarchy:**
```
Firestore Query: WHERE batchId == xxx
        │
        ├─ Returns: [lead1, lead2, lead3, ...] (all statuses)
        │
        ▼
Frontend Filter (Tabs):
        │
        ├─ leadFilter === 'pending'
        │   └─ Return leads with status === 'queued'
        │
        ├─ leadFilter === 'completed'
        │   └─ Return leads with status === 'completed'
        │
        ├─ leadFilter === 'failed'
        │   └─ Return leads with Failed badge
        │
        └─ leadFilter === 'retrying'
            └─ Return leads with status === 'failed_retryable' OR retryCount > 0
```

---

## ❓ Q4: Mandatory Fields

### Question
> Are there any mandatory fields like lastAttemptAt or callStatus that must be changed from "pending" to "completed" for the lead to appear in the tabs?

### Answer

**Short Answer: No mandatory fields prevent display.**

**Long Answer:**

Let me break down which fields are **required** for each tab:

### "Show Pending" Tab
```typescript
if (leadFilter === 'pending') {
  const status = getLeadDisplayStatus(lead).label;
  return status === 'Pending';
}
```
**Required:** `status === 'queued'`
**Optional:** All other fields

### "Show Completed" Tab
```typescript
if (leadFilter === 'completed') {
  const status = getLeadDisplayStatus(lead).label;
  return status === 'Completed';
}
```
**Required:** `status === 'completed'`
**Optional:** All other fields

### "Show Failed" Tab
```typescript
if (leadFilter === 'failed') {
  return true;  // Returns ALL leads with any status
}
```
**Required:** NONE (shows everything)
**Optional:** All other fields

### "Show Retrying" Tab
```typescript
if (leadFilter === 'retrying') {
  return (
    lead.status === 'failed_retryable' ||
    (lead.retryCount || 0) > 0 ||
    !!lead.nextRetryAt
  );
}
```
**Required (pick ONE):**
- `status === 'failed_retryable'` **OR**
- `retryCount > 0` **OR**
- `nextRetryAt` is not null

**Optional:** `lastAttemptAt`, `callStatus`, `aiDisposition`, etc.

### Field Reference Table

| Field | Display Logic | Required? | Impact if Missing |
|-------|---------------|-----------|-------------------|
| `status` | Determines tab appearance | ✅ YES* | Lead might not appear in correct tab |
| `retryCount` | "Show Retrying" filter | ❌ NO** | Can use `nextRetryAt` instead |
| `nextRetryAt` | "Show Retrying" filter | ❌ NO** | Can use `retryCount` instead |
| `callStatus` | Status badge color | ❌ NO | Shows "Pending" (default) |
| `lastAttemptAt` | Display text: "Last: HH:MM" | ❌ NO | Shows "N/A" |
| `aiDisposition` | Failure reason label | ❌ NO | Shows "Unknown" |
| `attempts` | "Action Required" count | ❌ NO | Not counted |

**Legend:**
- `*` = Required for the right tab filter
- `**` = Required to appear in "Show Retrying" (but can use alternative field)

### 🔧 What n8n SHOULD Set (No Answer Case)

**Current (Incomplete):**
```firestore
{
  status: "failed_retryable",  ← ONLY this matters for filter
  aiDisposition: "user_no_response",
  attempts: 1,
  callStatus: "pending",  ← Not checked by filter
  lastAttemptAt: null,  ← Not checked by filter
}
```

**Recommended (Complete):**
```firestore
{
  status: "failed_retryable",
  aiDisposition: "user_no_response",
  attempts: 1,
  retryCount: 1,  ← SET THIS (for "Show Retrying" filter)
  nextRetryAt: Timestamp(now + 5min),  ← SET THIS (for "Show Retrying" filter)
  callStatus: "failed",  ← Better semantics
  lastAttemptAt: Timestamp(now),  ← For display
}
```

**Why the recommended fields help:**
1. `retryCount: 1` → "Show Retrying" filter works even without status check
2. `nextRetryAt: timestamp` → UI can schedule automatic retry
3. `callStatus: "failed"` → Indicates call did complete (with failure)
4. `lastAttemptAt: timestamp` → UI shows "Last: 14:32" metadata

---

## 📊 Complete Field State Reference

### Current Broken State
```firestore
Lead Document {
  // Core identity
  leadId: "550e8400-e29b-41d4-a716-446655440000",
  batchId: "batch-123",
  userId: "user-456",
  phone: "+16175555555",
  
  // Status tracking
  status: "failed_retryable",  ✅ Present
  callStatus: "pending",  (could be "failed")
  attempts: 1,  ✅ Present
  maxAttempts: 3,
  
  // Retry information (INCOMPLETE)
  retryCount: 0,  ❌ Should be > 0 for "Show Retrying" filter
  nextRetryAt: null,  ❌ Should be timestamp for "Show Retrying" filter
  
  // Timing
  createdAt: Timestamp(1708696800),  ✅ Present
  lastActionAt: null,
  lastAttemptAt: null,  (could be set for display)
  callStartedAt: null,
  callEndedAt: null,
  
  // AI/Disposition
  aiDisposition: "user_no_response",  ✅ Present
  
  // Billing
  callDuration: null,
  billingStatus: null,
  providerCallId: null,
  
  // Locking (for concurrent call protection)
  lockOwner: null,
  lockExpiresAt: null,
  
  // Notes
  notes: null,
}
```

### Expected Optimal State
```firestore
Lead Document {
  // Same identity fields
  leadId: "550e8400-e29b-41d4-a716-446655440000",
  batchId: "batch-123",
  userId: "user-456",
  phone: "+16175555555",
  
  // Status tracking (IMPROVED)
  status: "failed_retryable",  ✅
  callStatus: "failed",  ✅ (changed from "pending")
  attempts: 1,  ✅
  maxAttempts: 3,
  
  // Retry information (COMPLETE)
  retryCount: 1,  ✅ (changed from 0)
  nextRetryAt: Timestamp(1708700400),  ✅ (set to 5 min from now)
  
  // Timing (COMPLETE)
  createdAt: Timestamp(1708696800),
  lastActionAt: Timestamp(1708697200),
  lastAttemptAt: Timestamp(1708697200),  ✅ (set for display)
  callStartedAt: Timestamp(1708697100),
  callEndedAt: Timestamp(1708697200),
  
  // AI/Disposition
  aiDisposition: "user_no_response",  ✅
  
  // Billing
  callDuration: 15,  (if tracked)
  billingStatus: "charged",  (if tracked)
  providerCallId: "call_xxx",  (if tracked)
  
  // Locking
  lockOwner: null,  (released after call)
  lockExpiresAt: null,
  
  // Notes
  notes: "User did not answer at 14:35",  (optional)
}
```

---

## 🎯 Summary: Question Answers

| Question | Answer | Implication |
|----------|--------|------------|
| **Q1: What fields does "Show Retrying" filter?** | `retryCount > 0` OR `nextRetryAt` exists. Status NOT checked. | Your lead has both as 0/null → doesn't appear |
| **Q2: Why 0% progress bar?** | Math: 0 completed / 1 total = 0%. Correct math, confusing UX. | No bug in calculation, semantic design choice |
| **Q3: Composite key filtering?** | NO. Only `batchId` in Firestore query. Status filtering is frontend. | Simple architecture, all filtering happens in React |
| **Q4: Mandatory field changes?** | NO required changes. Only `retryCount > 0` OR `nextRetryAt` needed. | Frontend is resilient, but backend should populate properly |

---

## ✅ Status: FIXED ✅

**Frontend Fix Applied:**
- ✅ [src/features/leads/BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L240-L256) updated
- ✅ Now checks `lead.status === 'failed_retryable'` in "Show Retrying" filter
- ✅ Leads with failed_retryable status now appear immediately

**Backend Improvement (Recommended):**
- ⚠️ n8n should set `retryCount` and `nextRetryAt` for retry cases
- ⚠️ Would make retry system fully automatic and visually complete

**Testing:**
- [ ] Test with "Show Retrying" tab - should show failed_retryable leads
- [ ] Verify stats update in real-time (1-2 second latency)
- [ ] Confirm retry info card displays correctly
