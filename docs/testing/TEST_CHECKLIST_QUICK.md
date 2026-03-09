<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# ðŸ§ª UI REGRESSION TEST - QUICK REFERENCE

## Pre-Test Checklist
- [ ] Device/Emulator started and running
- [ ] App compiled successfully (`npm start` or `expo start`)
- [ ] Logged into test account (test@example.com / password)
- [ ] Network connectivity working
- [ ] Initial wallet balance â‰¥ â‚¹5000
- [ ] Chrome DevTools open (for web) or logcat (for Android)
- [ ] Console visible for test logs

---

## Test Suite 1: Batch Creation (4 Sources) â±ï¸ ~15 min

### âœ… TC-1.1: Manual Entry
```
Home â†’ "Add Lead" or "Upload Leads"
Enter:
  +91-9876543210
  +91-9876543211
  +91-9876543212
Save â†’ Batch Dashboard
```
**Verify:**
- [ ] Batch appears in dashboard
- [ ] Status = "draft"
- [ ] Contact count = 3
- [ ] Source = "manual"

---

### âœ… TC-1.2: CSV Upload
```
Home â†’ "Upload Leads" â†’ CSV
Upload file with:
  phone,name,email
  +91-9876543213,John Doe,john@example.com
  +91-9876543214,Jane Smith,jane@example.com
  +91-9876543215,Bob Johnson,bob@example.com
  +91-9876543216,Alice Brown,alice@example.com
```
**Verify:**
- [ ] 4 contacts extracted
- [ ] Names visible
- [ ] Confidence scores shown
- [ ] Source = "csv"

---

### âœ… TC-1.3: Paste Leads
```
Home â†’ "Paste Leads"
Paste:
  9876543217
  9876543218
  9876543219
Save as batch
```
**Verify:**
- [ ] 3 contacts parsed
- [ ] Phone numbers normalized (+91-98...)
- [ ] Source = "clipboard"

---

### âœ… TC-1.4: Image/OCR
```
Home â†’ "Image Import"
Select image with phone numbers or take photo
Review extracted numbers
Save as batch
```
**Verify:**
- [ ] Numbers extracted
- [ ] Confidence visible
- [ ] Source = "image"

---

## Test Suite 2: Dashboard Verification â±ï¸ ~10 min

### âœ… TC-2.1: All Batches Visible
```
Dashboard â†’ View all created batches
```
**Check:**
- [ ] Manual batch visible (3 contacts, "draft")
- [ ] CSV batch visible (4 contacts, "draft")
- [ ] Paste batch visible (3 contacts, "draft")
- [ ] Image batch visible (source = "image")
- [ ] Total = 4 batches

---

### âœ… TC-2.2: Individual Batch Details
```
Dashboard â†’ Click CSV batch (4 contacts)
```
**Verify:**
- [ ] Header shows "Batch Details"
- [ ] Batch ID shown
- [ ] Total Contacts = 4
- [ ] Created date shown
- [ ] All 4 contacts listed with names
- [ ] Confidence scores visible

---

## Test Suite 3: Wallet Integration â±ï¸ ~10 min

### âœ… TC-3.1: Wallet Balance Check
```
Dashboard â†’ Head (check wallet balance shown)
Required: 3 contacts Ã— â‚¹14 = â‚¹42
Click "Call Now" on manual batch (3 contacts)
```
**Verify:**
- [ ] Wallet balance visible in header (e.g., "â‚¹5000")
- [ ] Green "Live" indicator visible
- [ ] Balance check happens
- [ ] If sufficient: Proceeds to confirmation
- [ ] Shows required amount
- [ ] Shows available amount

---

### âœ… TC-3.2: Insufficient Balance (Optional)
```
(Skip if balance sufficient)
Try to create batch call
Get rejection
```
**Verify:**
- [ ] Error shows "Recharge Required"
- [ ] Shows required vs. available
- [ ] "Recharge Now" button works
- [ ] Navigates to Wallet screen

---

### âœ… TC-3.3: Successful Call Now
```
Dashboard â†’ Click "Call Now" on batch
Confirm in modal
Watch for success
```
**Verify:**
- [ ] Confirmation modal appears
- [ ] Shows batch details and contact count
- [ ] Loading spinner shown during save
- [ ] Success message appears
- [ ] Batch status changes (not "draft" anymore)
- [ ] Dashboard updates automatically

---

## Test Suite 4: Real-Time Updates â±ï¸ ~15 min

### âœ… TC-4.1: Real-Time Listener Active
```
Open batch detail after "Call Now"
Open another browser tab with dashboard
```
**Verify:**
- [ ] Progress bar visible
- [ ] Stats cards visible: Completed, Pending, Retries
- [ ] Loading indicator shows initial sync
- [ ] Contact list shows status badges
- [ ] No page refresh needed for updates

---

### âœ… TC-4.2: Status Color Coding
```
View live batch contact list
Look for different status badges
```
**Verify:**
- [ ] pending â†’ Gray badge
- [ ] calling/in_progress â†’ Blue badge + phone icon
- [ ] completed â†’ Green badge + checkmark âœ“
- [ ] failed â†’ Red badge + X icon
- [ ] busy â†’ Orange badge

