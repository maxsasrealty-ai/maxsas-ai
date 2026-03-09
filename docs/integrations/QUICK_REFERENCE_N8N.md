<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# ðŸŽ¯ QUICK REFERENCE - N8N READY APP

## Files Created (7 new files)

```
src/lib/
â”œâ”€ leadSchema.ts ................. Lead schema & validation
â”œâ”€ leadService.ts ................ All service functions

src/components/ui/
â”œâ”€ DashboardStats.tsx ............ Real-time metrics

src/features/leads/
â”œâ”€ FollowUpScheduleScreen.tsx ..... Schedule follow-ups
â”œâ”€ ScheduledFollowUpsScreen.tsx ... View scheduled follow-ups

app/
â”œâ”€ follow-up-schedule.tsx ......... Route
â”œâ”€ scheduled-follow-ups.tsx ....... Route

Docs/
â”œâ”€ N8N_READINESS.md .............. Complete guide
â”œâ”€ IMPLEMENTATION_COMPLETE_N8N.md. Summary
â””â”€ QUICK_REFERENCE.md ............ This file
```

---

## ðŸ“ Lead Schema (What N8N Sees)

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

## ðŸ”§ Key Service Functions

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

## ðŸ“Š Dashboard Component

```tsx
import { DashboardStats } from '@/src/components/ui/DashboardStats';

<DashboardStats refresh={triggerRefresh} />
```

**Shows**: Total, New, Pending, Interested, Not Interested, Follow-up, Scheduled, Closed, Due Today

---

## ðŸ”„ Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/leads` | LeadsScreen | Main dashboard |
| `/follow-up-schedule` | FollowUpScheduleScreen | Schedule follow-up |
| `/scheduled-follow-ups` | ScheduledFollowUpsScreen | View scheduled |

---

## ðŸŽ¯ Common Workflows

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

## ðŸ” For N8N: Common Queries

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

## ðŸ“ Actions for N8N

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

## âœ… Verification Checklist

- [ ] App runs without errors
- [ ] Dashboard shows lead counts
- [ ] Can add manual lead
- [ ] Can schedule follow-up
- [ ] Check Firebase console â†’ see schema fields
- [ ] Check Firebase console â†’ see history entries
- [ ] Open DevTools â†’ no console errors
- [ ] Can mark as interested
- [ ] Can view scheduled follow-ups
- [ ] Pull-to-refresh works

---

## ðŸš€ N8N Integration Checklist

- [ ] Design N8N workflows
- [ ] Create Firebase API connection
- [ ] Create webhook triggers
- [ ] Test with sample lead
- [ ] Monitor automation runs
- [ ] Check history is logging
- [ ] Set up error handling
- [ ] Configure notifications

---

## ðŸ“ž Common Status Values

```
status:
  "new" â†’ Lead just added
  "interested" â†’ Lead showed interest
  "not_interested" â†’ Lead declined
  "follow_up" â†’ Scheduled for follow-up
  "closed" â†’ Deal closed

intakeStatus:
  "pending" â†’ Waiting for automation
  "in_progress" â†’ N8N currently processing
  "completed" â†’ N8N finished
  "failed" â†’ Error occurred

intakeAction:
  "none" â†’ No action yet
  "call" â†’ Call lead
  "email" â†’ Send email
  "sms" â†’ Send SMS
```

---

## ðŸ’¡ Pro Tips

1. **Always check automationTriggered flag** before duplicate processing
2. **Read history array** to understand what happened
3. **Use scheduleAt for scheduling** (timestamp, not string)
4. **Set lastActionAt** when taking action
5. **Use followUpNotes** to store context
6. **Add to history** every action for audit trail

---

## ðŸŽ“ Learning Path

1. Read `N8N_READINESS.md` - Full guide
2. Read `IMPLEMENTATION_COMPLETE_N8N.md` - Overview
3. Check `src/lib/leadSchema.ts` - Understand structure
4. Check `src/lib/leadService.ts` - See all functions
5. Check LeadsScreen.tsx - See UI integration
6. Start building N8N workflows!

---

**Your app is n8n automation-ready! ðŸš€**

No more changes needed to the app structure.
Just design your workflows and connect them!


