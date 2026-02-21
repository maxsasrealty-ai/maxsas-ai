# 🎯 QUICK REFERENCE - N8N READY APP

## Files Created (7 new files)

```
src/lib/
├─ leadSchema.ts ................. Lead schema & validation
├─ leadService.ts ................ All service functions

src/components/ui/
├─ DashboardStats.tsx ............ Real-time metrics

src/features/leads/
├─ FollowUpScheduleScreen.tsx ..... Schedule follow-ups
├─ ScheduledFollowUpsScreen.tsx ... View scheduled follow-ups

app/
├─ follow-up-schedule.tsx ......... Route
├─ scheduled-follow-ups.tsx ....... Route

Docs/
├─ N8N_READINESS.md .............. Complete guide
├─ IMPLEMENTATION_COMPLETE_N8N.md. Summary
└─ QUICK_REFERENCE.md ............ This file
```

---

## 📐 Lead Schema (What N8N Sees)

```typescript
{
  phone: string;              // "9876543210"
  source: string;             // "manual" | "csv" | "image"
  userId: string;             // User ID
  createdAt: Timestamp;       // When created
  updatedAt: Timestamp;       // Last update
  
  status: string;             // "new" | "interested" | "not_interested" | "follow_up" | "closed"
  intakeAction: string;       // "none" | "call" | "email" | "sms"
  intakeStatus: string;       // "pending" | "in_progress" | "completed" | "failed"
  
  followUpRequired: boolean;   // true/false
  scheduleAt: Timestamp;      // When to follow up
  followUpNotes: string;      // Why following up
  lastActionAt: Timestamp;    // Last action time
  
  automationTriggered: boolean;   // Has n8n processed?
  automationError: string;        // Error message if failed
  
  notes: string;              // User notes
  history: [                  // Activity log
    { action, timestamp, details, updatedBy }
  ]
}
```

---

## 🔧 Key Service Functions

```typescript
// Add lead with schema
import { addLeadWithSchema } from '@/src/lib/leadService';
await addLeadWithSchema(phone, source, extraData);

// Update status (auto-logs)
import { updateLeadStatus } from '@/src/lib/leadService';
await updateLeadStatus(leadId, 'interested', 'notes');

// Schedule follow-up
import { scheduleFollowUp } from '@/src/lib/leadService';
await scheduleFollowUp(leadId, dateObj, 'notes');

// Add history entry
import { addHistoryEntry } from '@/src/lib/leadService';
await addHistoryEntry(leadId, 'action_name', 'details');

// Update automation status
import { updateIntakeStatus } from '@/src/lib/leadService';
await updateIntakeStatus(leadId, 'in_progress', 'action');

// Trigger n8n
import { triggerAutomation } from '@/src/lib/leadService';
await triggerAutomation(leadId);

// Get dashboard stats
import { getDashboardStats } from '@/src/lib/leadService';
const stats = await getDashboardStats();

// Get scheduled follow-ups
import { getScheduledFollowUps } from '@/src/lib/leadService';
const followUps = await getScheduledFollowUps();
```

---

## 📊 Dashboard Component

```tsx
import { DashboardStats } from '@/src/components/ui/DashboardStats';

<DashboardStats refresh={triggerRefresh} />
```

**Shows**: Total, New, Pending, Interested, Not Interested, Follow-up, Scheduled, Closed, Due Today

---

## 🔄 Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/leads` | LeadsScreen | Main dashboard |
| `/follow-up-schedule` | FollowUpScheduleScreen | Schedule follow-up |
| `/scheduled-follow-ups` | ScheduledFollowUpsScreen | View scheduled |

---

## 🎯 Common Workflows

### Add Lead (Existing Works!)
```typescript
import { addLeadWithSchema } from '@/src/lib/leadService';

const lead = await addLeadWithSchema(
  '9876543210',
  'image',
  { notes: 'From screenshot' }
);
```

### Mark as Interested
```typescript
import { updateLeadStatus } from '@/src/lib/leadService';

await updateLeadStatus(leadId, 'interested', 'Showed interest');
```

