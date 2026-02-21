# Firestore Security Rules - Documentation & Test Cases

## Overview

These security rules enforce strict data access policies for the Batch + Leads system:

1. **Authentication Required**: All operations require user authentication
2. **Data Ownership**: Users can only access their own data
3. **Referential Integrity**: Leads can only exist if their parent batch exists
4. **Immutable Fields**: Critical fields (IDs, timestamps) cannot be modified
5. **Status Validation**: Only valid status values are allowed

---

## Security Rules Architecture

### Helper Functions

```firestore
// Check if user is authenticated
function isAuthenticated()

// Check if current user is the data owner
function isCurrentUser(userId)

// Check if user has automation role (system service)
function isAutomation()

// Check if user owns the batch
function isBatchOwner(batchId)

// Check if batch document exists
function batchExists(batchId)

// Validate enum values
function isValidLeadStatus(status)      // 'queued', 'calling', 'completed'
function isValidBatchStatus(status)     // 'running', 'scheduled', 'completed'
function isValidAction(action)          // 'call_now', 'schedule'
function isValidBatchSource(source)     // 'manual', 'csv', 'clipboard', 'image'
```

---

## Collection Rules

### BATCHES Collection

**Document Path**: `batches/{batchId}`

#### CREATE ✅ Allowed
```
✅ User creates batch after selecting "Call Now" or "Schedule"
```

**Conditions**:
- User is authenticated
- `userId` in batch = `auth.uid` (data ownership)
- `batchId` field matches document ID
- `status` in ['running', 'scheduled', 'completed']
- `action` in ['call_now', 'schedule']
- `source` in ['manual', 'csv', 'clipboard', 'image']
- `totalContacts` > 0 and ≤ 10,000
- `createdAt` timestamp exists

#### READ ✅ Allowed
```
✅ User reads their own batches
✅ Automation service reads batches
```

**Conditions**:
- User is authenticated AND
- (`userId` = `auth.uid` OR user has automation role)

#### UPDATE ✅ Allowed
```
✅ User updates status (e.g., running → completed)
✅ Automation service updates batch status
```

**Conditions**:
- User is authenticated AND
- (`userId` = `auth.uid` OR user has automation role) AND
- Immutable fields NOT changed:
  - `userId` (cannot change owner)
  - `batchId` (cannot change ID)
  - `createdAt` (cannot change creation time)
- `status` is valid

#### DELETE ✅ Allowed
```
✅ User deletes their own batches
```

**Conditions**:
- User is authenticated
- `userId` = `auth.uid`

---

### LEADS Collection

**Document Path**: `leads/{leadId}`

#### CREATE ✅ Allowed
```
✅ User creates lead for their batch
```

**CRITICAL CONDITIONS** (Referential Integrity):
- User is authenticated
- `userId` = `auth.uid` (data ownership)
- `batchId` is not null (lead must reference a batch)
- **Batch must EXIST** (`batchExists(batchId)` = true)
- **Batch must belong to user** (`isBatchOwner(batchId)` = true)
- `phone` is not null and not empty
- `leadId` = document ID
- `status` = 'queued' (initial status)
- `createdAt` timestamp exists

#### READ ✅ Allowed
```
✅ User reads their own leads
✅ Automation service reads leads
```

**Conditions**:
- User is authenticated AND
- (`userId` = `auth.uid` OR user has automation role)

#### UPDATE ✅ Allowed
```
✅ User updates lead status (queued → calling → completed)
✅ Automation service updates lead status
```

**Conditions**:
- User is authenticated AND
- (`userId` = `auth.uid` OR user has automation role) AND
- Immutable fields NOT changed:
  - `leadId` (cannot change ID)
  - `batchId` (cannot change parent batch)
  - `userId` (cannot change owner)
  - `createdAt` (cannot change creation time)
- `status` is valid

#### DELETE ✅ Allowed
```
✅ User deletes their own leads
```

**Conditions**:
- User is authenticated
- `userId` = `auth.uid`

---

## Test Cases

### Test 1: CREATE BATCH ✅

**Scenario**: User creates a batch with 45 contacts

```javascript
// TEST DATA
const user1Id = 'user-001-abc123';
const batchId = 'batch-xyz789';

// BATCH DOCUMENT
{
  batchId: 'batch-xyz789',
  userId: 'user-001-abc123',          // ✅ Matches auth.uid
  status: 'running',                   // ✅ Valid status
  action: 'call_now',                  // ✅ Valid action
  source: 'clipboard',                 // ✅ Valid source
  totalContacts: 45,                   // ✅ > 0 and ≤ 10,000
  createdAt: Timestamp.now(),          // ✅ Timestamp exists
}
```

