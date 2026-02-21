import {
    FirebaseApp,
    initializeApp,
} from '@firebase/app';
import {
    Auth,
    getAuth,
    signInAnonymously,
} from '@firebase/auth';
import {
    deleteDoc,
    doc,
    Firestore,
    getDoc,
    getFirestore,
    setDoc,
    Timestamp,
    updateDoc
} from '@firebase/firestore';

/**
 * FIRESTORE SECURITY RULES - PRACTICAL TEST CASES
 * 
 * These tests validate that the Firestore security rules are working correctly.
 * Run these in the Firebase Emulator for local testing.
 * 
 * To run in Firebase Console:
 * 1. Start Firebase Emulator: firebase emulators:start
 * 2. Connect tests to emulator
 * 3. Run test suite
 */

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Initialize Firebase (assumes firebaseConfig is set up)
export const initializeFirebase = (firebaseConfig: any) => {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
};

// =====================================================
// TEST 1: CREATE BATCH - Valid Batch Creation ✅
// =====================================================

export const test_createBatch_valid = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    // Sign in as user
    const userAuth = auth;
    await signInAnonymously(userAuth);
    // Note: In real emulator, you'd set custom claims, but for now using anonymous

    const batchData = {
      batchId: batchId,
      userId: userId,                    // ✅ Matches auth.uid
      status: 'running',                 // ✅ Valid status
      action: 'call_now',                // ✅ Valid action
      source: 'clipboard',               // ✅ Valid source
      totalContacts: 45,                 // ✅ Valid count
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);
    console.log('✅ TEST PASSED: Valid batch creation allowed');
    return true;
  } catch (error) {
    console.log('❌ TEST FAILED: Valid batch creation denied', error);
    return false;
  }
};

// =====================================================
// TEST 2: CREATE BATCH - Invalid userId ❌
// =====================================================

export const test_createBatch_invalidUserId = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    const batchData = {
      batchId: batchId,
      userId: 'different-user-id',       // ❌ Does NOT match auth.uid
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 45,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);
    console.log('❌ TEST FAILED: Invalid userId was allowed (security breach!)');
    return false;
  } catch {
    console.log('✅ TEST PASSED: Invalid userId correctly denied');
    return true;
  }
};

// =====================================================
// TEST 3: CREATE BATCH - Invalid Status ❌
// =====================================================

export const test_createBatch_invalidStatus = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    const batchData = {
      batchId: batchId,
      userId: userId,
      status: 'draft',                   // ❌ NOT in ['running', 'scheduled', 'completed']
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 45,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);
    console.log('❌ TEST FAILED: Invalid status was allowed');
    return false;
  } catch {
    console.log('✅ TEST PASSED: Invalid status correctly denied');
    return true;
  }
};

// =====================================================
// TEST 4: CREATE BATCH - Zero Contacts ❌
// =====================================================

export const test_createBatch_zeroContacts = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    const batchData = {
      batchId: batchId,
      userId: userId,
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 0,                  // ❌ Must be > 0
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);
    console.log('❌ TEST FAILED: Zero contacts was allowed');
    return false;
  } catch {
    console.log('✅ TEST PASSED: Zero contacts correctly denied');
    return true;
  }
};

// =====================================================
// TEST 5: CREATE LEADS - Valid Lead (Batch Exists) ✅
// =====================================================

export const test_createLead_validWithBatch = async (
  userId: string,
  batchId: string,
  leadId: string
): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    // PREREQUISITE: Create batch first
    const batchData = {
      batchId: batchId,
      userId: userId,
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 1,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);

    // Now try to create lead
    const leadData = {
      leadId: leadId,
      batchId: batchId,                  // ✅ References existing batch
      userId: userId,                    // ✅ Matches auth.uid
      phone: '+1-555-1234',              // ✅ Valid phone
      name: 'John Doe',
      status: 'queued',                  // ✅ Valid initial status
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'leads', leadId), leadData);
    console.log('✅ TEST PASSED: Valid lead creation with existing batch allowed');
    return true;
  } catch (error) {
    console.log('❌ TEST FAILED: Valid lead creation denied', error);
    return false;
  }
};

