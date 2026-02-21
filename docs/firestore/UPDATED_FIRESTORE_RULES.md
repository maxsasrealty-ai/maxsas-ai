# Updated Firestore Security Rules

## Current Rules (firestore.rules)

```plaintext
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAutomation() {
      return request.auth != null && request.auth.token.role == 'automation';
    }

    // User profiles - only the user can read/write their own
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }

    // Leads - only authenticated users can create/read their own
    match /leads/{leadId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid
        && request.resource.data.phone != null;
      allow read: if request.auth != null && request.auth.uid == resource.data.userId
        || isAutomation();
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.userId
        && request.resource.data.userId == resource.data.userId;
    }

    // Transactions - only authenticated users can create/read their own
    match /transactions/{transactionId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null
        && request.auth.uid == resource.data.userId;
      allow update, delete: if request.auth != null
        && request.auth.uid == resource.data.userId
        && request.resource.data.userId == resource.data.userId;
    }

    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## What Changed

1. **Leads Collection - Create Rule:**
   - Added `request.resource.data.phone != null` validation
   - Ensures phone number is always present when creating a lead
   - Format: `+91` followed by 10 digits (validated in app)

2. **Leads Collection - Read Rule:**
   - Fixed parentheses: Now properly allows users to read their own leads OR automation service
   - `(request.auth != null && request.auth.uid == resource.data.userId) || isAutomation()`

## Deployment Steps

### Option 1: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select **real-estate-ai-agent-cbd9b** project
3. Navigate to **Firestore Database** → **Rules** tab
4. Copy the rules from above
5. Click **Publish**

### Option 2: Firebase CLI
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Deploy rules
firebase deploy --only firestore:rules
```

## Testing the Rules

### Test in Firebase Console Rules Simulator:
1. Go to Firestore → Rules → Simulator tab
2. **Create Lead Test:**
   - Service: Cloud Firestore
   - Document Path: `/leads/test_lead_001`
   - Operation: `create`
   - Request Auth: User ID `user_123`
   - Request Data:
   ```json
   {
     "userId": "user_123",
     "phone": "+919876543210",
     "name": "Test User",
     "status": "new",
     "source": "manual",
     "intakeAction": "call_now",
     "intakeStatus": "queued",
     "createdAt": {"__type":"timestamp"}
   }
   ```

## Required Fields for Lead Creation

All leads MUST have:
- `userId` - Firebase Auth UID (auto-added by app)
- `phone` - Phone number in format `+91` + 10 digits
- `createdAt` - Server timestamp (auto-added by app)

Optional fields:
- `name` - Lead name
- `status` - Lead status (new, interested, not_interested, closed)
- `source` - Where lead came from (manual, paste, upload, attachment)
- `intakeAction` - Action choice (call_now, schedule, save_only)
- `intakeStatus` - Status (queued, scheduled, saved)
- `scheduleAt` - Schedule time if action is schedule

## Common Issues & Fixes

### Issue: "User not authenticated"
**Fix:** Make sure you're logged in before adding leads
- Check Auth state in LoginScreen
- Verify auth tokens are valid

### Issue: "Missing or invalid required field"
**Fix:** Ensure phone number format is exactly: `+91XXXXXXXXXX` (13 characters)
- App validates in AddLeadScreen component
- Use `validatePhone()` function

### Issue: Rules rejected the request
**Fix:** Check that:
1. User is authenticated (`request.auth != null`)
2. `userId` field matches authenticated user ID
3. Phone number exists and is not null
4. Trying to access own data (for read/update/delete)

## For n8n Automation

To allow n8n to read leads:
1. Set up n8n service account in Firebase
2. Add custom claim: `"role": "automation"`
3. n8n can then read all leads for processing
4. No modification of rules needed - already configured

## Reference

- Firebase Rules Docs: https://firebase.google.com/docs/firestore/security/get-started
- Security best practices: https://firebase.google.com/docs/firestore/security/best-practices
