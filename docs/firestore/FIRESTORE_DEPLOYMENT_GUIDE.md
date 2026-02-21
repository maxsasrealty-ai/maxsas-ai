# Firestore Security Rules - Quick Deployment Guide

## 📋 Overview

The updated `firestore.rules` file includes enhanced security rules with the following protections:

✅ **Authentication Required** - All operations require user login
✅ **Data Ownership** - Users only access their own data (userId field)
✅ **Referential Integrity** - Leads can only exist if parent batch exists
✅ **Batch Ownership** - Leads must reference batches owned by the same user
✅ **Immutable Fields** - IDs and timestamps cannot be modified
✅ **Status Validation** - Only valid status values allowed
✅ **Automation Service** - Special role for backend automation

---

## 🚀 Deployment Steps

### Step 1: Local Testing (Firebase Emulator)

```bash
# Start Firebase Emulator
firebase emulators:start

# In another terminal, run tests
npm test -- FIRESTORE_SECURITY_RULES_TESTS.ts

# Expected output:
# ✅ 14/14 tests passed (100%)
```

### Step 2: Deploy to Firebase

```bash
# Deploy only firestore rules (fast)
firebase deploy --only firestore:rules

# Or deploy all (includes functions, hosting, etc)
firebase deploy

# Verify deployment
firebase apps:display --project=maxsas-realty
```

### Step 3: Verify in Firebase Console

