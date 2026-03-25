<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# ðŸš€ BATCH SYSTEM - COMPLETE TESTING GUIDE

Complete end-to-end regression testing for the batch creation, real-time updates, and wallet integration system.

---

## ðŸ“‹ Table of Contents
1. [Test Environment Setup](#test-environment-setup)
2. [Manual Testing Guide](#manual-testing-guide)
3. [Automated Testing Setup](#automated-testing-setup)
4. [Test Execution Steps](#test-execution-steps)
5. [Reporting and Results](#reporting-and-results)
6. [Troubleshooting](#troubleshooting)

---

## Test Environment Setup

### Prerequisites
```
âœ“ Node.js 16+ installed
âœ“ React Native/Expo setup complete
âœ“ Firebase and Firestore connected
âœ“ Test user account created and authenticated
âœ“ Initial wallet balance â‰¥ â‚¹5000
âœ“ Network connectivity stable
```

### Start Development Server
```bash
# Terminal 1: Start Expo development server
$ npm start
# or
$ expo start

# For Web:
$ npm start -- --web

# For Android Emulator:
$ npm run android

# For iOS Simulator:
$ npm run ios
```

### Open Test Tools
```
# For Web Testing:
1. Open http://localhost:8081 (web version)
2. Open DevTools: Ctrl+Shift+I (Windows) or Cmd+Option+I (Mac)
3. Go to Console tab
4. Test reporting will print here

# For Mobile Testing:
1. Open Logcat in Android Studio
2. Filter: tag=ReactNativeJS
3. Test logs will appear here
```

---

## Manual Testing Guide

### Quick Start (1 hour)
Use this if you want to test quickly without extensive documentation.

**File:** `TEST_CHECKLIST_QUICK.md`

1. Go through each test case checkbox
2. Follow the numbered steps
3. Check the verification criteria
4. Mark pass/fail
5. Fill in notes section

**Expected time:** 60-90 minutes
**Coverage:** All critical user flows

---

### Comprehensive Testing (3-4 hours)
Use this for thorough regression testing with detailed documentation.

**File:** `TEST_PLAN_REGRESSION.md`

Includes:
- Pre-test setup
- 8 test suites
- 23 individual test cases
- Detailed steps and expected results
- Error flow testing
- Performance testing
- Cross-feature integration

**Expected time:** 180-240 minutes
**Coverage:** All features + edge cases

---

## Automated Testing Setup

### 1. Test Reporter Utility
**File:** `src/utils/TestReporter.ts`

Provides console-based test reporting with:
- Test case tracking
- Pass/fail assertions
- Critical/minor issue logging
- Automatic report generation
- Formatted console output

**Features:**
```typescript
TestReporter.startTest('TC-1.1', 'Test Name');
TestReporter.log('Step message');
TestReporter.pass('Expected behavior confirmed');
TestReporter.fail('Unexpected behavior', error);
TestReporter.critical('Release-blocking issue');
TestReporter.warning('Non-blocking issue');
TestReporter.generateReport(); // Prints formatted report
```

### 2. Test Hooks for Batch System
**File:** `src/utils/batchTestHooks.ts`

Pre-built testing functions:
```typescript
const testHook = useBatchTestHook();

// Log operations
testHook.logBatchCreation(batch, 'manual');
testHook.logBatchDetailOpen(batch);
testHook.logCallNowAttempt(batch, balance, required);
testHook.logBatchSaveSuccess(batch);
testHook.logLeadsUpdate(leads);
testHook.logProgressBarUpdate(completed, total);

// Validate UI
testHook.validateUIElements(batch);
testHook.validateDashboardUpdate(batch);
```

### 3. Example Test Execution
**File:** `src/utils/testExample.ts`

Complete example showing:
- Full test suite run
- All test cases
- Expected results
- Report generation

---

## Test Execution Steps

### Step 1: Set Up Test Environment
```bash
# 1. Start development server
npm start

# 2. Open app in browser/emulator
# 3. Log in with test account
# 4. Verify wallet balance (should be â‚¹5000+)
# 5. Open browser DevTools Console
```

### Step 2: Run Manual Tests (Recommended First Run)

**Option A: Quick Checklist (60 min)**
1. Open `TEST_CHECKLIST_QUICK.md`
2. Follow each test case
3. Check boxes as you go
4. Note any issues
5. Fill summary section

**Option B: Comprehensive Plan (3-4 hours)**
1. Open `TEST_PLAN_REGRESSION.md`
2. Follow through Test Suite 1-8
3. Document results in provided sections
4. Collect any error screenshots
5. Fill sign-off section

### Step 3: Run Automated Tests (Optional)

```javascript
// In browser console on iOS/web:

// Option 1: Run example test
> import('./src/utils/testExample')
>   .then(m => m.default?.())

// Option 2: Use test hooks in your component
import { runBatchSystemTests } from '@/src/utils/batchTestHooks';
const { testHook, startTestSuite, finishTestSuite } = runBatchSystemTests();
startTestSuite('Batch Creation Suite');
// ... perform operations ...
finishTestSuite();
```

The test reporter will print a formatted console report showing:
```
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
â•â•â•â•â•â•â•â• UI REGRESSION TEST REPORT â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

ðŸ“Š TEST SUMMARY
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  Timestamp: 2026-02-06T12:34:56.789Z
  Total Tests: 23
  âœ… Passed: 23
  âŒ Failed: 0
  â­ï¸  Skipped: 0
  Success Rate: 100.0%
  Total Duration: 123.45s

ðŸŒ ENVIRONMENT
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  device: Mobile (React Native)
  network: WiFi
  auth: Logged In

ðŸ§ª TEST CASES
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  âœ… TC-1.1: Create Batch via Manual Entry
     Duration: 1234ms
       âœ… PASS: Batch created successfully
       âœ… PASS: Contact count > 0
  ...

ðŸ’¡ RECOMMENDATIONS
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  âœ… All tests passed! Ready for release.

â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
```

---

## Reporting and Results

### During Testing

**Capture:**
- Screenshots of UI for each major step
- Console logs (copy from DevTools)
- Any error messages or warnings
- Performance metrics (if tools available)

**Log to:**
- Test checklist document
- Test notes section
- Screenshots folder

### After Testing

**Generate Report:**
```javascript
// At end of testing, in console:
const report = TestReporter.generateReport();

// Export as JSON (optional)
console.log(JSON.stringify(report, null, 2));
```

**Document Results:**
1. Fill test summary section
2. List all critical issues
3. List all minor issues
4. Record environment details
5. Get tester sign-off
6. Determine release readiness

### Test Report Structure
```
âœ… PASSED - All tests passed, no issues
âš ï¸  PASSED WITH WARNINGS - Tests passed but minor issues found
âŒ FAILED - Critical issues found, needs fixes before release
```

---

## Test Scenarios

### Scenario 1: Create Batch (Manual)
```
Steps:
  1. Home â†’ "Add Lead" or "Upload Leads"
  2. Enter phone numbers
  3. Save batch
  4. Verify in Dashboard

Expected:
  â€¢ Batch appears with "draft" status
  â€¢ Contact count correct
  â€¢ All details visible
```

### Scenario 2: Call Now with Balance Check
```
Steps:
  1. Select batch (3+ contacts)
  2. Click "Call Now"
  3. Confirm in dialog
  4. Watch for Firebase save

Expected:
  â€¢ Wallet check passes
  â€¢ Balance sufficient
  â€¢ Batch saved successfully
  â€¢ Status changes from "draft"
  â€¢ Dashboard updates
```

### Scenario 3: Real-Time Updates
```
Steps:
  1. Open batch detail after "Call Now"
  2. Watch for status badges
  3. Look for progress bar
  4. Verify live updates

Expected:
  â€¢ Real-time listener active
  â€¢ Status colors correct
  â€¢ Retry info visible
  â€¢ Progress bar updates
  â€¢ No manual refresh needed
```

### Scenario 4: Error Handling
```
Steps:
  1. Disconnect network
  2. Try to create batch
  3. Reconnect network
  4. Retry

Expected:
  â€¢ Error shown to user
  â€¢ Batch not saved (corrupted)
  â€¢ Can retry after reconnect
  â€¢ No app crash
```

---

## Expected Results

### All Tests Pass
```
âœ… Success Rate: 100%
âœ… No critical issues
âœ… Minor issues < 5
âœ… Ready for release
```

### Some Tests Fail
```
âš ï¸ Success Rate: 80-99%
âš ï¸ Review failures
âš ï¸ Fix critical blockers
âš ï¸ Re-test before release
```

### Many Tests Fail
```
âŒ Success Rate: < 80%
âŒ Do not release
âŒ Investigate root cause
âŒ Fix and re-test all
```

---

## Troubleshooting

### Issue: App Won't Start
```
Solution:
  1. Clear cache: npm start -- --reset-cache
  2. Delete node_modules: rm -rf node_modules
  3. Reinstall: npm install
  4. Start again: npm start
```

### Issue: Firebase Connection Error
```
Solution:
  1. Verify Firebase config in .env
  2. Check Firestore is deployed
  3. Verify security rules allow access
  4. Check user is authenticated
  5. Restart app
```

### Issue: Wallet Balance Not Showing
```
Solution:
  1. Verify user is logged in
  2. Check wallet collection exists in Firebase
  3. Verify security rules allow read
  4. Check useWallet() hook is in provider
  5. Restart app
```

### Issue: Real-Time Updates Not Working
```
Solution:
  1. Check batch status is NOT "draft"
  2. Verify subscribeToBatchLeads imported
  3. Check Firestore rules allow leads read
  4. Verify leads collection has data
  5. Check network connectivity
```

### Issue: Test Reporter Not Printing
```
Solution:
  1. Ensure TestReporter imported
  2. Check console is open (DevTools)
  3. Call TestReporter.generateReport() explicitly
  4. Check for JavaScript errors
  5. Try in different browser
```

---

## Success Criteria

### Must Have (Release Blocker) âœ…
- [x] All 4 batch creation methods work
- [x] Wallet check prevents insufficient balance
- [x] Real-time updates work without refresh
- [x] Dashboard instantly reflects changes
- [x] Progress bar updates automatically
- [x] No crashes or critical errors

### Should Have (Quality) âœ…
- [x] All 23 test cases pass
- [x] < 5 minor warnings
- [x] Performance metrics good
- [x] Memory stable
- [x] Color coding correct
- [x] Retry info visible

### Nice to Have (Polish) âœ…
- [x] Smooth animations
- [x] Loading indicators visible
- [x] Error messages helpful
- [x] Mobile responsive
- [x] Fast load times

---

## Sign-Off

After completing tests:

```
Tester: ___________________
Date: ___________________
Build: ___________________
Device: ___________________

Results:
  [ ] All tests passed - Ready for release
  [ ] Minor issues only - Can release with notes
  [ ] Blocking issues - Do not release

Issues Found:
  1. _______________________
  2. _______________________
  3. _______________________

Sign-off:
  [ ] Approved for release
  [ ] Requires fixes before release
  [ ] Rejected - block release
```

---

## Files Provided

| File | Purpose | Duration |
|------|---------|----------|
| TEST_CHECKLIST_QUICK.md | Quick manual checklist | 60 min |
| TEST_PLAN_REGRESSION.md | Comprehensive manual plan | 180 min |
| src/utils/TestReporter.ts | Console reporting utility | Automated |
| src/utils/batchTestHooks.ts | Batch testing hooks | Automated |
| src/utils/testExample.ts | Example test execution | Reference |

---

## Next Steps

1. **Prepare Environment**
   - Set up dev environment
   - Start dev server
   - Open testing tools

2. **Run Tests**
   - Choose manual or automated
   - Follow test steps
   - Document results

3. **Report Results**
   - Generate test report
   - Document issues
   - Get sign-off

4. **Release Decision**
   - All pass â†’ Release âœ…
   - Some fail â†’ Fix & Re-test ðŸ”§
   - Many fail â†’ Block release ðŸ›‘

---

**Questions?** Check the relevant test file or review test example code.

Good luck with testing! ðŸš€


