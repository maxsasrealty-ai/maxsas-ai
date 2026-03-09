<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Visual Architecture - UI Sync Issue

## ðŸ”„ Complete Data Flow

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚                          USER CALLS LEAD (n8n)                              â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   Call Result: User No Answer  â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
          â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
          â”‚        n8n Marks Lead as failed_retryable          â”‚
          â”‚   âœ“ status: "failed_retryable"                     â”‚
          â”‚   âœ“ aiDisposition: "user_no_response"              â”‚
          â”‚   âœ“ attempts: 1                                    â”‚
          â”‚   âŒ retryCount: 0    (NOT SET)                    â”‚
          â”‚   âŒ nextRetryAt: null (NOT SET)                   â”‚
          â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   Firestore Document       â”‚
                    â”‚   Updated âœ…               â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚     Real-Time Listener (subscribeToBatchLeads)         â”‚
    â”‚  â€¢ Fetches ALL leads with WHERE batchId == batchId      â”‚
    â”‚  â€¢ NO pre-filtering by status                           â”‚
    â”‚  â€¢ Maps all fields: status, retryCount, nextRetryAt     â”‚
    â”‚  âœ… Syncs in 1-2 seconds                                â”‚
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
        â”‚     liveLeads Array (Component State)        â”‚
        â”‚   [                                          â”‚
        â”‚     {                                        â”‚
        â”‚       leadId: "xxx",                         â”‚
        â”‚       status: "failed_retryable",  âœ“         â”‚
        â”‚       aiDisposition: "user_no_response", âœ“   â”‚
        â”‚       attempts: 1,  âœ“                        â”‚
        â”‚       retryCount: 0,  âŒ (ZERO)              â”‚
        â”‚       nextRetryAt: null,  âŒ (NULL)          â”‚
        â”‚     }                                        â”‚
        â”‚   ]                                          â”‚
        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
    â”‚       filteredLeads useMemo (FILTERING LOGIC)          â”‚
    â”‚                                                        â”‚
    â”‚  if (leadFilter === 'retrying') {                      â”‚
    â”‚    return (                                            â”‚
    â”‚      lead.status === 'failed_retryable' ||  â† NEW      â”‚
    â”‚      (lead.retryCount || 0) > 0 ||          â† OLD      â”‚
    â”‚      !!lead.nextRetryAt                      â† OLD      â”‚
    â”‚    );                                                  â”‚
    â”‚  }                                                     â”‚
    â”‚                                                        â”‚
    â”‚  Check 1: lead.status === 'failed_retryable'           â”‚
    â”‚           "failed_retryable" === "failed_retryable"    â”‚
    â”‚           âœ… TRUE - INCLUDE LEAD                       â”‚
    â”‚                                                        â”‚
    â”‚  (Checks 2 & 3 are still skipped due to || short-circuit)
    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   Lead APPEARS in:         â”‚
                    â”‚   "Show Retrying" Tab âœ…   â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                     â”‚
                                     â–¼
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚   Dashboard Displays:      â”‚
                    â”‚   â€¢ Lead in contact list   â”‚
                    â”‚   â€¢ Status: Failed ðŸ”´      â”‚
                    â”‚   â€¢ Retry: 1/3 - Next...   â”‚
                    â”‚   â€¢ Progress bar updates   â”‚
                    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“Š Filter Decision Tree

```
                        [Show Retrying Clicked]
                                â”‚
                                â–¼
                    Is leadFilter === 'retrying'?
                                â”‚
                                â”œâ”€ YES
                                â”‚   â”‚
                                â”‚   â–¼
                        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                        â”‚ Check Filter Conditionâ”‚
                        â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                â”‚
                    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
                    â”‚           â”‚           â”‚
                    â–¼           â–¼           â–¼
         Check 1:     Check 2:     Check 3:
      status === failed_retryable  retryCount > 0  nextRetryAt !== null
                    â”‚           â”‚           â”‚
            âœ… TRUE   â”‚    âŒ FALSE â”‚    âŒ FALSE
                    â”‚           â”‚           â”‚
                    â””â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”˜          â”‚
                          â”‚               â”‚
                          â–¼               â–¼
                    RETURN TRUE    (short-circuit evaluates Check 1 as SUCCESS)
                          â”‚
                          â–¼
                    âœ… LEAD INCLUDED IN FILTER
```

