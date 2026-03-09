<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Full UI Regression Test Plan - Batch System

## Test Scope
Complete end-to-end testing of batch creation, real-time updates, wallet integration, and dashboard synchronization.

---

## Test Environment Setup
```
Device: [Android/iOS/Web]
Network: [WiFi/Cellular]
Firebase: [Connected] [Disconnected]
Auth: [Logged In as test@example.com]
Wallet Balance: [â‚¹5000+]
```

---

## Test Suite 1: Batch Creation - Multiple Sources

### TC-1.1: Create Batch via Manual Entry
**Steps:**
1. Navigate to Home Screen â†’ "Upload Leads" or "Add Lead"
2. Enter phone numbers manually:
   - `+91-9876543210`
   - `+91-9876543211`
   - `+91-9876543212`
3. Save as batch
4. Go to batch-dashboard

**Expected:**
- âœ“ Batch appears in dashboard with status "draft"
- âœ“ Contact count shows 3
- âœ“ Batch ID visible
- âœ“ "Call Now" button available
- âœ“ No real-time listeners active (draft status)

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-1.2: Create Batch via CSV Upload
**Steps:**
1. Navigate to "Upload Leads" â†’ CSV tab
2. Select or create CSV with:
   ```
   phone,name
   +91-9876543213,Contact1
   +91-9876543214,Contact2
   +91-9876543215,Contact3
   +91-9876543216,Contact4
   ```
3. Upload file
4. Save as batch
5. Go to batch-dashboard

**Expected:**
- âœ“ Batch appears in dashboard
- âœ“ Contact count = 4
- âœ“ Source shows "csv"
- âœ“ Names extracted and visible
- âœ“ Extraction confidence visible

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-1.3: Create Batch via Paste
**Steps:**
1. Navigate to "Paste Leads"
2. Paste text:
   ```
   9876543217
   9876543218
   9876543219
   ```
3. Save as batch
4. Go to batch-dashboard

**Expected:**
- âœ“ Batch appears with status "draft"
- âœ“ Contact count = 3
- âœ“ Phone numbers normalized with country code
- âœ“ Source shows "clipboard"

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-1.4: Create Batch via Image/OCR
**Steps:**
1. Navigate to "Image Import"
2. Select image with phone numbers OR take photo
3. Wait for OCR extraction
4. Verify extracted numbers
5. Save as batch
6. Go to batch-dashboard

**Expected:**
- âœ“ Numbers extracted from image
- âœ“ Confidence scores shown
- âœ“ Batch created with status "draft"
- âœ“ Source shows "image"
- âœ“ Extracted numbers match image

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

## Test Suite 2: Dashboard Verification

### TC-2.1: Batch Dashboard Lists All Created Batches
**Steps:**
1. From batch-dashboard, verify all 4 batches created above are listed
2. Click each batch to view details
3. Verify correct source for each

**Expected:**
- âœ“ All 4 batches visible in list
- âœ“ Sort order: newest first
- âœ“ Each shows correct source icon/badge
- âœ“ Contact count accurate for each
- âœ“ Status badge correct

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-2.2: Batch Detail Screen Shows Correct Data
**Steps:**
1. Click on CSV batch (4 contacts)
2. Verify header shows batch details
3. Scroll through contacts
4. Verify all 4 contacts listed

**Expected:**
- âœ“ Batch ID visible (first 12 chars)
- âœ“ Total Contacts = 4
- âœ“ Created date shown
- âœ“ All 4 contacts listed with phone numbers
- âœ“ Contact names visible (CSV batch)
- âœ“ Confidence scores visible

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

## Test Suite 3: Wallet Integration

### TC-3.1: Wallet Balance Check Before Call Now
**Steps:**
1. Open batch-dashboard
2. Check wallet balance in header (should show â‚¹XXXX)
3. Select a batch with 3 contacts
4. Click "Call Now"
5. Watch for wallet check modal

