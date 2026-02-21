# 🎯 BATCH SYSTEM - TEST QUICK REFERENCE CARD

Print this and keep it handy while testing!

---

## ⚡ Quick Start (60 min)

### Phase 1: Batch Creation (15 min)
```
1. Manual: Home → Add Lead → 3 phones → Save ✓
2. CSV: Home → Upload → 4 contacts from CSV ✓
3. Paste: Home → Paste → 3 phones → Save ✓
4. Image: Home → Image → Extract → Save ✓
```

### Phase 2: Wallet Check (10 min)
```
1. Dashboard → Check balance shown ✓
2. Click "Call Now" on 3-contact batch ✓
3. Verify required: 3 × ₹14 = ₹42 ✓
4. Verify available shown ✓
5. Confirm call ✓
```

### Phase 3: Real-Time (15 min)
```
1. Open batch detail after "Call Now" ✓
2. Check progress bar visible ✓
3. Check status colors: gray/blue/green/red ✓
4. Check retry info visible ✓
5. No page refresh needed ✓
```

### Phase 4: Dashboard (10 min)
```
1. New batches appear without refresh ✓
2. Status badges update ✓
3. Progress bars update ✓
4. No lag > 2 seconds ✓
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

## 🎨 Status Color Reference

| Status | Color | Icon | What It Means |
|--------|-------|------|---------------|
| pending | 🔘 Gray | ⭕ | Waiting to be called |
| calling | 🔵 Blue | 📞 | Currently on call |
| completed | 🟢 Green | ✅ | Call finished |
| failed | 🔴 Red | ❌ | Call failed |
| busy | 🟠 Orange | ⚠️ | Line was busy |

---

## 📱 Screen Navigation

```
Home Screen
  ├─ Add Lead → [Manual Entry]
  ├─ Upload Leads → [CSV, Image, Paste]
  ├─ Batch Dashboard ← [ALL BATCHES]
  └─ Wallet ← [BALANCE CHECK]

Batch Dashboard
  ├─ Batch List [Status, Count, Source]
  └─ Each Batch → [Batch Detail]

Batch Detail
  ├─ Batch Info [ID, Count, Date]
  ├─ Contact List [Phone, Status, Retry Info]
  ├─ Progress Bar [Completed/Total]
  ├─ Stats Cards [Completed, Pending, Retries]
  └─ Action Buttons [Call Now, Schedule, Delete]
```

---

## ✅ TEST CHECKLIST

### Creation Tests (Each should show "draft" status)
- [ ] Manual: 3 contacts, source="manual"
- [ ] CSV: 4 contacts, names visible, source="csv"
- [ ] Paste: 3 contacts, normalized phones, source="clipboard"
- [ ] Image: extracted numbers, confidence shown, source="image"

### Wallet Tests (All should succeed)
- [ ] Balance visible in header (₹XXXX)
- [ ] Green "Live" indicator present
- [ ] Balance check on "Call Now" works
- [ ] Required amount calculated correctly (contacts × 14)
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

## 🚨 CRITICAL ISSUES?

### If something breaks:
1. **Take a screenshot** of error
2. **Note the exact steps** that caused it
3. **Check error console** for red errors
4. **Try to reproduce** 2-3 times
5. **Document clearly** in test report

### Common Issues:
❌ App won't start → Restart: `npm start -- --reset-cache`
❌ Firebase error → Check .env and rules
❌ Balance not showing → Check user logged in
❌ Real-time not working → Check batch status ≠ "draft"

---

## 📊 AFTER TESTING

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

## 💡 TIPS

✓ Test on actual phone/emulator when possible
✓ Clear browser cache if things look weird
✓ Check network tab if requests fail
✓ Use DevTools for screenshot comparison
✓ Test in multiple browsers (Chrome, Safari)
✓ Test on different screen sizes
✓ Check dark mode works (if available)

---

## 🎓 NEED HELP?

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
4. Mark each box ✓
5. Fill summary
6. Done! 🎉

---

Print this card and tape it to your monitor! 📌