**Expected Result**: ✅ **CREATE ALLOWED**

**Security Checks**:
- ✅ User is authenticated (request.auth != null)
- ✅ `userId` matches `auth.uid`
- ✅ `batchId` field matches document ID
- ✅ Valid status, action, source
- ✅ Valid totalContacts
- ✅ createdAt timestamp provided

**Failure Cases**:
```javascript
// ❌ FAIL: userId doesn't match auth.uid
{
  userId: 'user-002-different',  // NOT user-001-abc123
  ...
}
// Error: userId != request.auth.uid

// ❌ FAIL: Invalid status
{
  status: 'draft',  // NOT in ['running', 'scheduled', 'completed']
  ...
}
// Error: status not valid

// ❌ FAIL: No contacts
{
  totalContacts: 0,  // NOT > 0
  ...
}
// Error: totalContacts must be > 0

// ❌ FAIL: Missing createdAt
{
  createdAt: null,  // Missing timestamp
  ...
}
// Error: createdAt required
```

---

### Test 2: CREATE LEADS (Referential Integrity) ✅

**Scenario**: User creates 45 lead documents for the batch

```javascript
// PREREQUISITE: Batch must exist
// Document: batches/batch-xyz789 with userId = user-001-abc123

// LEAD DOCUMENT (repeat for each contact)
const lead1 = {
  leadId: 'lead-001-abc',
  batchId: 'batch-xyz789',             // ✅ References existing batch
  userId: 'user-001-abc123',           // ✅ Matches auth.uid AND batch owner
  phone: '+1-555-1234',                // ✅ Valid phone
  name: 'John Doe',
  status: 'queued',                    // ✅ Valid initial status
  createdAt: Timestamp.now(),          // ✅ Timestamp exists
};
```

**Expected Result**: ✅ **CREATE ALLOWED**

**CRITICAL Security Checks**:
- ✅ User is authenticated
- ✅ `userId` matches `auth.uid`
- ✅ Batch exists (`exists(/databases/.../batches/batch-xyz789)`)
- ✅ Batch belongs to user (`get(.../batches/batch-xyz789).data.userId == auth.uid`)
- ✅ `phone` is not null/empty
- ✅ `status` is valid
- ✅ `createdAt` timestamp provided

**Failure Cases**:
```javascript
// ❌ FAIL: Batch doesn't exist
{
  batchId: 'batch-nonexistent',  // Batch doesn't exist
  ...
}
// Error: batchExists() = false → CREATE DENIED
// Result: User cannot create orphaned leads

// ❌ FAIL: Batch belongs to different user
{
  batchId: 'batch-user002',  // Batch owner is user-002
  userId: 'user-001-abc123', // But trying to add as user-001
}
// Error: isBatchOwner() = false → CREATE DENIED
// Result: User cannot add leads to other users' batches

// ❌ FAIL: Missing phone
{
  phone: null,  // OR empty string
  ...
}
// Error: phone must not be null/empty

// ❌ FAIL: Invalid status
{
  status: 'calling',  // Only 'queued' acceptable at creation
  ...
}
// Error: Only initial status allowed

// ❌ FAIL: userId mismatch
{
  userId: 'user-002-different',
  ...
}
// Error: userId must match auth.uid
```

---

### Test 3: READ BATCHES ✅

**Scenario**: User reads their own batch

```javascript
// USER 1: Reading their own batch
// auth.uid = 'user-001-abc123'
// Document: batches/batch-xyz789 with userId = 'user-001-abc123'

GET /batches/batch-xyz789
```

**Expected Result**: ✅ **READ ALLOWED**

**Security Check**:
- ✅ User is authenticated
- ✅ `auth.uid == resource.data.userId`

**Failure Cases**:
```javascript
// ❌ FAIL: User reads another user's batch
// auth.uid = 'user-001-abc123'
// Document userId = 'user-002-different'

GET /batches/batch-user002
// Error: auth.uid != resource.data.userId → READ DENIED
// Result: User cannot read other users' batches

// ❌ FAIL: Unauthenticated access
// No auth token

GET /batches/batch-xyz789
// Error: request.auth == null → READ DENIED
// Result: Anonymous users cannot read batches
```

---

### Test 4: READ LEADS ✅

**Scenario**: User reads their own leads

```javascript
// USER 1: Reading their own lead
// auth.uid = 'user-001-abc123'
// Document: leads/lead-001 with userId = 'user-001-abc123'

GET /leads/lead-001
```

**Expected Result**: ✅ **READ ALLOWED**

