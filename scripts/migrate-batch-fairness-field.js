/**
 * PHASE 0 - CRITICAL MIGRATION
 * Add lastDispatchedAt field to all batch documents
 * 
 * Purpose: Enable fair batch rotation in AI Call Dispatcher
 * 
 * Run with: node scripts/migrate-batch-fairness-field.js
 * 
 * Requirements:
 * - Firebase Admin SDK credentials configured
 * - Firestore access
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
  path.join(process.cwd(), 'google-services.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
} catch (_error) {
  console.error('❌ Failed to initialize Firebase Admin SDK');
  console.error('Ensure GOOGLE_APPLICATION_CREDENTIALS is set or google-services.json exists');
  process.exit(1);
}

const db = admin.firestore();
const ZERO_TIMESTAMP = admin.firestore.Timestamp.fromMillis(0);

/**
 * MAIN MIGRATION FUNCTION
 */
async function migrateBatchFairnessField() {
  try {
    console.log('\n========== BATCH FAIRNESS FIELD MIGRATION ==========');
    console.log('📋 Task: Add lastDispatchedAt field to all batches');
    console.log('⏰ Default value: Timestamp.fromMillis(0)');
    console.log('');

    const projectId = admin.app().options.projectId || 'unknown-project';
    console.log(`🔐 Project ID: ${projectId}`);

    // Step 1: Fetch all batch documents
    console.log('\n📚 Fetching all batch documents...');
    const batchesRef = db.collection('batches');
    const snapshot = await batchesRef.get();

    if (snapshot.empty) {
      console.log('⚠️  No batch documents found in collection');
      return {
        success: true,
        projectId,
        totalDocuments: 0,
        documentsUpdated: 0,
        message: 'No batches to migrate'
      };
    }

    const totalDocuments = snapshot.size;
    console.log(`✓ Found ${totalDocuments} batch documents`);

    // Step 2: Identify documents missing lastDispatchedAt
    console.log('\n🔍 Identifying documents needing update...');
    const documentsToUpdate = [];
    const alreadyHaveField = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.lastDispatchedAt) {
        documentsToUpdate.push({
          id: doc.id,
          data: data
        });
      } else {
        alreadyHaveField.push(doc.id);
      }
    });

    console.log(`✓ Documents to update: ${documentsToUpdate.length}`);
    console.log(`✓ Already have field: ${alreadyHaveField.length}`);

    if (documentsToUpdate.length === 0) {
      console.log('\n✅ All documents already have lastDispatchedAt field!');
      return {
        success: true,
        projectId,
        totalDocuments,
        documentsUpdated: 0,
        message: 'All documents already migrated'
      };
    }

    // Step 3: Update documents in batches (Firestore has write limit)
    console.log(`\n📝 Updating ${documentsToUpdate.length} documents...`);
    const batchSize = 500; // Firestore batch write limit
    let updated = 0;

    for (let i = 0; i < documentsToUpdate.length; i += batchSize) {
      const batch = db.batch();
      const chunk = documentsToUpdate.slice(i, Math.min(i + batchSize, documentsToUpdate.length));

      chunk.forEach((doc) => {
        const ref = batchesRef.doc(doc.id);
        batch.update(ref, {
          lastDispatchedAt: ZERO_TIMESTAMP
        });
        updated++;
      });

      try {
        await batch.commit();
        const percentage = (updated / documentsToUpdate.length * 100).toFixed(1);
        console.log(`  ✓ Batch ${Math.ceil(i / batchSize)} committed (${percentage}%)`);
      } catch (error) {
        console.error(`  ❌ Error committing batch:`, error.message);
        throw error;
      }
    }

    // Step 4: Verify migration
    console.log('\n✅ Verifying migration...');
    const verifySnapshot = await batchesRef.where('lastDispatchedAt', '==', ZERO_TIMESTAMP).get();
    console.log(`✓ Verified: ${verifySnapshot.size} documents have lastDispatchedAt = Timestamp(0)`);

    const result = {
      success: true,
      projectId,
      totalDocuments,
      documentsUpdated: documentsToUpdate.length,
      documentsAlreadyMigrated: alreadyHaveField.length,
      message: `✅ Migration completed successfully! Updated ${documentsToUpdate.length} documents.`
    };

    console.log('\n========== MIGRATION SUMMARY ==========');
    console.log(`✅ Project ID: ${result.projectId}`);
    console.log(`📊 Total documents found: ${result.totalDocuments}`);
    console.log(`✏️  Documents updated: ${result.documentsUpdated}`);
    console.log(`📌 Already had field: ${result.documentsAlreadyMigrated}`);
    console.log(`\n${result.message}`);
    console.log('=========================================\n');

    return result;
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await admin.app().delete();
  }
}

// Run migration
migrateBatchFairnessField().then(() => {
  process.exit(0);
});