---

### âœ… TC-4.3: Retry Information
```
Contact list in live batch
Check for retry details
```
**Verify:**
- [ ] Attempts count visible (e.g., "Attempts: 2")
- [ ] Retry count visible if > 0 (e.g., "Retries: 1")
- [ ] Last attempt time shown (e.g., "Last: 14:32")
- [ ] Next retry in orange banner (if scheduled)
- [ ] "Retry Now" button visible on non-completed leads

---

## Test Suite 5: Dashboard Auto-Refresh â±ï¸ ~10 min

### âœ… TC-5.1: New Batch Count Updates
```
Dashboard open in Tab 1
Create new batch in Tab 2
Switch back to Tab 1
```
**Verify:**
- [ ] New batch appears without refresh
- [ ] Count increments
- [ ] Correct status shown
- [ ] All details accurate

---

### âœ… TC-5.2: Batch Status Change
```
Draft batch â†’ Click "Call Now" â†’ Confirm
Watch dashboard
```
**Verify:**
- [ ] Status badge changes immediately
- [ ] Icon updates
- [ ] Background color changes
- [ ] No page refresh needed

---

### âœ… TC-5.3: Progress Bar Updates
```
Open batch with active calls
Wait for backend to complete some
```
**Verify:**
- [ ] Completed count increments
- [ ] Pending count decrements
- [ ] Progress bar extends (green fill)
- [ ] Percentage updates
- [ ] No lag > 2 seconds between updates

---

## Test Suite 6: Error Handling â±ï¸ ~10 min

### âœ… TC-6.1: Network Disconnect
```
Turn off WiFi/Airplane mode
Try to create batch
Watch for error
Turn WiFi back on
```
**Verify:**
- [ ] Error message shown during creation
- [ ] Batch NOT saved to Firebase
- [ ] User can retry after reconnection
- [ ] No corrupted data in Firebase

---

### âœ… TC-6.2: Missing Data
```
Try to save batch with NO contacts
```
**Verify:**
- [ ] Validation error shown
- [ ] Cannot proceed
- [ ] Error message helpful

---

## Test Suite 7: Performance â±ï¸ ~15 min

### âœ… TC-7.1: Large Batch (100+ contacts)
```
Create batch with 100+ contacts
Open batch detail
Scroll through list
```
**Verify:**
- [ ] Loads within 3 seconds
- [ ] Scrolling smooth (no stutter)
- [ ] No UI freezes
- [ ] Memory stable

---

### âœ… TC-7.2: Memory Leaks
```
Open/close batch detail screen 10 times
Watch Chrome DevTools Memory
```
**Verify:**
- [ ] Memory doesn't grow exponentially
- [ ] Stays around 5-10MB
- [ ] Listeners properly cleaned up

---

## Test Suite 8: Cross-Feature Integration â±ï¸ ~15 min

### âœ… TC-8.1: Wallet â†’ Batch â†’ Dashboard
```
1. Start with low balance (â‚¹100)
2. Try to create batch call
3. See rejection
4. Click "Recharge Now"
5. Recharge â‚¹500
6. Return to batch
7. Try "Call Now" again
```
**Verify:**
- [ ] Flow is smooth
- [ ] Batch context preserved after recharge
- [ ] Call succeeds with new balance
- [ ] Wallet updates in header

---

### âœ… TC-8.2: Batch â†’ Follow-Up
```
Open completed batch
View interested leads
Schedule follow-up
Check follow-ups screen
```
**Verify:**
- [ ] Follow-up interface accessible
- [ ] Date picker works
- [ ] Saved to Firebase
- [ ] Appears in Follow-Ups screen

---

## ðŸ“Š Test Summary

### Results
```
Total Tests: 23
Passed: ___ / 23
Failed: ___ / 23
Success Rate: ___%
Duration: ___min
```

### Critical Issues
```
1. 
2. 
3. 
```

### Minor Issues
```
1. 
2. 
3. 
```

### Recommendations
```
Ready for release: [ ] Yes [ ] No

If no, fix these first:
- 
- 
- 
```

---

## ðŸ“ Notes
```
Tester: _______________
Date: _______________
Device: _______________
Build Version: _______________
```

---

## ðŸŽ¯ Success Criteria

### Must Pass (Release Blocker)
- [ ] All 4 batch creation methods work
- [ ] Wallet balance check prevents insufficient balance calls
- [ ] Real-time updates work (no manual refresh needed)
- [ ] Progress bar updates automatically
- [ ] Dashboard reflects status changes instantly
- [ ] No critical crashes or errors

### Should Pass (Nice to Have)
- [ ] All 23 test cases pass
- [ ] < 5 warnings in console
- [ ] Performance metrics good
- [ ] No memory leaks detected

---

## ðŸš€ After Testing

1. **If All Pass:**
   - Ready for release
   - Document test results
   - Commit test evidence

2. **If Some Fail:**
   - Document failures with screenshots
   - Create GitHub issues
   - Fix critical issues before release
   - Re-test failed cases

3. **Share Results:**
   - Print test report from console
   - Upload to test artifacts
   - Notify team


