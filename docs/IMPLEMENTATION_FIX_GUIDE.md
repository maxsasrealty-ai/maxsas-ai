<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Implementation Fix Guide - UI Sync Issue

## Problem Summary

When n8n marks a lead as `failed_retryable` (user didn't answer), the Dashboard UI shows **"No contacts in this batch"** in the "Show Retrying" tab because:

1. **`retryCount` is 0** (not incremented on retry failure)
2. **`nextRetryAt` is null** (not scheduled)
3. Frontend filter requires **EITHER** `retryCount > 0` OR `nextRetryAt` to display in "Show Retrying"

---

## ðŸ› ï¸ Frontend Solution (Quick Fix)

### File: [src/features/leads/BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L240-L256)

**Make leads with `status === 'failed_retryable'` appear in "Show Retrying" tab:**

```typescript
//* BEFORE (Lines 240-256)
const filteredLeads = useMemo(() => {
  if (batch?.status === 'draft') return liveLeads;

  return liveLeads.filter((lead) => {
    if (leadFilter === 'failed') {
      return true;  // Show all failed leads
    }

    if (leadFilter === 'retrying') {
      return (lead.retryCount || 0) > 0 || !!lead.nextRetryAt;  // â† ISSUE: Missing status check
    }

    const status = getLeadDisplayStatus(lead).label;
    if (leadFilter === 'pending') return status === 'Pending';
    if (leadFilter === 'completed') return status === 'Completed';
    if (leadFilter === 'failed') return status === 'Failed';
    return true;
  });
}, [batch?.status, leadFilter, liveLeads]);

// âœ… AFTER (Lines 240-256)
const filteredLeads = useMemo(() => {
  if (batch?.status === 'draft') return liveLeads;

  return liveLeads.filter((lead) => {
    if (leadFilter === 'failed') {
      return true;
    }

    if (leadFilter === 'retrying') {
      // âœ… FIX: Include leads with failed_retryable status OR scheduled retries
      return (
        lead.status === 'failed_retryable' ||  // â† NEW: Add this check
        (lead.retryCount || 0) > 0 ||
        !!lead.nextRetryAt
      );
    }

    const status = getLeadDisplayStatus(lead).label;
    if (leadFilter === 'pending') return status === 'Pending';
    if (leadFilter === 'completed') return status === 'Completed';
    if (leadFilter === 'failed') return status === 'Failed';
    return true;
  });
}, [batch?.status, leadFilter, liveLeads]);
```

---

## ðŸ”„ Backend / n8n Solution (Recommended)

When n8n marks a lead as `failed_retryable` due to "no answer", also update:

1. **Increment `retryCount`**
2. **Schedule next retry (`nextRetryAt`)**

### Firestore Update in n8n Workflow

When handling `user_no_response`:

```javascript
{
  // Existing fields
  status: "failed_retryable",
  aiDisposition: "user_no_response",
  attempts: <attempts + 1>,
  
  // NEW: Add retry information
  retryCount: <retryCount + 1>,  // Was: 0 â†’ Now: 1
  nextRetryAt: new Date(now + 5 * 60 * 1000),  // Schedule 5 min from now
  lastAttemptAt: new Date(),
  callStatus: "failed"  // or "no_response" if custom
}
```

### Firestore Security Rules Update

Ensure `retryCount` and `nextRetryAt` can be written:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leads/{leadId} {
      allow write if request.auth.uid == resource.data.userId && (
        request.resource.data.retryCount is int &&
        request.resource.data.nextRetryAt is timestamp
      );
    }
  }
}
```

---

## ðŸŽ¯ Testing Checklist

### Test Case: User No Response (No Answer)

**Setup:**
1. Create batch with 1 lead
2. n8n calls the number â†’ user doesn't answer

**Expected n8n Action:**
```firestore
Lead Document Update:
âœ“ status: "failed_retryable"
âœ“ aiDisposition: "user_no_response"
âœ“ attempts: 1
âœ“ retryCount: 1 (NEW - was 0)
âœ“ nextRetryAt: <timestamp 5 min from now> (NEW - was null)
```

**Expected Frontend Behavior:**
1. Batch Dashboard â†’ Click batch
2. Click "Show Retrying" tab
3. Lead appears in list with:
   - Status badge: ðŸ”´ Failed (user_no_response)
   - Retry info: "Retry: 1/3 â€“ Next at HH:MM"
   - Next retry scheduled banner

**Verification:**
- [ ] Lead appears in "Show Retrying" tab
- [ ] Retry info card shows "1 contact(s) scheduled for retry"
- [ ] Progress bar updates correctly
- [ ] Real-time sync triggers within 1-2 seconds

---

## ðŸ“Š Field State Reference

### Before Fix (BROKEN STATE)

```firestore
Lead Document {
  leadId: "xxx",
  batchId: "yyy",
  status: "failed_retryable",
  aiDisposition: "user_no_response",
  attempts: 1,
  
  // âŒ Missing for "Show Retrying" filter
  retryCount: 0,  â† ZERO (filter blocks display)
  nextRetryAt: null,  â† NULL (filter blocks display)
  callStatus: "pending",
  lastAttemptAt: null,
}
```

### After Fix (EXPECTED STATE)

```firestore
Lead Document {
  leadId: "xxx",
  batchId: "yyy",
  status: "failed_retryable",
  aiDisposition: "user_no_response",
  attempts: 1,
  
  // âœ… Set by n8n/backend
  retryCount: 1,  â† INCREMENTED (filter allows display)
  nextRetryAt: Timestamp(now + 300s),  â† SET (filter allows display)
  callStatus: "failed",  â† Updated status
  lastAttemptAt: Timestamp(now),  â† Track attempt time
}
```

---

## ðŸ”§ Code Changes Summary

| File | Change | Benefit |
|------|--------|---------|
| [BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L240-L256) | Add `lead.status === 'failed_retryable'` check to retrying filter | **Immediate fix** - "Show Retrying" now shows failed_retryable leads |
| n8n Workflow (Backend) | Set `retryCount` and `nextRetryAt` on retry | **Proper fix** - Aligns backend state with frontend expectations |

---

## ðŸš€ Implementation Plan

### Phase 1: Frontend (Immediate - 5 min)
1. Edit [BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx#L240-L256)
2. Add status check to retrying filter
3. Test with existing "failed_retryable" leads
4. âœ… Leads now appear in "Show Retrying" tab

### Phase 2: Backend (Proper - 30 min)
1. Update n8n workflow to increment `retryCount`
2. Schedule `nextRetryAt` when marking as failed_retryable
3. Test with new calls
4. âœ… Both frontend and backend properly synced

### Phase 3: Monitoring (Ongoing)
1. Monitor batch detail screens for leads in "Show Retrying"
2. Verify retry counts and next retry times
3. Confirm calls re-attempt at scheduled times

---

## ðŸ“ Related Files

- **Main Issue:** `Lead with status: "failed_retryable" doesn't show in "Show Retrying" tab`
- **Docs:** [DEBUGGING_UI_SYNC_ISSUE.md](./DEBUGGING_UI_SYNC_ISSUE.md)
- **Affected Files:**
  - [src/features/leads/BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx) - Frontend filter
  - `n8n workflow` - Backend retry logic

