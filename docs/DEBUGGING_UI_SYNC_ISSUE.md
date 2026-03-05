# UI Sync Issue - Investigation Report

**Date:** February 23, 2026  
**Issue:** Dashboard "Show Retrying" tab shows "No contacts in this batch" despite leads marked as `failed_retryable` in Firestore  
**Status:** ✅ Root Cause Identified

---

## 🔴 Root Cause Analysis

### **Issue 1: "Show Retrying" Filter Logic (CRITICAL)**

**Location:** [src/features/leads/BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L248-L250)

```typescript
if (leadFilter === 'retrying') {
  return (lead.retryCount || 0) > 0 || !!lead.nextRetryAt;
}
```

**Problem:**
The filter ONLY shows leads where **EITHER**:
- `retryCount > 0` **OR**
- `nextRetryAt` is set (truthy)

**Your Test Case:**
- Lead has `status: "failed_retryable"` ✅
- Lead has `attempts: 1` ✅
- BUT: `retryCount: 0` (not set yet) ❌
- AND: `nextRetryAt: null` (not scheduled yet) ❌

**Result:** Lead is filtered OUT and doesn't appear in "Show Retrying" tab

---

### **Issue 2: Missing Lead Status Check**

**Location:** [src/features/leads/BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L209-L213)

The `getLeadDisplayStatus()` function maps `failed_retryable` to "Failed" status:

```typescript
const getLeadDisplayStatus = (lead: Lead) => {
  if (lead.status === 'failed_retryable') {
    return { label: 'Failed', color: '#ef4444', emoji: '🔴' };
  }
  // ...
}
```

However, the "Show Retrying" filter **completely ignores** the `status` field and **only checks** `retryCount` and `nextRetryAt`.

---

### **Issue 3: Progress Bar Calculation**

**Location:** [src/features/leads/BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L160-L175)

```typescript
const calculateStats = useCallback(() => {
  const total = liveLeads.length;
  const completed = liveLeads.filter((l) => l.status === 'completed').length;
  const pending = liveLeads.filter((l) => l.status === 'queued').length;
  const inProgress = liveLeads.filter((l) => l.status === 'calling' || l.callStatus === 'in_progress').length;
  // ...
}, [liveLeads]);
```

**Problem:**
- Progress bar counts: `Completed / Total`
- If you have 1 lead with `status: "failed_retryable"`, it counts as:
  - NOT completed (✓)
  - NOT queued (✓)
  - NOT in_progress (✓)
  
The lead is **not included in any count**, but it **IS included in total**, which may cause percentage display issues or zero-progress state.

---

### **Issue 4: Real-Time Subscription Query**

