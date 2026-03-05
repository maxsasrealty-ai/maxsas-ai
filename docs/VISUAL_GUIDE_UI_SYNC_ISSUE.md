# Visual Architecture - UI Sync Issue

## 🔄 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          USER CALLS LEAD (n8n)                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────────┐
                    │   Call Result: User No Answer  │
                    └────────────────────────────────┘
                                     │
                                     ▼
          ┌────────────────────────────────────────────────────┐
          │        n8n Marks Lead as failed_retryable          │
          │   ✓ status: "failed_retryable"                     │
          │   ✓ aiDisposition: "user_no_response"              │
          │   ✓ attempts: 1                                    │
          │   ❌ retryCount: 0    (NOT SET)                    │
          │   ❌ nextRetryAt: null (NOT SET)                   │
          └────────────────────────────────────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────┐
                    │   Firestore Document       │
                    │   Updated ✅               │
                    └────────────────────────────┘
                                     │
                                     ▼
    ┌────────────────────────────────────────────────────────┐
    │     Real-Time Listener (subscribeToBatchLeads)         │
    │  • Fetches ALL leads with WHERE batchId == batchId      │
    │  • NO pre-filtering by status                           │
    │  • Maps all fields: status, retryCount, nextRetryAt     │
    │  ✅ Syncs in 1-2 seconds                                │
    └────────────────────────────────────────────────────────┘
                                     │
                                     ▼
        ┌──────────────────────────────────────────────┐
        │     liveLeads Array (Component State)        │
        │   [                                          │
        │     {                                        │
        │       leadId: "xxx",                         │
        │       status: "failed_retryable",  ✓         │
        │       aiDisposition: "user_no_response", ✓   │
        │       attempts: 1,  ✓                        │
        │       retryCount: 0,  ❌ (ZERO)              │
        │       nextRetryAt: null,  ❌ (NULL)          │
        │     }                                        │
        │   ]                                          │
        └──────────────────────────────────────────────┘
                                     │
                                     ▼
    ┌────────────────────────────────────────────────────────┐
    │       filteredLeads useMemo (FILTERING LOGIC)          │
    │                                                        │
    │  if (leadFilter === 'retrying') {                      │
    │    return (                                            │
    │      lead.status === 'failed_retryable' ||  ← NEW      │
    │      (lead.retryCount || 0) > 0 ||          ← OLD      │
    │      !!lead.nextRetryAt                      ← OLD      │
    │    );                                                  │
    │  }                                                     │
    │                                                        │
    │  Check 1: lead.status === 'failed_retryable'           │
    │           "failed_retryable" === "failed_retryable"    │
    │           ✅ TRUE - INCLUDE LEAD                       │
    │                                                        │
    │  (Checks 2 & 3 are still skipped due to || short-circuit)
    └────────────────────────────────────────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────┐
                    │   Lead APPEARS in:         │
                    │   "Show Retrying" Tab ✅   │
                    └────────────────────────────┘
                                     │
                                     ▼
                    ┌────────────────────────────┐
                    │   Dashboard Displays:      │
                    │   • Lead in contact list   │
                    │   • Status: Failed 🔴      │
                    │   • Retry: 1/3 - Next...   │
                    │   • Progress bar updates   │
                    └────────────────────────────┘
```

---

## 📊 Filter Decision Tree

```
                        [Show Retrying Clicked]
                                │
                                ▼
                    Is leadFilter === 'retrying'?
                                │
                                ├─ YES
                                │   │
                                │   ▼
                        ┌───────────────────────┐
                        │ Check Filter Condition│
                        └───────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
         Check 1:     Check 2:     Check 3:
      status === failed_retryable  retryCount > 0  nextRetryAt !== null
                    │           │           │
            ✅ TRUE   │    ❌ FALSE │    ❌ FALSE
                    │           │           │
                    └─────┬─────┘          │
                          │               │
                          ▼               ▼
                    RETURN TRUE    (short-circuit evaluates Check 1 as SUCCESS)
                          │
                          ▼
                    ✅ LEAD INCLUDED IN FILTER
```

---

## 🔴 BEFORE FIX (Broken State)

```
Lead Firestore State:
┌─────────────────────────────────┐
│ status: "failed_retryable" ✓    │
│ aiDisposition: "user_no_response"│
│ attempts: 1                      │
│ retryCount: 0 ❌                │
│ nextRetryAt: null ❌            │
└─────────────────────────────────┘
         │
         ▼