---

## ðŸ”´ BEFORE FIX (Broken State)

```
Lead Firestore State:
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ status: "failed_retryable" âœ“    â”‚
â”‚ aiDisposition: "user_no_response"â”‚
â”‚ attempts: 1                      â”‚
â”‚ retryCount: 0 âŒ                â”‚
â”‚ nextRetryAt: null âŒ            â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
Frontend Filter (Show Retrying):
if (leadFilter === 'retrying') {
  return (lead.retryCount || 0) > 0 || !!lead.nextRetryAt;
         â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                   0 > 0?      null is truthy?
                   âŒ FALSE    âŒ FALSE
         â”‚
         â–¼
    âŒ RETURN FALSE
         â”‚
         â–¼
    Lead FILTERED OUT
         â”‚
         â–¼
    UI Shows "No contacts in this batch" âŒ
```

---

## ðŸŸ¢ AFTER FIX (Working State)

```
Lead Firestore State:
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ status: "failed_retryable" âœ“    â”‚
â”‚ aiDisposition: "user_no_response"â”‚
â”‚ attempts: 1                      â”‚
â”‚ retryCount: 0 (or 1 with backend)
â”‚ nextRetryAt: null (or timestamp with backend)
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
         â”‚
         â–¼
Frontend Filter (Show Retrying):
if (leadFilter === 'retrying') {
  return (
    lead.status === 'failed_retryable' ||  â† NEW CHECK
    (lead.retryCount || 0) > 0 ||
    !!lead.nextRetryAt
  );
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
      "failed_retryable" === "failed_retryable"
                âœ… TRUE
         â”‚
         â–¼
    âœ… RETURN TRUE (short-circuit)
         â”‚
         â–¼
    Lead INCLUDED IN FILTER
         â”‚
         â–¼
    UI Shows Lead in "Show Retrying" Tab âœ…
```

---

## ðŸ“± Component Hierarchy

```
BatchDetailScreen
â”‚
â”œâ”€ useEffect: Subscribe to batch leads
â”‚  â””â”€ subscribeToBatchLeads(batchId)
â”‚     â””â”€ query: WHERE batchId == batchId (no status filter)
â”‚        â””â”€ onSnapshot callback: setLiveLeads(leads)
â”‚
â”œâ”€ useState: liveLeads (real-time)
â”‚  â””â”€ Updated every 1-2 seconds from Firestore
â”‚
â”œâ”€ useMemo: calculateStats(liveLeads)
â”‚  â””â”€ completed = filter: status === 'completed'
â”‚  â””â”€ pending = filter: status === 'queued'
â”‚  â””â”€ inProgress = filter: status === 'calling' OR callStatus === 'in_progress'
â”‚  â””â”€ totalRetries = sum of retryCount
â”‚
â”œâ”€ useState: leadFilter
â”‚  â””â”€ 'pending' | 'completed' | 'failed' | 'retrying'
â”‚  â””â”€ Controlled by tab buttons
â”‚
â”œâ”€ useMemo: filteredLeads(leadFilter, liveLeads)
â”‚  â”œâ”€ if leadFilter === 'retrying':
â”‚  â”‚   return leads WHERE (
â”‚  â”‚     status === 'failed_retryable' ||      â† FIX ADDED
â”‚  â”‚     retryCount > 0 ||
â”‚  â”‚     nextRetryAt !== null
â”‚  â”‚   )
â”‚  â””â”€ else: returns filtered by status badge
â”‚
â””â”€ Render: FilterTabs + ContactsList
   â””â”€ Show filteredLeads in list
      â””â”€ if filteredLeads.length === 0
         â””â”€ Show "No contacts in this batch" message
```

---

## ðŸ§ª Test Scenarios

### Scenario 1: BEFORE FIX âŒ