**Location:** [src/services/leadService.ts](src/services/leadService.ts#L674-L690)

```typescript
export function subscribeToBatchLeads(batchId: string, callback: (leads: Lead[]) => void) {
  const q = query(
    collection(db, 'leads'),
    where('batchId', '==', batchId)  // ← Only filters by batchId
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const leads: Lead[] = snapshot.docs.map((doc) => {
      return {
        // Maps all fields
        status: normalizeLeadStatus(data.status),
        retryCount: data.retryCount || 0,
        nextRetryAt: data.nextRetryAt || null,
        // ...
      } as Lead;
    });
    callback(leads);
  });
}
```

**Scope:** ✅ Correctly fetches **all leads** for the batch (no pre-filtering by status)

**Sync:** ✅ Real-time listener properly syncs updates from Firestore

---

## 📋 Answers to Your Questions

### **Q1: Frontend Filtering Logic**

**What exact Firestore fields does the "Show Retrying" tab filter on?**

- **Primary Filter:** `retryCount > 0`
- **Secondary Filter:** `nextRetryAt` is not null
- **Status Check:** NO check on `status: "failed_retryable"`

**Missing Logic:** Should also check `status === 'failed_retryable'` to appear as "retrying"

---

### **Q2: Progress Bar Showing 0%**

**Why is the Progress Bar showing 0% even though runningCount is 0 and totalContacts is 1?**

The progress bar logic calculates:
```typescript
Percentage = (completed / total) × 100
```

If you have:
- `total = 1` (from liveLeads.length)
- `completed = 0` (no leads with `status: 'completed'`)
- `failed_retryable` lead is counted in total but NOT in any stat category

**Result:** 0 completed / 1 total = **0%** ✓ (Mathematically correct, but semantically confusing)

The issue is that `failed_retryable` leads should probably be:
1. Excluded from progress percentage (not part of initial scope), OR
2. Counted as "pending"/"pending retry" (part of work remaining)

---

### **Q3: Batch ID Scope**

**Is the UI filtering leads based on a composite key (batchId + status + userId)?**

**No.** The subscription query only filters on:
- `where('batchId', '==', batchId)` ← Only field checked

**No userId/status pre-filtering** - all leads for that batch are fetched.

The frontend then applies **tab filters** (Show Pending, Show Retrying, Show Completed, etc.) in memory.

---

### **Q4: Mandatory Fields**

**Are there mandatory fields like lastAttemptAt or callStatus that must be changed for leads to appear?**

**No mandatory fields for display.**

However:
- `retryCount > 0` **IS required** for "Show Retrying" tab
- `nextRetryAt` **CAN substitute** for retryCount > 0

**Your current state lacks both**, so the lead won't appear.

---

## ✅ The Complete Picture

| Field | Your Value | Required for Tab? | Status |
|-------|-----------|-------------------|--------|
| `status` | `"failed_retryable"` | ❌ No | Shows as "Failed" in display |
| `attempts` | `1` | ❌ No | Used for "Action Required" count |
| `retryCount` | `0` (or null) | ✅ YES | Missing - **BLOCKS** "Show Retrying" |
| `nextRetryAt` | `null` | ✅ YES (if retryCount=0) | Missing - **BLOCKS** "Show Retrying" |
| `callStatus` | `"pending"` (presumably) | ❌ No | Not checked for retrying filter |
| `aiDisposition` | `"user_no_response"` | ❌ No | Used for display only |

---

## 🔧 Fix Implementation

### **Option A: Update n8n Workflow to Set retryCount**

When n8n marks a lead as `failed_retryable`, it should set:

```firestore
{
  status: "failed_retryable",
  retryCount: 1,  // ← INCREMENT THIS on each retry failure
  nextRetryAt: Timestamp(Date.now() + 5 * 60 * 1000),  // 5 min from now
  aiDisposition: "user_no_response",
  // ... other fields
}
```

### **Option B: Update Frontend Filter Logic**

Modify [BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L248-L250):

```typescript
if (leadFilter === 'retrying') {
  return (
    lead.status === 'failed_retryable' ||  // ← ADD THIS
    (lead.retryCount || 0) > 0 ||
    !!lead.nextRetryAt
  );
}
```

### **Option C: Both (Recommended)**

1. Fix n8n to set `retryCount` when marking as `failed_retryable`
2. Update frontend filter to also accept `status === 'failed_retryable'` (defensive)

This ensures:
- Proper state in Firestore
- UI resilience against missing fields
- Future-proof retry counting

---

## 🧪 Verification Steps

After implementing the fix:

1. **Firestore Check:**
   ```
   Lead Doc:
   - status: "failed_retryable" ✓
   - retryCount: 1 ✓ (WAS: 0)
   - nextRetryAt: <timestamp> ✓ (WAS: null)
   - attempts: 1 ✓
   - aiDisposition: "user_no_response" ✓
   ```

2. **Dashboard Check:**
   - Navigate to batch detail screen
   - Click "Show Retrying" tab
   - Lead should appear ✓

3. **Stats Check:**
   - Progress bar should update percentage
   - Retry info card should show "1 contact(s) scheduled for retry"

---

## 📊 Real-Time Sync Status

- **Subscription:** ✅ Working (only batchId filter)
- **Data Fetch:** ✅ No pre-filtering by status
- **Field Mapping:** ✅ All critical fields mapped
- **Cleanup:** ✅ Proper unsubscribe on component unmount

Real-time updates **WILL sync immediately** once Firestore is updated with `retryCount > 0`.

---

## 📝 Summary Table

| Question | Answer | Root Cause |
|----------|--------|-----------|
| Why no leads in "Show Retrying"? | `retryCount === 0` AND `nextRetryAt === null` | Filter checks these 2 fields only |
| Why 0% progress bar? | No completed leads = 0/1 = 0% | Correct calculation, semantic issue |
| Any composite key filtering? | No, only batchId | Simple query, all leads fetched |
| Mandatory fields for display? | `retryCount > 0` or `nextRetryAt` set | Required by "Show Retrying" tab filter |

---

## 🚀 Next Steps

1. **Update n8n workflow** to set `retryCount` when creating retry attempts
2. **Update frontend filter** to include `status === 'failed_retryable'` check (defensive)
3. **Test end-to-end** with actual workflow

See [IMPLEMENTATION_FIX_GUIDE.md](./IMPLEMENTATION_FIX_GUIDE.md) for detailed code changes.