Frontend Filter (Show Retrying):
if (leadFilter === 'retrying') {
  return (lead.retryCount || 0) > 0 || !!lead.nextRetryAt;
         └─────────────────────┬────────────────────┘
                   0 > 0?      null is truthy?
                   ❌ FALSE    ❌ FALSE
         │
         ▼
    ❌ RETURN FALSE
         │
         ▼
    Lead FILTERED OUT
         │
         ▼
    UI Shows "No contacts in this batch" ❌
```

---

## 🟢 AFTER FIX (Working State)

```
Lead Firestore State:
┌─────────────────────────────────┐
│ status: "failed_retryable" ✓    │
│ aiDisposition: "user_no_response"│
│ attempts: 1                      │
│ retryCount: 0 (or 1 with backend)
│ nextRetryAt: null (or timestamp with backend)
└─────────────────────────────────┘
         │
         ▼
Frontend Filter (Show Retrying):
if (leadFilter === 'retrying') {
  return (
    lead.status === 'failed_retryable' ||  ← NEW CHECK
    (lead.retryCount || 0) > 0 ||
    !!lead.nextRetryAt
  );
  └──────────────┬──────────────┘
      "failed_retryable" === "failed_retryable"
                ✅ TRUE
         │
         ▼
    ✅ RETURN TRUE (short-circuit)
         │
         ▼
    Lead INCLUDED IN FILTER
         │
         ▼
    UI Shows Lead in "Show Retrying" Tab ✅
```

---

## 📱 Component Hierarchy

```
BatchDetailScreen
│
├─ useEffect: Subscribe to batch leads
│  └─ subscribeToBatchLeads(batchId)
│     └─ query: WHERE batchId == batchId (no status filter)
│        └─ onSnapshot callback: setLiveLeads(leads)
│
├─ useState: liveLeads (real-time)
│  └─ Updated every 1-2 seconds from Firestore
│
├─ useMemo: calculateStats(liveLeads)
│  └─ completed = filter: status === 'completed'
│  └─ pending = filter: status === 'queued'
│  └─ inProgress = filter: status === 'calling' OR callStatus === 'in_progress'
│  └─ totalRetries = sum of retryCount
│
├─ useState: leadFilter
│  └─ 'pending' | 'completed' | 'failed' | 'retrying'
│  └─ Controlled by tab buttons
│
├─ useMemo: filteredLeads(leadFilter, liveLeads)
│  ├─ if leadFilter === 'retrying':
│  │   return leads WHERE (
│  │     status === 'failed_retryable' ||      ← FIX ADDED
│  │     retryCount > 0 ||
│  │     nextRetryAt !== null
│  │   )
│  └─ else: returns filtered by status badge
│
└─ Render: FilterTabs + ContactsList
   └─ Show filteredLeads in list
      └─ if filteredLeads.length === 0
         └─ Show "No contacts in this batch" message
```

---

## 🧪 Test Scenarios

### Scenario 1: BEFORE FIX ❌

```
Setup:
├─ User calls lead
├─ No answer (user_no_response)
└─ n8n marks as failed_retryable

Firestore State:
├─ status: "failed_retryable" ✓
├─ aiDisposition: "user_no_response" ✓
├─ attempts: 1 ✓
├─ retryCount: 0 ❌
└─ nextRetryAt: null ❌

Frontend Filter Check:
if (leadFilter === 'retrying') {
  return (0 > 0) || (null !== null)
  return false || false
  return false  ❌
}

Dashboard Result:
├─ "Show Retrying" tab: Empty ❌
├─ "Show Failed" tab: Shows lead ✓ (has Failed badge)
├─ "Action Required" count: 1 ✓ (counts failed_retryable leads)
└─ Progress bar: 0/1 = 0% ✓ (correct, but confusing)
```

### Scenario 2: AFTER FIX ✅

```
Setup:
├─ User calls lead
├─ No answer (user_no_response)
└─ n8n marks as failed_retryable

Firestore State:
├─ status: "failed_retryable" ✓
├─ aiDisposition: "user_no_response" ✓
├─ attempts: 1 ✓
├─ retryCount: 0 (or 1 with backend) ✓
└─ nextRetryAt: null (or timestamp with backend) ✓

Frontend Filter Check:
if (leadFilter === 'retrying') {
  return (
    "failed_retryable" === "failed_retryable" ||  ← TRUE
    (0 > 0) ||
    (null !== null)
  )
  return true  ✅
}

Dashboard Result:
├─ "Show Retrying" tab: Shows lead ✅
├─ "Show Failed" tab: Shows lead ✅
├─ "Action Required" count: 1 ✓
└─ Progress bar: Properly calculates with retrying leads ✓
```

---

## 🔄 Real-Time Sync Timeline

```
Time    Event                                    UI State
────────────────────────────────────────────────────────────────

T+0s    User doesn't answer call
        │
        ├─ n8n marks as failed_retryable
        │
        └─ Firestore write completes

T+1s    Real-time listener detects change
        │
        ├─ Fetches all leads for batch
        │
        ├─ Maps to liveLeads state
        │
        └─ Component re-renders

T+2s    Filter evaluates (new logic)
        │
        ├─ Checks: status === 'failed_retryable'? ✅ YES
        │
        ├─ Includes lead in filteredLeads
        │
        └─ "Show Retrying" tab now shows 1 contact

T+3s    Stats update
        │
        ├─ "Retry Information" card visible
        │
        ├─ "Action Required" count shows 1
        │
        └─ User sees lead ready for retry action
```

---

## 🎯 Key Takeaways

| Aspect | Detail |
|--------|--------|
| **Real-Time Sync** | ✅ Works perfectly (1-2 sec latency) |
| **Data Fetching** | ✅ No pre-filtering (gets all leads) |
| **Filter Logic** | ❌ Missing status check (FIXED) |
| **Field Mapping** | ✅ All fields properly mapped |
| **Batch Scope** | ✅ Only batchId filtering (correct) |
| **Backend State** | ⚠️ retryCount/nextRetryAt not set (improvement) |

---

## 📝 Next Phase: Backend Integration

Once frontend is fixed, next improvement is to have n8n also set:

```firestore
When marking as failed_retryable:
├─ retryCount: 1  (vs. 0)
├─ nextRetryAt: timestamp  (vs. null)
└─ callStatus: "failed"  (vs. "pending")

Result:
├─ Frontend filter works with all 3 conditions
├─ Retry information card shows more detail
└─ Automatic retry system can schedule next call
```