```
Setup:
â”œâ”€ User calls lead
â”œâ”€ No answer (user_no_response)
â””â”€ n8n marks as failed_retryable

Firestore State:
â”œâ”€ status: "failed_retryable" âœ“
â”œâ”€ aiDisposition: "user_no_response" âœ“
â”œâ”€ attempts: 1 âœ“
â”œâ”€ retryCount: 0 âŒ
â””â”€ nextRetryAt: null âŒ

Frontend Filter Check:
if (leadFilter === 'retrying') {
  return (0 > 0) || (null !== null)
  return false || false
  return false  âŒ
}

Dashboard Result:
â”œâ”€ "Show Retrying" tab: Empty âŒ
â”œâ”€ "Show Failed" tab: Shows lead âœ“ (has Failed badge)
â”œâ”€ "Action Required" count: 1 âœ“ (counts failed_retryable leads)
â””â”€ Progress bar: 0/1 = 0% âœ“ (correct, but confusing)
```

### Scenario 2: AFTER FIX âœ…

```
Setup:
â”œâ”€ User calls lead
â”œâ”€ No answer (user_no_response)
â””â”€ n8n marks as failed_retryable

Firestore State:
â”œâ”€ status: "failed_retryable" âœ“
â”œâ”€ aiDisposition: "user_no_response" âœ“
â”œâ”€ attempts: 1 âœ“
â”œâ”€ retryCount: 0 (or 1 with backend) âœ“
â””â”€ nextRetryAt: null (or timestamp with backend) âœ“

Frontend Filter Check:
if (leadFilter === 'retrying') {
  return (
    "failed_retryable" === "failed_retryable" ||  â† TRUE
    (0 > 0) ||
    (null !== null)
  )
  return true  âœ…
}

Dashboard Result:
â”œâ”€ "Show Retrying" tab: Shows lead âœ…
â”œâ”€ "Show Failed" tab: Shows lead âœ…
â”œâ”€ "Action Required" count: 1 âœ“
â””â”€ Progress bar: Properly calculates with retrying leads âœ“
```

---

## ðŸ”„ Real-Time Sync Timeline

```
Time    Event                                    UI State
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

T+0s    User doesn't answer call
        â”‚
        â”œâ”€ n8n marks as failed_retryable
        â”‚
        â””â”€ Firestore write completes

T+1s    Real-time listener detects change
        â”‚
        â”œâ”€ Fetches all leads for batch
        â”‚
        â”œâ”€ Maps to liveLeads state
        â”‚
        â””â”€ Component re-renders

T+2s    Filter evaluates (new logic)
        â”‚
        â”œâ”€ Checks: status === 'failed_retryable'? âœ… YES
        â”‚
        â”œâ”€ Includes lead in filteredLeads
        â”‚
        â””â”€ "Show Retrying" tab now shows 1 contact

T+3s    Stats update
        â”‚
        â”œâ”€ "Retry Information" card visible
        â”‚
        â”œâ”€ "Action Required" count shows 1
        â”‚
        â””â”€ User sees lead ready for retry action
```

---

## ðŸŽ¯ Key Takeaways

| Aspect | Detail |
|--------|--------|
| **Real-Time Sync** | âœ… Works perfectly (1-2 sec latency) |
| **Data Fetching** | âœ… No pre-filtering (gets all leads) |
| **Filter Logic** | âŒ Missing status check (FIXED) |
| **Field Mapping** | âœ… All fields properly mapped |
| **Batch Scope** | âœ… Only batchId filtering (correct) |
| **Backend State** | âš ï¸ retryCount/nextRetryAt not set (improvement) |

---

## ðŸ“ Next Phase: Backend Integration

Once frontend is fixed, next improvement is to have n8n also set:

```firestore
When marking as failed_retryable:
â”œâ”€ retryCount: 1  (vs. 0)
â”œâ”€ nextRetryAt: timestamp  (vs. null)
â””â”€ callStatus: "failed"  (vs. "pending")

Result:
â”œâ”€ Frontend filter works with all 3 conditions
â”œâ”€ Retry information card shows more detail
â””â”€ Automatic retry system can schedule next call
```


