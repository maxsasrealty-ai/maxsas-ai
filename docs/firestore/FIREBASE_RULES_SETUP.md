<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Firebase Security Rules Deployment Guide

## Firestore Security Rules Setup

The app now has security rules defined in `firestore.rules`. These rules ensure:

### Rules Breakdown:
1. **Users Collection** (`/users/{uid}`)
   - Only the user can read/write their own profile
   - Prevents other users from accessing or modifying profiles

2. **Leads Collection** (`/leads/{leadId}`)
   - Only authenticated users can create leads
   - Users can only read/write their own leads (checked via `userId` field)

3. **Transactions Collection** (`/transactions/{transactionId}`)
   - Only authenticated users can create transactions
   - Users can only read/write their own transactions (checked via `userId` field)

4. **Default Deny** - All other access is denied

### How to Deploy Rules to Firebase:

**Option 1: Using Firebase Console**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your "maxsas-ai" project
3. Go to **Firestore Database** â†’ **Rules** tab
4. Copy the entire content from `firestore.rules` file
5. Paste it into the Rules editor
6. Click **Publish**

**Option 2: Using Firebase CLI**
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### Important Notes:
- Make sure to add a `userId` field when creating leads and transactions in your app
- Example: `await setDoc(doc(db, 'leads', leadId), { userId: auth.currentUser.uid, ... })`
- Test the rules before deploying to production using the Firestore Rules Simulator in Firebase Console

### Current App Updates:
âœ… Auth routing fixed - login/signup now shows when not authenticated
âœ… Logout button added to Settings screen
âœ… Firestore security rules created and ready to deploy