**Expected:**
- âœ“ Wallet balance visible in header
- âœ“ Live indicator (green dot) shows real-time
- âœ“ Balance check triggers before call
- âœ“ Modal shows required amount: 3 Ã— â‚¹14 = â‚¹42
- âœ“ Modal shows available balance
- âœ“ "Recharge Now" link available

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-3.2: Insufficient Balance Rejection
**Steps:**
1. (If balance < â‚¹50) Proceed to TC-3.3
2. (If balance sufficient) Reduce wallet via payment simulator
3. Try to create batch call with insufficient balance
4. Verify error message

**Expected:**
- âœ“ Error alert shows "Recharge Required"
- âœ“ Shows required vs available amount
- âœ“ "Recharge Now" button navigates to /wallet
- âœ“ Call NOT sent to Firebase

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-3.3: Sufficient Balance Allows Call Now
**Steps:**
1. Ensure balance â‰¥ â‚¹50
2. Select batch with 3 contacts
3. Click "Call Now"
4. Confirm in modal
5. Wait for batch to save

**Expected:**
- âœ“ Balance check passes
- âœ“ Modal closes after confirmation
- âœ“ Loading spinner shows
- âœ“ Batch saved to Firebase
- âœ“ Dashboard updates
- âœ“ Batch status changes to "queued" or "running"
- âœ“ Success message shown

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

## Test Suite 4: Real-Time Updates

### TC-4.1: Real-Time Leads Listener (After Call Now)
**Steps:**
1. Open batch that was set to "Call Now"
2. Open batch-dashboard in another browser tab
3. Watch batch-detail screen
4. Simulate backend updating leads (manual update or wait for system)
5. Observe UI updates

**Expected:**
- âœ“ Real-time listener active (status !== 'draft')
- âœ“ Lead list shows real-time status
- âœ“ Progress bar visible with 0/X completed
- âœ“ Stats cards show: Completed, Pending, Retries
- âœ“ Updates happen without page refresh
- âœ“ Loading indicator shows during sync
- âœ“ No memory leaks on unmount

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-4.2: Lead Status Color Coding
**Steps:**
1. View a batch with active calls
2. Observe lead status badges
3. Look for different statuses if available

**Expected:**
- âœ“ pending â†’ gray badge
- âœ“ calling/in_progress â†’ blue badge with phone icon
- âœ“ completed â†’ green badge with checkmark
- âœ“ failed â†’ red badge with X icon
- âœ“ busy â†’ orange badge
- âœ“ Color matches callStatus field (not lead.status)

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-4.3: Retry Information Display
**Steps:**
1. View contacted leads in batch
2. Look for retry information

**Expected:**
- âœ“ Retry Count visible (if > 0)
- âœ“ Attempts count shown
- âœ“ Last Attempt Time displayed (if exists)
- âœ“ Next Retry Time shows in orange banner (if scheduled)
- âœ“ "Retry Now" button visible on non-completed leads
- âœ“ All timestamps formatted correctly

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

## Test Suite 5: Dashboard Auto-Refresh

### TC-5.1: Batch Count Updates in Realtime
**Steps:**
1. Open batch-dashboard
2. Note count of batches shown
3. In another tab, create new batch and call "Call Now"
4. Switch back to dashboard
5. Observe update

**Expected:**
- âœ“ Batch appears immediately (or within 2-3 seconds)
- âœ“ Total count increments
- âœ“ New batch shows correct status
- âœ“ Dashboard doesn't require refresh

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-5.2: Batch Status Changes Reflect
**Steps:**
1. Open batch-dashboard
2. Select "draft" batch
3. Click "Call Now" and confirm
4. Return to dashboard
5. Watch status change

**Expected:**
- âœ“ Status badge changes from "draft" to "queued"/"running"
- âœ“ Update happens within 2-3 seconds
- âœ“ Icon changes appropriately
- âœ“ Background color updates

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-5.3: Progress Bar Updates
**Steps:**
1. Open batch with active calls
2. Wait for backend to process some calls
3. Watch progress bar

