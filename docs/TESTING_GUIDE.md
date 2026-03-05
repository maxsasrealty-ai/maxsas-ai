# Testing Guide - UI Sync Fix Verification

**Date Created:** February 23, 2026  
**Fix Applied:** BatchDetailScreen.tsx lines 240-256  
**Feature:** "Show Retrying" tab filter for failed_retryable leads

---

## ✅ Testing Checklist

### Pre-Requisites
- [x] Code fix applied to BatchDetailScreen.tsx
- [x] App rebuilt and reloaded
- [x] Logged into Maxsas AI dashboard
- [x] Have access to batch with test lead

---

## 🧪 Test Case 1: Basic Display Test

**Scenario:** Lead marked as `failed_retryable` appears in "Show Retrying" tab

**Setup:**
1. Navigate to recent batch that has a failed call
2. Verify in Firestore that at least one lead has:
   - `status: "failed_retryable"`
   - `aiDisposition: "user_no_response"` (or similar)
   - `attempts: >= 1`

**Steps:**
1. Open batch detail screen
2. Locate the filter tabs below the batch header
3. Click "Show Retrying" tab
4. Observe the contact list

**Expected Result:**
- [ ] Lead with `status: "failed_retryable"` **IS visible**
- [ ] Shows contact with phone number
- [ ] Status badge displays: 🔴 Failed
- [ ] Metadata shows attempt count

**Actual Result:**
```
(screenshot or description of what you see)
```

**Pass/Fail:** 
- [ ] PASS ✅
- [ ] FAIL ❌

---

## 🧪 Test Case 2: Tab-Specific Behavior

**Scenario:** Same lead appears in correct tabs

**Setup:** Same as Test Case 1

**Steps:**
1. Click each filter tab and verify lead presence

| Tab | Expected | Actual | Result |
|-----|----------|--------|--------|
| Show Pending | NOT visible | | [ ] PASS |
| Show Completed | NOT visible | | [ ] PASS |
| Show Failed | VISIBLE | | [ ] PASS |
| Show Retrying | VISIBLE ✅ | | [ ] PASS |

**Why each tab?**
- Show Pending: Lead is not `queued` - it's `failed_retryable`
- Show Completed: Lead is not `completed`
- Show Failed: All failed leads are shown (toggle shows all)
- Show Retrying: **NEW FIX** - Now includes `failed_retryable` status

**Pass/Fail:**
- [ ] PASS (all 4 tabs correct)
- [ ] FAIL (some tabs incorrect)

---

## 🧪 Test Case 3: Real-Time Sync

**Scenario:** Multiple leads sync in real-time

**Setup:**
1. Create a batch with 3+ leads
2. Let n8n process the batch
3. Mark some as failed_retryable

**Steps:**
1. Keep batch detail screen open
2. Monitor the "Show Retrying" tab
3. Observe updates as more leads fail

**Expected Result:**
- [ ] Leads appear within 1-2 seconds of Firestore update
- [ ] No manual refresh needed
- [ ] Count increments as leads are added
- [ ] No duplicate entries

**Actual Result:**
```
Time | Action | Result
-----|--------|-------
T+0s | Lead fails in n8n | 
T+2s | Lead appears in tab? | 
```

**Pass/Fail:**
- [ ] PASS (Real-time working)
- [ ] FAIL (Manual refresh needed)

---

## 🧪 Test Case 4: Progress Bar Updates

**Scenario:** Progress bar updates when leads fail

**Setup:** Same as Test Case 3

**Steps:**
1. View batch stats at top
2. Note the progress bar percentage
3. Watch as leads are marked as failed_retryable

**Expected Result:**
- [ ] Progress bar is visible
- [ ] Shows percentage (e.g., "35%")
- [ ] Stats update in real-time
- [ ] Shows breakdown: "✓ X completed • ⏱ Y pending • 📞 Z calling"

**Note:** Percentage will be `completed / total × 100`, so if you have:
- 1 lead total
- 0 completed
- 1 failed_retryable
- Progress = 0 / 1 = 0% (This is correct!)