// =====================================================
// TEST 6: CREATE LEADS - Batch Does Not Exist ❌
// =====================================================

export const test_createLead_batchNotExists = async (
  userId: string,
  batchId: string,
  leadId: string
): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    // DON'T create batch - directly try to create lead

    const leadData = {
      leadId: leadId,
      batchId: batchId,                  // ❌ This batch doesn't exist
      userId: userId,
      phone: '+1-555-1234',
      name: 'John Doe',
      status: 'queued',
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'leads', leadId), leadData);
    console.log('❌ TEST FAILED: Orphaned lead creation was allowed (security breach!)');
    return false;
  } catch {
    console.log('✅ TEST PASSED: Orphaned lead correctly denied - batch must exist first');
    return true;
  }
};

// =====================================================
// TEST 7: CREATE LEADS - Batch Belongs to Different User ❌
// =====================================================

export const test_createLead_batchDifferentOwner = async (
  user1Id: string,
  user2Id: string,
  batchId: string,
  leadId: string
): Promise<boolean> => {
  try {
    // User 2 creates batch
    let userAuth = auth;
    await signInAnonymously(userAuth);

    const batchData = {
      batchId: batchId,
      userId: user2Id,                   // Owned by user2
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 1,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);

    // Now User 1 tries to create lead in User 2's batch
    userAuth = auth;
    await signInAnonymously(userAuth);

    const leadData = {
      leadId: leadId,
      batchId: batchId,                  // ❌ This batch belongs to user2
      userId: user1Id,
      phone: '+1-555-1234',
      name: 'John Doe',
      status: 'queued',
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'leads', leadId), leadData);
    console.log('❌ TEST FAILED: Lead creation in other user batch was allowed (security breach!)');
    return false;
  } catch {
    console.log('✅ TEST PASSED: Cannot create leads in other users batches');
    return true;
  }
};

// =====================================================
// TEST 8: CREATE LEADS - Missing Phone ❌
// =====================================================

export const test_createLead_missingPhone = async (
  userId: string,
  batchId: string,
  leadId: string
): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    // Create batch first
    const batchData = {
      batchId: batchId,
      userId: userId,
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 1,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);

    // Try to create lead without phone
    const leadData = {
      leadId: leadId,
      batchId: batchId,
      userId: userId,
      phone: null,                       // ❌ Missing phone
      name: 'John Doe',
      status: 'queued',
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'leads', leadId), leadData);
    console.log('❌ TEST FAILED: Lead without phone was allowed');
    return false;
  } catch {
    console.log('✅ TEST PASSED: Lead without phone correctly denied');
    return true;
  }
};

// =====================================================
// TEST 9: READ BATCH - Own Batch ✅
// =====================================================

export const test_readBatch_own = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    // Create batch
    const batchData = {
      batchId: batchId,
      userId: userId,
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 45,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);

    // Try to read own batch
    const docSnap = await getDoc(doc(db, 'batches', batchId));
    if (docSnap.exists()) {
      console.log('✅ TEST PASSED: User can read their own batch');
      return true;
    }
  } catch (_error) {
    console.log('❌ TEST FAILED: Cannot read own batch', _error);
  }
  return false;
};

// =====================================================
// TEST 10: READ BATCH - Other User's Batch ❌
// =====================================================

export const test_readBatch_other = async (
  user1Id: string,
  user2Id: string,
  batchId: string
): Promise<boolean> => {
  try {
    // User 2 creates batch
    let userAuth = auth;
    await signInAnonymously(userAuth);

    const batchData = {
      batchId: batchId,
      userId: user2Id,
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 45,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);

    // User 1 tries to read User 2's batch
    userAuth = auth;
    await signInAnonymously(userAuth);

    const docSnap = await getDoc(doc(db, 'batches', batchId));
    if (!docSnap.exists()) {
      console.log('✅ TEST PASSED: Cannot read other users batches');
      return true;
    }
  } catch {
    console.log('✅ TEST PASSED: Cannot read other users batches');
    return true;
  }
  return false;
};