**Expected:**
- âœ“ Progress bar visible
- âœ“ Percentage updates as calls complete
- âœ“ Completed count increments
- âœ“ Pending count decrements
- âœ“ Green fill extends with each completion
- âœ“ No lag > 2 seconds

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

## Test Suite 6: Error Flows

### TC-6.1: Network Disconnection Handling
**Steps:**
1. Disable network/WiFi
2. Try to create batch
3. Re-enable network
4. Observe recovery

**Expected:**
- âœ“ Error message shown during creation
- âœ“ Batch not saved to Firebase
- âœ“ Users can retry after reconnection
- âœ“ No corrupted data

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-6.2: Firebase Permission Errors
**Steps:**
1. (Need special Firebase rules setup)
2. Try to save batch as different user
3. Observe error handling

**Expected:**
- âœ“ Error message shown: "Permission Denied"
- âœ“ Clear guidance on firestore rules
- âœ“ No app crash

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-6.3: Missing Required Fields
**Steps:**
1. Try to create batch with no contacts
2. Try to schedule with past date
3. Try to save with missing phone numbers

**Expected:**
- âœ“ Validation error shown
- âœ“ User guided to fix error
- âœ“ Clear error message
- âœ“ Batch not saved

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

## Test Suite 7: Performance

### TC-7.1: Large Batch Handling (100+ contacts)
**Steps:**
1. Create batch with 100+ contacts
2. Open batch-detail screen
3. Scroll through contact list
4. Open batch-dashboard
5. Verify UI responsiveness

**Expected:**
- âœ“ UI loads within 3 seconds
- âœ“ Scrolling is smooth (no stutter)
- âœ“ Real-time listeners work
- âœ“ Memory stable
- âœ“ No noticeable lag

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-7.2: Memory Leak Check
**Steps:**
1. Open/close batch-detail screen 10 times
2. Monitor memory usage (DevTools)
3. Check Chrome DevTools Memory tab

**Expected:**
- âœ“ Memory doesn't grow exponentially
- âœ“ Listeners properly unsubscribe
- âœ“ No retained objects from closed screens
- âœ“ ~5-10MB stable memory

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

## Test Suite 8: Cross-Feature Integration

### TC-8.1: Wallet â†’ Batch â†’ Dashboard Flow
**Steps:**
1. Start with low balance (â‚¹100)
2. Try to create batch call
3. Get rejected
4. Click "Recharge Now"
5. Recharge â‚¹500
6. Return to batch
7. Try "Call Now" again
8. Confirm successful call

**Expected:**
- âœ“ Each step flows smoothly
- âœ“ Navigation preserves batch context
- âœ“ After recharge, user returned to batch
- âœ“ Call Now succeeds with updated balance
- âœ“ Wallet balance updated in header

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

### TC-8.2: Batch â†’ Leads â†’ Follow Up Flow
**Steps:**
1. Open completed batch
2. View leads with "interested" status
3. Press "Schedule Follow Up"
4. Select date/time
5. Check follow-ups screen
6. Verify follow up scheduled

**Expected:**
- âœ“ Follow-up interface accessible
- âœ“ Date picker works
- âœ“ Follow-up saved to Firebase
- âœ“ Appears in Follow-Ups screen
- âœ“ Reminder notifications ready (if enabled)

**Actual:** [ ] PASS [ ] FAIL
**Issues:**
```




```

---

## Summary

### Test Execution Summary
```
Total Test Cases: 23
Passed: ___ / 23
Failed: ___ / 23
Success Rate: ___%
```

### Critical Issues Found
1. 
2. 
3. 
4. 
5. 

### Minor Issues Found
1. 
2. 
3. 

### Recommendations
```


```

### Sign-Off
- Tester: ________________
- Date: ________________
- Status: [ ] Approved for Release [ ] Block Release