**Actual Result:**
```
(screenshot or description of stats)
```

**Pass/Fail:**
- [ ] PASS
- [ ] FAIL

---

## 🧪 Test Case 5: Retry Information Card

**Scenario:** Retry information displays for retrying leads

**Setup:** Batch with at least one failed_retryable lead

**Steps:**
1. View batch detail
2. Look for orange "Retry Information" card
3. Verify content

**Expected Result (Card Content):**
- [ ] Card is visible
- [ ] Title: "Retry Information" with refresh icon
- [ ] Shows "Total Retries" count (e.g., "0" initially)
- [ ] Shows "Avg per Contact" (e.g., "0" initially)
- [ ] If nextRetryAt is set: Orange banner with "X contact(s) scheduled for retry"

**Actual Result:**
```
(screenshot of retry card)
```

**Pass/Fail:**
- [ ] PASS
- [ ] FAIL

---

## 🧪 Test Case 6: "Action Required" Stats

**Scenario:** "Action Required" count matches failed_retryable leads

**Setup:** Dashboard home screen with batch data

**Steps:**
1. Go to dashboard home
2. Look at "Action Required" stat card
3. Verify count matches failed_retryable leads in active batches

**Expected Result:**
- [ ] "Action Required" shows count: >= 1
- [ ] Count matches number of leads with:
  - `status === "failed_retryable"` AND
  - `attempts < maxAttempts`

**Code Logic** (from BatchDetailScreen.tsx):
```typescript
const actionRequiredCount = liveLeads.filter(
  (lead) => lead.status === 'failed_retryable' && lead.attempts < MAX_RETRY_COUNT
).length;
```

**Actual Result:**
```
Action Required Count: ____
Failed_retryable Leads Count: ____
Do they match? [ ] YES [ ] NO
```