### Schedule Follow-up
```typescript
import { scheduleFollowUp } from '@/src/lib/leadService';

const futureDate = new Date();
futureDate.setDate(futureDate.getDate() + 3);
futureDate.setHours(14, 0);

await scheduleFollowUp(leadId, futureDate, 'Check property availability');
```

### Get Dashboard Stats
```typescript
import { getDashboardStats } from '@/src/lib/leadService';

const stats = await getDashboardStats();
console.log(`${stats.newLeads} new leads pending`);
console.log(`${stats.scheduledLeads} leads scheduled`);
```

---

## 🔍 For N8N: Common Queries

```firestore
// Get pending leads (not yet automated)
collection('leads')
  .where('userId', '==', currentUser)
  .where('intakeStatus', '==', 'pending')
  .orderBy('createdAt', 'desc')

// Get leads scheduled for today
collection('leads')
  .where('userId', '==', currentUser)
  .where('scheduleAt', '>=', today)
  .where('scheduleAt', '<', tomorrow)
  .orderBy('scheduleAt', 'asc')

// Get leads not yet processed by automation
collection('leads')
  .where('userId', '==', currentUser)
  .where('automationTriggered', '==', false)

// Get leads by source
collection('leads')
  .where('userId', '==', currentUser)
  .where('source', '==', 'image')
```

---

## 📝 Actions for N8N

```javascript
// Update after calling
update('/leads/{leadId}', {
  intakeStatus: 'completed',
  intakeAction: 'call',
  automationTriggered: true,
  history: arrayUnion({
    action: 'automation_call_completed',
    timestamp: now,
    details: 'Called by n8n automation'
  })
})

// Mark as interested
update('/leads/{leadId}', {
  status: 'interested',
  intakeStatus: 'completed'
})

// Schedule follow-up
update('/leads/{leadId}', {
  status: 'follow_up',
  scheduleAt: futureDate,
  followUpNotes: 'Needs callback in 3 days'
})

// Log error
update('/leads/{leadId}', {
  intakeStatus: 'failed',
  automationError: 'Could not reach customer'
})
```

---

## ✅ Verification Checklist

- [ ] App runs without errors
- [ ] Dashboard shows lead counts
- [ ] Can add manual lead
- [ ] Can schedule follow-up
- [ ] Check Firebase console → see schema fields
- [ ] Check Firebase console → see history entries
- [ ] Open DevTools → no console errors
- [ ] Can mark as interested
- [ ] Can view scheduled follow-ups
- [ ] Pull-to-refresh works

---

## 🚀 N8N Integration Checklist

- [ ] Design N8N workflows
- [ ] Create Firebase API connection
- [ ] Create webhook triggers
- [ ] Test with sample lead
- [ ] Monitor automation runs
- [ ] Check history is logging
- [ ] Set up error handling
- [ ] Configure notifications

---

## 📞 Common Status Values

```
status:
  "new" → Lead just added
  "interested" → Lead showed interest
  "not_interested" → Lead declined
  "follow_up" → Scheduled for follow-up
  "closed" → Deal closed

intakeStatus:
  "pending" → Waiting for automation
  "in_progress" → N8N currently processing
  "completed" → N8N finished
  "failed" → Error occurred

intakeAction:
  "none" → No action yet
  "call" → Call lead
  "email" → Send email
  "sms" → Send SMS
```

---

## 💡 Pro Tips

1. **Always check automationTriggered flag** before duplicate processing
2. **Read history array** to understand what happened
3. **Use scheduleAt for scheduling** (timestamp, not string)
4. **Set lastActionAt** when taking action
5. **Use followUpNotes** to store context
6. **Add to history** every action for audit trail

---

## 🎓 Learning Path

1. Read `N8N_READINESS.md` - Full guide
2. Read `IMPLEMENTATION_COMPLETE_N8N.md` - Overview
3. Check `src/lib/leadSchema.ts` - Understand structure
4. Check `src/lib/leadService.ts` - See all functions
5. Check LeadsScreen.tsx - See UI integration
6. Start building N8N workflows!

---

**Your app is n8n automation-ready! 🚀**

No more changes needed to the app structure.
Just design your workflows and connect them!