1. Open [Firebase Console](https://console.firebase.google.com)
2. Select project: **maxsas-realty**
3. Go to: **Firestore Database** → **Rules** tab
4. Should see deployment timestamp and line count
5. Check for any security warnings

---

## 🔑 Key Security Rules

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| **batches/{batchId}** | ✅ User | ✅ User + Automation | ✅ User + Automation | ✅ User |
| **leads/{leadId}** | ✅ User* | ✅ User + Automation | ✅ User + Automation | ✅ User |

\* Requires: batch exists, batch owned by user, valid phone

---

## ⚙️ Configuration Checklist

- [ ] Local emulator testing passed (all 14 tests)
- [ ] Deployed to Firebase
- [ ] Verified in Firebase Console
- [ ] No security warnings
- [ ] Automation service account created
- [ ] Custom claims set for automation
- [ ] Monitored for first 24 hours

---

## 🔐 Authentication & Custom Claims

### For Automation Service (Backend)

The automation service needs special access to read/update batches and leads.

**Setup in Firebase Console:**

1. **Create Service Account**
   - Firebase Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save JSON file securely

2. **Set Custom Claims** (via Firebase Admin SDK)

```typescript
import * as admin from 'firebase-admin';

const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://maxsas-realty.firebaseio.com'
});

// Set custom claims for automation
const automationUid = 'automation-service';
await admin.auth().setCustomUserClaims(automationUid, {
  role: 'automation'
});

console.log('Custom claims set for automation service');
```

3. **Get Access Token**

```typescript
const token = await admin.auth().createCustomToken(automationUid, {
  role: 'automation'
});
```

---

## 📊 Security Rules Structure

### Helper Functions (Top of Rules)

```firestore
✅ isAuthenticated()        // Check if user logged in
✅ isCurrentUser(userId)    // Check if user owns data
✅ isAutomation()           // Check if automation service
✅ isBatchOwner(batchId)    // Check batch ownership
✅ batchExists(batchId)     // Check batch exists
✅ isValidBatchStatus()     // Validate enum values
```

### BATCHES Collection Rules

**Create Validation:**
- User authenticated ✅
- userId matches auth.uid ✅
- batchId field matches document ID ✅
- Status in ['running', 'scheduled', 'completed'] ✅
- Action in ['call_now', 'schedule'] ✅
- Source in ['manual', 'csv', 'clipboard', 'image'] ✅
- totalContacts > 0 and ≤ 10,000 ✅
- createdAt timestamp provided ✅

**Read Policy:**
- User owns batch OR has automation role ✅

**Update Policy:**
- Immutable fields protected (userId, batchId, createdAt) ✅
- Status must be valid ✅

**Delete Policy:**
- User owns batch ✅

### LEADS Collection Rules

**Create Validation (Most Restrictive):**
- User authenticated ✅
- userId matches auth.uid ✅
- Batch MUST exist ✅
- Batch MUST be owned by user ✅
- Phone not null/empty ✅
- leadId matches document ID ✅
- Status = 'queued' (initial only) ✅
- createdAt timestamp provided ✅

**Read/Update/Delete:**
- Similar to batches ✅

---

## 🧪 Test Coverage

### 14 Test Cases Validate:

1. ✅ **CREATE BATCH** - Valid batch
2. ❌ **CREATE BATCH** - Invalid userId
3. ❌ **CREATE BATCH** - Invalid status
4. ❌ **CREATE BATCH** - Zero contacts
5. ✅ **CREATE LEAD** - Valid (batch exists)
6. ❌ **CREATE LEAD** - Batch doesn't exist (orphaned lead)
7. ❌ **CREATE LEAD** - Batch belongs to different user
8. ❌ **CREATE LEAD** - Missing phone
9. ✅ **READ BATCH** - Own batch
10. ❌ **READ BATCH** - Other user's batch
11. ✅ **READ LEAD** - Own leads
12. ✅ **UPDATE BATCH** - Status change
13. ❌ **UPDATE BATCH** - Change userId (immutable)
14. ✅ **DELETE BATCH** - Own batch

---

## 🚨 Common Issues & Solutions

### Issue: "Permission denied" on lead creation

**Diagnosis:**
- User trying to create lead but batch doesn't exist
- OR batch owned by different user

**Solution:**
```typescript
// ✅ Correct: Create batch first, then leads
const batch = await createBatch(...);
const leads = await createLeads(batch.batchId, ...);

// ❌ Wrong: Trying to create leads without batch
const orphanedLead = await createLead(batchId, ...); // FAILS
```

### Issue: "Cannot update batchId field"

**Diagnosis:**
- Trying to modify immutable field

**Solution:**
```typescript
// ✅ Correct: Only update allowed fields
await batch.update({ status: 'completed' });

// ❌ Wrong: Cannot change immutable fields
await batch.update({ batchId: 'new-id' });      // FAILS
await batch.update({ userId: 'new-user' });     // FAILS
await batch.update({ createdAt: newTime });     // FAILS
```

### Issue: "Automation service cannot read batches"

**Diagnosis:**
- Custom claim `role: 'automation'` not set

**Solution:**
```typescript
// Set in Firebase Console or via Admin SDK
await admin.auth().setCustomUserClaims(automationUid, {
  role: 'automation'
});
```

---

## 📈 Monitoring & Logging

### Check Deployment Status

```bash
# View deployment history
firebase deploy --only firestore:rules

# View current rules
firebase firestore:inspect
```

### Monitor Violations

In Firebase Console:
- Go to **Firestore → Usage**
- Check **Operations** tab
- Look for **Failed writes** or **Denied reads**

### Enable Audit Logs

```bash
firebase auth:list --project=maxsas-realty
firebase firestore:indexes --project=maxsas-realty
```

---

## 🔄 Rules Update Workflow

When updating rules:

1. **Update firestore.rules** file locally
2. **Test in emulator** locally first
3. **Run test suite** - All 14 tests must pass
4. **Deploy to Firebase** - Review changes in console
5. **Monitor for 24 hours** - Check for violations
6. **Rollback if needed** - `firebase deploy:rollback`

---

## ✅ Production Checklist

Before marking as complete:

- [ ] All 14 security tests pass locally
- [ ] Code reviewed by another developer
- [ ] Deployed to Firebase production
- [ ] Verified in Firebase Console (no warnings)
- [ ] Automation service has custom claims set
- [ ] Monitored for 24 hours without issues
- [ ] Documentation updated
- [ ] Team trained on security model
- [ ] Backup of rules saved
- [ ] Regular audit scheduled (quarterly)

---

## 📞 Support & Troubleshooting

### Firebase Documentation
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Custom Claims](https://firebase.google.com/docs/auth/admin/custom-claims)
- [Emulator Guide](https://firebase.google.com/docs/emulator-suite)

### Quick Links
- [Firebase Console - maxsas-realty](https://console.firebase.google.com/project/maxsas-realty/)
- [Firestore Rules - Rules Tab](https://console.firebase.google.com/project/maxsas-realty/firestore/rules)
- [Service Accounts](https://console.firebase.google.com/project/maxsas-realty/settings/serviceaccounts/)

---

## 📝 Summary

**File**: `firestore.rules`
**Tests**: `FIRESTORE_SECURITY_RULES_TESTS.ts`
**Documentation**: `FIRESTORE_SECURITY_RULES.md`

**Key Features:**
- ✅ User authentication required
- ✅ Data ownership enforced (userId field)
- ✅ Referential integrity maintained
- ✅ Immutable field protection
- ✅ Status validation
- ✅ Automation service support
- ✅ 14 comprehensive test cases
- ✅ Clear documentation
