/**
 * PHASE 0 - CRITICAL FIX: Batch Fairness Field Migration
 * 
 * Adds lastDispatchedAt field to all existing batch documents.
 * This field is required for fair batch dispatching in the AI Call Dispatcher.
 * 
 * Run this script ONCE after deployment.
 * 
 * Prerequisites:
 * npm install firebase-admin --save-dev
 * 
 * Usage:
 * npx ts-node scripts/migrate-batch-lastDispatchedAt.ts
 */

/* eslint-disable import/no-unresolved */
// @ts-ignore - firebase-admin is a dev dependency for migration scripts only
import { getApps, initializeApp } from 'firebase-admin/app';
// @ts-ignore - firebase-admin is a dev dependency for migration scripts only
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
/* eslint-enable import/no-unresolved */

const firebaseConfig = {
  apiKey: 'AIzaSyD4RT1oEgcHEBOnAz35LnnzjlH3MATjW-k',
  authDomain: 'real-estate-ai-agent-cbd9b.firebaseapp.com',
  projectId: 'real-estate-ai-agent-cbd9b',
  storageBucket: 'real-estate-ai-agent-cbd9b.firebasestorage.app',
  messagingSenderId: '72516441787',
  appId: '1:72516441787:web:278c4131b77abae438bb9e',
};

// Initialize Firebase Admin
if (getApps().length === 0) {
  initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

const db = getFirestore();

/**
 * Main migration function
 */
async function migrateBatchLastDispatchedAt() {
  console.log('========================================');
  console.log('BATCH FAIRNESS FIELD MIGRATION');
  console.log('========================================\n');
  
  const projectId = firebaseConfig.projectId;
  console.log('📋 Project ID:', projectId);
  console.log('📅 Migration Date:', new Date().toISOString());
  console.log('\n🔄 Starting migration...\n');

  try {
    // Fetch all batch documents
    const batchesRef = db.collection('batches');
    const snapshot = await batchesRef.get();

    const totalDocuments = snapshot.size;
    console.log(`📊 Total documents found: ${totalDocuments}`);

    if (totalDocuments === 0) {
      console.log('✅ No documents to migrate.');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;
    const batch = db.batch();

    // Process each document
    snapshot.forEach((doc: any) => {
      const data = doc.data();
      
      // Check if lastDispatchedAt already exists
      if (data.lastDispatchedAt === undefined || data.lastDispatchedAt === null) {
        // Add the field with default value
        batch.update(doc.ref, {
          lastDispatchedAt: Timestamp.fromMillis(0),
        });
        updatedCount++;
        
        console.log(`  ✓ Queued update for batch: ${doc.id}`);
      } else {
        skippedCount++;
        console.log(`  ⊘ Skipped (field exists): ${doc.id}`);
      }
    });

    // Commit all updates
    if (updatedCount > 0) {
      console.log(`\n💾 Committing ${updatedCount} updates...`);
      await batch.commit();
      console.log('✅ Batch commit successful!\n');
    }

    // Summary
    console.log('========================================');
    console.log('MIGRATION SUMMARY');
    console.log('========================================');
    console.log(`📋 Project ID: ${projectId}`);
    console.log(`📊 Total documents found: ${totalDocuments}`);
    console.log(`✅ Documents updated: ${updatedCount}`);
    console.log(`⊘ Documents skipped: ${skippedCount}`);
    console.log('========================================');
    console.log('✅ Migration completed successfully!');
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Migration failed:');
    console.error(error);
    process.exit(1);
  }
}

// Run migration
migrateBatchLastDispatchedAt()
  .then(() => {
    console.log('🎉 Script completed. Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