// =====================================================
// TEST 11: READ LEADS - Own Leads ✅
// =====================================================

export const test_readLead_own = async (userId: string, batchId: string, leadId: string): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    // Create batch and lead
    const batchData = {
      batchId: batchId,
      userId: userId,
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 1,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);

    const leadData = {
      leadId: leadId,
      batchId: batchId,
      userId: userId,
      phone: '+1-555-1234',
      status: 'queued',
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'leads', leadId), leadData);

    // Try to read own lead
    const docSnap = await getDoc(doc(db, 'leads', leadId));
    if (docSnap.exists()) {
      console.log('✅ TEST PASSED: User can read their own leads');
      return true;
    }
  } catch (_error) {
    console.log('❌ TEST FAILED: Cannot read own leads', _error);
  }
  return false;
};

// =====================================================
// TEST 12: UPDATE BATCH - Status Change ✅
// =====================================================

export const test_updateBatch_statusChange = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    // Create batch with status 'running'
    const batchData = {
      batchId: batchId,
      userId: userId,
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 45,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);

    // Try to update status to 'completed'
    await updateDoc(doc(db, 'batches', batchId), {
      status: 'completed',
    });
    console.log('✅ TEST PASSED: User can update batch status');
    return true;
  } catch (_error) {
    console.log('❌ TEST FAILED: Cannot update batch status', _error);
    return false;
  }
};

// =====================================================
// TEST 13: UPDATE BATCH - Change userId ❌
// =====================================================

export const test_updateBatch_changeUserId = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    // Create batch
    const batchData = {
      batchId: batchId,
      userId: userId,
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 45,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);

    // Try to change userId (immutable field)
    await updateDoc(doc(db, 'batches', batchId), {
      userId: 'different-user',
    });
    console.log('❌ TEST FAILED: User can change userId (security breach!)');
    return false;
  } catch {
    console.log('✅ TEST PASSED: userId is immutable - cannot be changed');
    return true;
  }
};

// =====================================================
// TEST 14: DELETE BATCH - Own Batch ✅
// =====================================================

export const test_deleteBatch_own = async (userId: string, batchId: string): Promise<boolean> => {
  try {
    const userAuth = auth;
    await signInAnonymously(userAuth);

    // Create batch
    const batchData = {
      batchId: batchId,
      userId: userId,
      status: 'running',
      action: 'call_now',
      source: 'clipboard',
      totalContacts: 45,
      createdAt: Timestamp.now(),
    };

    await setDoc(doc(db, 'batches', batchId), batchData);

    // Try to delete own batch
    await deleteDoc(doc(db, 'batches', batchId));
    console.log('✅ TEST PASSED: User can delete their own batches');
    return true;
  } catch (_error) {
    console.log('❌ TEST FAILED: Cannot delete own batch', _error);
    return false;
  }
};

// =====================================================
// RUN ALL TESTS
// =====================================================