---

## âœ… Success Criteria

After applying both fixes:

- [ ] Lead with `status: "failed_retryable"` appears in "Show Retrying" tab
- [ ] Retry count shows as "1/3" in lead metadata
- [ ] Next retry time displays in orange banner
- [ ] Real-time updates sync within 1-2 seconds
- [ ] Progress bar calculation includes retrying leads
- [ ] "Action Required" stats show correct count
- [ ] Retry system fully functional end-to-end

---

## ðŸŽ¬ Quick Start (Frontend Fix Only)

Replace lines 240-256 in [BatchDetailScreen.tsx](src/features/leads/BatchDetailScreen.tsx):

```typescript
const filteredLeads = useMemo(() => {
  if (batch?.status === 'draft') return liveLeads;

  return liveLeads.filter((lead) => {
    if (leadFilter === 'failed') {
      return true;
    }

    if (leadFilter === 'retrying') {
      return (
        lead.status === 'failed_retryable' ||  // â† ADD THIS LINE
        (lead.retryCount || 0) > 0 ||
        !!lead.nextRetryAt
      );
    }

    const status = getLeadDisplayStatus(lead).label;
    if (leadFilter === 'pending') return status === 'Pending';
    if (leadFilter === 'completed') return status === 'Completed';
    if (leadFilter === 'failed') return status === 'Failed';
    return true;
  });
}, [batch?.status, leadFilter, liveLeads]);
```

Then test with "Show Retrying" tab. Lead should appear immediately! âœ…