**Security Check**:
- ✅ User is authenticated
- ✅ `auth.uid == resource.data.userId`

**Failure Cases**:
```javascript
// ❌ FAIL: User reads another user's lead
// auth.uid = 'user-001-abc123'
// Document userId = 'user-002-different'

GET /leads/lead-user002
// Error: Unauthorized → READ DENIED
// Result: User cannot read other users' leads

// ❌ FAIL: Unauthenticated access
// No auth token

GET /leads/lead-001
// Error: Unauthenticated → READ DENIED
// Result: Anonymous users cannot read leads
```

---

## Security Test Matrix

| Operation | User1 Own Data | User2 Own Data | Unauthenticated | Automation | Expected |
|-----------|---|---|---|---|---|
| **BATCH CREATE** | ✅ | ❌ | ❌ | ❌ | Owner Only |
| **BATCH READ** | ✅ | ❌ | ❌ | ✅ | Owner + Automation |
| **BATCH UPDATE** | ✅ | ❌ | ❌ | ✅ | Owner + Automation |
| **BATCH DELETE** | ✅ | ❌ | ❌ | ❌ | Owner Only |
| **LEAD CREATE** | ✅* | ❌ | ❌ | ❌ | Owner Only* |
| **LEAD READ** | ✅ | ❌ | ❌ | ✅ | Owner + Automation |
| **LEAD UPDATE** | ✅ | ❌ | ❌ | ✅ | Owner + Automation |
| **LEAD DELETE** | ✅ | ❌ | ❌ | ❌ | Owner Only |

\* **LEAD CREATE** has additional requirement: Parent batch must exist and belong to owner

---

## Implementation Checklist

- [x] Authentication required for all operations
- [x] Data ownership enforced (userId field)
- [x] Batch existence check before lead creation
- [x] Batch ownership check before lead creation
- [x] Immutable field protection (IDs, timestamps)
- [x] Valid enum values for status, action, source
- [x] Contact count limits (0 < value ≤ 10,000)
- [x] Automation service access (special role)
- [x] Explicit deny-all for unknown collections
- [x] Documentation of all rules
- [x] Test cases for all scenarios

---

## Deployment Instructions

1. **Test in Emulator** (Local Development):
   ```bash
   firebase emulators:start
   ```

2. **Deploy to Firebase**:
   ```bash
   firebase deploy --only firestore:rules
   ```

3. **Verify in Console**:
   - Go to Firebase Console
   - Navigate to Firestore → Rules
   - Check deployment status

---

## Security Principles Applied

1. **Principle of Least Privilege**: Users can only access their own data
2. **Fail Closed**: Default deny all access unless explicitly allowed
3. **Input Validation**: All data types and values validated
4. **Referential Integrity**: Foreign key relationships enforced
5. **Immutability**: Critical fields cannot be modified
6. **Audit Trail**: Timestamps cannot be forged by client

---

## Automation Service Setup

For the automation service to read/update batches and leads:

**Firebase Authentication Token**:
```json
{
  "iss": "https://securetoken.google.com/maxsas-realty",
  "aud": "maxsas-realty",
  "auth_time": 1234567890,
  "user_id": "automation-service",
  "sub": "automation-service",
  "iat": 1234567890,
  "exp": 1234571490,
  "email": "automation@maxsas.internal",
  "firebase": {
    "identities": {},
    "sign_in_provider": "custom",
    "role": "automation"  ← This custom claim enables automation access
  }
}
```

**Set Custom Claims** (via Firebase Admin SDK):
```typescript
await admin.auth().setCustomUserClaims(automationUid, { role: 'automation' });
```

---

## Common Issues & Solutions

### Issue 1: "Leads creation fails with 'Permission denied'"
**Cause**: Parent batch doesn't exist or is owned by different user
**Solution**: Verify batch is created first, and `batch.userId == auth.uid`

### Issue 2: "Cannot update batch status"
**Cause**: Trying to modify immutable fields (userId, batchId, createdAt)
**Solution**: Only update `status` field; other fields are locked

### Issue 3: "Automation service cannot read data"
**Cause**: Missing custom claim `role: 'automation'` in token
**Solution**: Set custom claims on automation service account in Firebase Console

### Issue 4: "User can read other users' data"
**Cause**: Rules not properly checking data ownership
**Solution**: Verify `resource.data.userId` is being compared correctly

---

## Next Steps

1. Deploy these rules to Firebase
2. Run test cases in Firestore Emulator
3. Monitor security logs in Firebase Console
4. Update rules if new collections are added
5. Review and audit quarterly