export const runAllSecurityTests = async (): Promise<{ name: string; passed: boolean }[]> => {
  console.log('\n🔐 FIRESTORE SECURITY RULES - TEST SUITE\n');
  console.log('='.repeat(60));

  const results: { name: string; passed: boolean }[] = [];

  // Test 1: Create Batch - Valid
  console.log('\n[1/14] Testing: CREATE BATCH - Valid');
  results.push({
    name: 'CREATE BATCH - Valid',
    passed: await test_createBatch_valid('user-001', 'batch-001'),
  });

  // Test 2: Create Batch - Invalid UserId
  console.log('\n[2/14] Testing: CREATE BATCH - Invalid UserId');
  results.push({
    name: 'CREATE BATCH - Invalid UserId',
    passed: await test_createBatch_invalidUserId('user-002', 'batch-002'),
  });

  // Test 3: Create Batch - Invalid Status
  console.log('\n[3/14] Testing: CREATE BATCH - Invalid Status');
  results.push({
    name: 'CREATE BATCH - Invalid Status',
    passed: await test_createBatch_invalidStatus('user-003', 'batch-003'),
  });

  // Test 4: Create Batch - Zero Contacts
  console.log('\n[4/14] Testing: CREATE BATCH - Zero Contacts');
  results.push({
    name: 'CREATE BATCH - Zero Contacts',
    passed: await test_createBatch_zeroContacts('user-004', 'batch-004'),
  });

  // Test 5: Create Lead - Valid with Batch
  console.log('\n[5/14] Testing: CREATE LEAD - Valid (Batch Exists)');
  results.push({
    name: 'CREATE LEAD - Valid',
    passed: await test_createLead_validWithBatch('user-005', 'batch-005', 'lead-005'),
  });

  // Test 6: Create Lead - Batch Not Exists
  console.log('\n[6/14] Testing: CREATE LEAD - Batch Not Exists');
  results.push({
    name: 'CREATE LEAD - Batch Not Exists',
    passed: await test_createLead_batchNotExists('user-006', 'batch-006', 'lead-006'),
  });

  // Test 7: Create Lead - Batch Different Owner
  console.log('\n[7/14] Testing: CREATE LEAD - Batch Different Owner');
  results.push({
    name: 'CREATE LEAD - Batch Different Owner',
    passed: await test_createLead_batchDifferentOwner('user-007a', 'user-007b', 'batch-007', 'lead-007'),
  });

  // Test 8: Create Lead - Missing Phone
  console.log('\n[8/14] Testing: CREATE LEAD - Missing Phone');
  results.push({
    name: 'CREATE LEAD - Missing Phone',
    passed: await test_createLead_missingPhone('user-008', 'batch-008', 'lead-008'),
  });

  // Test 9: Read Batch - Own
  console.log('\n[9/14] Testing: READ BATCH - Own Batch');
  results.push({
    name: 'READ BATCH - Own Batch',
    passed: await test_readBatch_own('user-009', 'batch-009'),
  });

  // Test 10: Read Batch - Other
  console.log('\n[10/14] Testing: READ BATCH - Other Users Batch');
  results.push({
    name: 'READ BATCH - Other User',
    passed: await test_readBatch_other('user-010a', 'user-010b', 'batch-010'),
  });

  // Test 11: Read Lead - Own
  console.log('\n[11/14] Testing: READ LEAD - Own Leads');
  results.push({
    name: 'READ LEAD - Own Leads',
    passed: await test_readLead_own('user-011', 'batch-011', 'lead-011'),
  });

  // Test 12: Update Batch - Status
  console.log('\n[12/14] Testing: UPDATE BATCH - Status Change');
  results.push({
    name: 'UPDATE BATCH - Status Change',
    passed: await test_updateBatch_statusChange('user-012', 'batch-012'),
  });

  // Test 13: Update Batch - UserId
  console.log('\n[13/14] Testing: UPDATE BATCH - Change UserId');
  results.push({
    name: 'UPDATE BATCH - Change UserId',
    passed: await test_updateBatch_changeUserId('user-013', 'batch-013'),
  });

  // Test 14: Delete Batch - Own
  console.log('\n[14/14] Testing: DELETE BATCH - Own Batch');
  results.push({
    name: 'DELETE BATCH - Own Batch',
    passed: await test_deleteBatch_own('user-014', 'batch-014'),
  });

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 TEST RESULTS SUMMARY\n');

  const passed = results.filter(r => r.passed).length;
  const total = results.length;

  results.forEach((result, index) => {
    const icon = result.passed ? '✅' : '❌';
    console.log(`${icon} [${index + 1}/${total}] ${result.name}`);
  });

  console.log(`\n📈 OVERALL: ${passed}/${total} tests passed (${Math.round((passed / total) * 100)}%)`);

  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED - SECURITY RULES ARE WORKING CORRECTLY!\n');
  } else {
    console.log(`\n⚠️  ${total - passed} test(s) failed - Review security rules\n`);
  }

  return results;
};