**Pass/Fail:**
- [ ] PASS (counts match)
- [ ] FAIL (counts don't match)

---

## 🧪 Test Case 7: Lead Metadata Display

**Scenario:** Failed_retryable leads show all relevant metadata

**Setup:** Batch detail with failed_retryable leads visible in "Show Retrying"

**Steps:**
1. View a failed_retryable lead in the list
2. Check all displayed information

**Expected Result:**
Each lead row should show:
- [ ] **Phone Number** (e.g., "+16175555555")
- [ ] **Status Badge** (🔴 Failed)
- [ ] **Contact Index** (e.g., "1" in a circle)
- [ ] **Meta Row 1:** "Retry: X/3 – Next at N/A" (or timestamp if scheduled)
- [ ] **Meta Row 2:** "Last: N/A · Status: pending · AI: user_no_response"

**Actual Display:**
```
[1] +16175555555
    🔴 Failed
    Retry: 0/3 – Next at N/A
    Last: N/A · Status: pending · AI: user_no_response
```

**Pass/Fail:**
- [ ] PASS (all metadata visible)
- [ ] FAIL (some metadata missing)

---

## 🧪 Test Case 8: Filter Tab Behavior

**Scenario:** Tab selection persists and filters correctly update

**Setup:** Batch with mixed-status leads

**Steps:**
1. Click "Show Retrying"
2. Click "Show Failed"
3. Click "Show Retrying" again
4. Verify same leads display

**Expected Result:**
- [ ] Tab selection visually highlighted
- [ ] Content updates immediately
- [ ] No loading spinner (unless data is stale)
- [ ] Clicking same tab twice shows consistent results

**Actual Result:**
```
Tab clicked | Display changes | Correct leads shown
Show Retrying | Yes/No | Yes/No
Show Failed | Yes/No | Yes/No
Show Retrying (again) | Yes/No | Yes/No
```

**Pass/Fail:**
- [ ] PASS
- [ ] FAIL

---

## 🧪 Test Case 9: Multiple Batches

**Scenario:** Filter works correctly across different batches

**Setup:** 2+ active batches with failed leads

**Steps:**
1. Navigate to Batch 1
2. Click "Show Retrying" → Verify leads visible
3. Navigate to Batch 2
4. Click "Show Retrying" → Verify leads visible

**Expected Result:**
- [ ] Each batch shows only ITS failed_retryable leads
- [ ] No cross-batch contamination
- [ ] Correct batchId filtering maintained

**Actual Result:**
```
Batch 1 "Show Retrying" leads: ____
Batch 2 "Show Retrying" leads: ____
Are they different (correct) or same (wrong)? [ ] Different [ ] Same
```

**Pass/Fail:**
- [ ] PASS
- [ ] FAIL

---

## 🧪 Test Case 10: Performance Test

**Scenario:** UI remains responsive with large number of leads

**Setup:** Batch with 50+ leads, multiple failed_retryable

**Steps:**
1. Open batch detail
2. Click "Show Retrying" tab
3. Observe rendering speed
4. Scroll through list
5. Click other tabs

**Expected Result:**
- [ ] Initial tab click responds within 500ms
- [ ] Scrolling is smooth (60fps)
- [ ] No lag switching between tabs
- [ ] No memory leaks (check browser dev tools)

**Performance Metrics:**
```
Initial render: ___ms
Scroll smoothness: ___fps
Memory usage: ___MB
```

**Pass/Fail:**
- [ ] PASS (smooth performance)
- [ ] FAIL (noticeable lag)

---

## 📋 Summary Results

### Overall Test Status

| Test # | Name | Result |
|--------|------|--------|
| 1 | Basic Display | [ ] |
| 2 | Tab-Specific Behavior | [ ] |
| 3 | Real-Time Sync | [ ] |
| 4 | Progress Bar Updates | [ ] |
| 5 | Retry Information Card | [ ] |
| 6 | Action Required Stats | [ ] |
| 7 | Lead Metadata Display | [ ] |
| 8 | Filter Tab Behavior | [ ] |
| 9 | Multiple Batches | [ ] |
| 10 | Performance Test | [ ] |

**Total Passed:** ___ / 10  
**Total Failed:** ___ / 10  

### Pass Rate: ___% 

---

## 🐛 Bug Reporting

If you find issues during testing, please document:

### Bug Report Template

**Test Case Number:** ___

**Issue Description:**
```
(What did you observe that was wrong?)
```

**Expected Behavior:**
```
(What should have happened?)
```

**Actual Behavior:**
```
(What actually happened?)
```

**Steps to Reproduce:**
```
1. 
2. 
3. 
```

**Screenshots:**
```
(Attach screenshots if possible)
```

**Lead IDs (if applicable):**
```
(Which leads had the issue?)
```

**Batch ID:**
```
(Which batch was being tested?)
```

---

## ✅ Sign-Off

**Tester Name:** _______________  
**Test Date:** _________________  
**Build Version:** ______________  

**Overall Result:** 
- [ ] READY FOR PRODUCTION ✅
- [ ] NEEDS FIXES FIRST ❌

**Notes:**
```
(Any additional observations or concerns)
```

---

## 📞 Support

If tests fail or show unexpected behavior:
1. Check [DEBUGGING_UI_SYNC_ISSUE.md](DEBUGGING_UI_SYNC_ISSUE.md) for root causes
2. Review [IMPLEMENTATION_FIX_GUIDE.md](IMPLEMENTATION_FIX_GUIDE.md) for fix details
3. Verify Firestore state matches expectations
4. Check browser console for errors

---

## 🎯 Quick Reference

**Code Changed:**
- File: `src/features/leads/BatchDetailScreen.tsx`
- Lines: 240-256 (filteredLeads useMemo)
- Change: Added `lead.status === 'failed_retryable' ||` to retrying filter

**Edge Cases to Watch:**
- Leads with retryCount but no status
- Leads with nextRetryAt but no retryCount
- Leads transitioning between status states
- Rapid firestore updates
- Large batch sizes (50+ leads)

**Success Indicator:**
Lead with `status: "failed_retryable"` appears in "Show Retrying" tab without manual refresh ✅
