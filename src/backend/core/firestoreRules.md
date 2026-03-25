# Firestore Rules for Plan Isolation

- Use plan-specific collections: nexus_batches, enterprise_batches, nexus_leads, enterprise_leads
- Restrict access based on user planType
- Ensure no cross-plan access

Example:
```
service cloud.firestore {
  match /databases/{database}/documents {
    match /nexus_batches/{batchId} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.planType == 'nexus';
    }
    match /enterprise_batches/{batchId} {
      allow read, write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.planType == 'enterprise';
    }
    // ...similar for leads
  }
}
```
