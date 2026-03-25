<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# ðŸŽ¯ BATCH SYSTEM - TEST QUICK REFERENCE CARD

Print this and keep it handy while testing!

---

## âš¡ Quick Start (60 min)

### Phase 1: Batch Creation (15 min)
```
1. Manual: Home â†’ Add Lead â†’ 3 phones â†’ Save âœ“
2. CSV: Home â†’ Upload â†’ 4 contacts from CSV âœ“
3. Paste: Home â†’ Paste â†’ 3 phones â†’ Save âœ“
4. Image: Home â†’ Image â†’ Extract â†’ Save âœ“
```

### Phase 2: Wallet Check (10 min)
```
1. Dashboard â†’ Check balance shown âœ“
2. Click "Call Now" on 3-contact batch âœ“
3. Verify required: 3 Ã— â‚¹14 = â‚¹42 âœ“
4. Verify available shown âœ“
5. Confirm call âœ“
```

### Phase 3: Real-Time (15 min)
```
1. Open batch detail after "Call Now" âœ“
2. Check progress bar visible âœ“
3. Check status colors: gray/blue/green/red âœ“
4. Check retry info visible âœ“
5. No page refresh needed âœ“
```

### Phase 4: Dashboard (10 min)
```
1. New batches appear without refresh âœ“
2. Status badges update âœ“
3. Progress bars update âœ“
4. No lag > 2 seconds âœ“
```

### Phase 5: Summary (10 min)
```
Fill out test results:
  Passed:  ___ / 4 creation tests
  Passed:  ___ / 4 wallet tests
  Passed:  ___ / 4 realtime tests
  Passed:  ___ / 4 dashboard tests
  
Total: ___ / 16 critical tests
Status: [ ] Pass [ ] Fail
```

---

## ðŸŽ¨ Status Color Reference

| Status | Color | Icon | What It Means |
|--------|-------|------|---------------|
| pending | ðŸ”˜ Gray | â­• | Waiting to be called |
| calling | ðŸ”µ Blue | ðŸ“ž | Currently on call |
| completed | ðŸŸ¢ Green | âœ… | Call finished |
| failed | ðŸ”´ Red | âŒ | Call failed |
| busy | ðŸŸ  Orange | âš ï¸ | Line was busy |

---

## ðŸ“± Screen Navigation

```
Home Screen
  â”œâ”€ Add Lead â†’ [Manual Entry]
  â”œâ”€ Upload Leads â†’ [CSV, Image, Paste]
  â”œâ”€ Batch Dashboard â† [ALL BATCHES]
  â””â”€ Wallet â† [BALANCE CHECK]

Batch Dashboard
  â”œâ”€ Batch List [Status, Count, Source]
  â””â”€ Each Batch â†’ [Batch Detail]

Batch Detail
  â”œâ”€ Batch Info [ID, Count, Date]
  â”œâ”€ Contact List [Phone, Status, Retry Info]
  â”œâ”€ Progress Bar [Completed/Total]
  â”œâ”€ Stats Cards [Completed, Pending, Retries]
  â””â”€ Action Buttons [Call Now, Schedule, Delete]
```

---

## âœ… TEST CHECKLIST

### Creation Tests (Each should show "draft" status)
- [ ] Manual: 3 contacts, source="manual"
- [ ] CSV: 4 contacts, names visible, source="csv"
- [ ] Paste: 3 contacts, normalized phones, source="clipboard"
- [ ] Image: extracted numbers, confidence shown, source="image"

### Wallet Tests (All should succeed)
- [ ] Balance visible in header (â‚¹XXXX)
- [ ] Green "Live" indicator present
- [ ] Balance check on "Call Now" works
- [ ] Required amount calculated correctly (contacts Ã— 14)
- [ ] Call proceeds if balance sufficient
- [ ] Call blocked if balance insufficient
- [ ] Recharge button links to /wallet

### Real-Time Tests (Should auto-update)
- [ ] Progress bar visible (0-100%)
- [ ] Completed count increments
- [ ] Pending count decrements
- [ ] Status badges show correct colors
- [ ] Retry count visible
- [ ] Last attempt time shown
- [ ] Next retry scheduled (orange banner)
- [ ] No manual refresh needed

### Dashboard Tests (Should update instantly)
- [ ] New batch appears in list
- [ ] Batch count increments
- [ ] Status badges update
- [ ] Progress bars update
- [ ] Sorting works (newest first)
- [ ] No refresh required

---

## ðŸš¨ CRITICAL ISSUES?

### If something breaks:
1. **Take a screenshot** of error
2. **Note the exact steps** that caused it
3. **Check error console** for red errors
4. **Try to reproduce** 2-3 times
5. **Document clearly** in test report

### Common Issues:
âŒ App won't start â†’ Restart: `npm start -- --reset-cache`
âŒ Firebase error â†’ Check .env and rules
âŒ Balance not showing â†’ Check user logged in
âŒ Real-time not working â†’ Check batch status â‰  "draft"

---

## ðŸ“Š AFTER TESTING

Copy this to test report:
```
Tests Passed: ___ / 16 critical tests
Tests Failed: ___
Success Rate: ___%

Critical Issues Found:
1. ________________
2. ________________

Minor Issues Found:
1. ________________

Release Status:
[ ] PASS - Ready to release
[ ] FAIL - Fix issues first

Tester: ___________
Date: ___________
```

---

## ðŸ’¡ TIPS

âœ“ Test on actual phone/emulator when possible
âœ“ Clear browser cache if things look weird
âœ“ Check network tab if requests fail
âœ“ Use DevTools for screenshot comparison
âœ“ Test in multiple browsers (Chrome, Safari)
âœ“ Test on different screen sizes
âœ“ Check dark mode works (if available)

---

## ðŸŽ“ NEED HELP?

| Problem | File to Read |
|---------|--------------|
| Step-by-step guide | TEST_CHECKLIST_QUICK.md |
| Detailed plan | TEST_PLAN_REGRESSION.md |
| How to use TestReporter | TESTING_GUIDE_COMPLETE.md |
| Example test run | src/utils/testExample.ts |

---

**Start Testing:**
1. `npm start`
2. Open app
3. Start Phase 1
4. Mark each box âœ“
5. Fill summary
6. Done! ðŸŽ‰

---

Print this card and tape it to your monitor! ðŸ“Œ


