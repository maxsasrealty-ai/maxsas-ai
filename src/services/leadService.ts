import { getAuth } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    Timestamp,
    where,
    writeBatch,
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/firebase';
import { AiDisposition, BatchStats, CallStatus, ExtractedContact, Lead, LeadStatus } from '../types/batch';

type LegacyLeadStatus = 'new' | 'closed';
type LeadStatusInput = LeadStatus | LegacyLeadStatus;

const normalizeLeadStatus = (status: LeadStatusInput): LeadStatus => {
  if (status === 'new') return 'queued';
  if (status === 'closed') return 'completed';
  return status;
};

/**
 * Creates multiple lead documents for a batch
 * Each phone number becomes a separate lead document
 * 
 * @param batchId - The batch this batch belongs to
 * @param contacts - Array of extracted contacts (phone numbers)
 * @returns Array of created lead IDs
 */
export async function createLeadsForBatch(
  batchId: string,
  contacts: ExtractedContact[]
): Promise<string[]> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  console.log('🔐 Lead creation - User ID:', userId);
  console.log('📱 Creating leads for batch:', batchId);
  console.log('👥 Number of contacts:', contacts?.length);

  if (!userId) {
    throw new Error('User not authenticated for lead creation');
  }

  if (!batchId) {
    throw new Error('batchId is required for lead creation');
  }

  if (!contacts || contacts.length === 0) {
    throw new Error('No contacts provided for batch');
  }

  try {
    const wb = writeBatch(db);
    const leadIds: string[] = [];

    console.log('📱 Creating', contacts.length, 'lead documents for batch:', batchId);

    // Create individual lead documents for each contact
    contacts.forEach((contact, index) => {
      const leadId = uuidv4();
      const leadRef = doc(collection(db, 'leads'), leadId);

      const leadData: Lead = {
        leadId,
        batchId,
        userId,
        phone: contact.phone,
        status: 'queued',
        createdAt: Timestamp.now(),
        lastActionAt: null,
        attempts: 0,
        maxAttempts: 3, // PHASE 3: Default max attempts
        callStatus: 'pending',
        lastAttemptAt: null,
        retryCount: 0,
        nextRetryAt: null,
        aiDisposition: 'unknown',
        callDuration: null,
        // PHASE 3: Lock and billing fields
        lockOwner: null,
        lockExpiresAt: null,
        callStartedAt: null,
        callEndedAt: null,
        billingStatus: null,
        providerCallId: null,
        notes: null,
      };

      if (index === 0) {
        console.log('📌 Sample lead data:', leadData);
      }

      console.log(`📌 Lead ${index + 1}/${contacts.length}:`, leadData.phone);

      wb.set(leadRef, leadData);
      leadIds.push(leadId);
    });

    console.log('💾 Committing', leadIds.length, 'lead documents to Firestore...');
    await wb.commit();
    console.log('✅ All', leadIds.length, 'leads created successfully!');

    return leadIds;
  } catch (error) {
    console.error('❌ Error creating leads:', error);
    console.error('Error details:', { 
      batchId, 
      contactsCount: contacts.length,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Gets all leads for a specific batch
 * 
 * @param batchId - The batch ID to fetch leads for
 * @returns Array of leads
 */
export async function getLeadsForBatch(batchId: string): Promise<Lead[]> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!batchId) {
    throw new Error('batchId is required');
  }

  try {
    const q = query(
      collection(db, 'leads'),
      where('batchId', '==', batchId)
    );
    const snapshot = await getDocs(q);

    const leads: Lead[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        leadId: data.leadId,
        batchId: data.batchId,
        phone: data.phone,
        userId: data.userId,
        status: normalizeLeadStatus(data.status as LeadStatusInput),
        createdAt: data.createdAt,
        lastActionAt: data.lastActionAt || null,
        attempts: data.attempts || 0,
        maxAttempts: data.maxAttempts ?? 3, // PHASE 3: Default 3 for backward compatibility
        callStatus: data.callStatus || 'pending',
        lastAttemptAt: data.lastAttemptAt || null,
        retryCount: data.retryCount || 0,
        nextRetryAt: data.nextRetryAt || null,
        aiDisposition: data.aiDisposition || 'unknown',
        callDuration: data.callDuration || null,
        // PHASE 3: Lock and billing fields with backward-safe nulls
        lockOwner: data.lockOwner || null,
        lockExpiresAt: data.lockExpiresAt || null,
        callStartedAt: data.callStartedAt || null,
        callEndedAt: data.callEndedAt || null,
        billingStatus: data.billingStatus || null,
        providerCallId: data.providerCallId || null,
        notes: data.notes || null,
      } as Lead;
    });

    console.log('📞 Fetched', leads.length, 'leads for batch:', batchId);
    return leads;
  } catch (error) {
    console.error('Error getting leads for batch:', error);
    throw error;
  }
}

/**
 * Gets all leads for the current user
 * 
 * @returns Array of all user's leads
 */
export async function getLeadsForUser(): Promise<Lead[]> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const q = query(collection(db, 'leads'));
    const snapshot = await getDocs(q);

    const leads: Lead[] = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return {
          leadId: data.leadId,
          batchId: data.batchId,
          phone: data.phone,
          userId: data.userId,
          status: normalizeLeadStatus(data.status as LeadStatusInput),
          createdAt: data.createdAt,
          lastActionAt: data.lastActionAt || null,
          attempts: data.attempts || 0,
          maxAttempts: data.maxAttempts ?? 3, // PHASE 3: Default 3 for backward compatibility
          callStatus: data.callStatus || 'pending',
          lastAttemptAt: data.lastAttemptAt || null,
          retryCount: data.retryCount || 0,
          nextRetryAt: data.nextRetryAt || null,
          aiDisposition: data.aiDisposition || 'unknown',
          callDuration: data.callDuration || null,
          // PHASE 3: Lock and billing fields with backward-safe nulls
          lockOwner: data.lockOwner || null,
          lockExpiresAt: data.lockExpiresAt || null,
          callStartedAt: data.callStartedAt || null,
          callEndedAt: data.callEndedAt || null,
          billingStatus: data.billingStatus || null,
          providerCallId: data.providerCallId || null,
          notes: data.notes || null,
        } as Lead;
      })
      .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

    console.log('📞 Fetched', leads.length, 'total leads for user');
    return leads;
  } catch (error) {
    console.error('Error getting leads for user:', error);
    throw error;
  }
}

/**
 * REAL-TIME USER LEADS LISTENER
 * Subscribes to all leads for a user with live updates
 *
 * @param userId - The user ID to listen for
 * @param callback - Function called with leads array on each update
 * @param onError - Optional error handler
 * @returns Unsubscribe function
 */
export function subscribeToLeadsForUser(
  userId: string,
  callback: (leads: Lead[]) => void,
  onError?: (error: Error) => void
): () => void {
  if (!userId) {
    const error = new Error('User not authenticated');
    if (onError) {
      onError(error);
    } else {
      throw error;
    }
    return () => {};
  }

  const q = query(
    collection(db, 'leads'),
    where('userId', '==', userId)
  );

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const leads: Lead[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          leadId: data.leadId,
          batchId: data.batchId,
          phone: data.phone,
          userId: data.userId,
          status: normalizeLeadStatus(data.status as LeadStatusInput),
          createdAt: data.createdAt,
          lastActionAt: data.lastActionAt || null,
          attempts: data.attempts || 0,
          maxAttempts: data.maxAttempts ?? 3, // PHASE 3: Default 3 for backward compatibility
          callStatus: data.callStatus || 'pending',
          lastAttemptAt: data.lastAttemptAt || null,
          retryCount: data.retryCount || 0,
          nextRetryAt: data.nextRetryAt || null,
          aiDisposition: data.aiDisposition || 'unknown',
          callDuration: data.callDuration || null,
          // PHASE 3: Lock and billing fields with backward-safe nulls
          lockOwner: data.lockOwner || null,
          lockExpiresAt: data.lockExpiresAt || null,
          callStartedAt: data.callStartedAt || null,
          callEndedAt: data.callEndedAt || null,
          billingStatus: data.billingStatus || null,
          providerCallId: data.providerCallId || null,
          notes: data.notes || null,
        } as Lead;
      });

      callback(leads);
    },
    (error) => {
      if (onError) {
        onError(error as Error);
      }
    }
  );

  return unsubscribe;
}

/**
 * Updates a lead's status
 * 
 * @param leadId - The lead ID to update
 * @param status - New status
 */
export async function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  note?: string,
  aiDisposition?: AiDisposition,
  callStatus?: CallStatus
): Promise<void> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!leadId) {
    throw new Error('leadId is required');
  }

  try {
    const leadRef = doc(db, 'leads', leadId);
    const normalizedStatus = normalizeLeadStatus(status);
    const updatePayload: Record<string, unknown> = {
      status: normalizedStatus,
      lastActionAt: Timestamp.now(),
      attempts: increment(1),
    };

    if (note) {
      updatePayload.notes = note;
    }

    if (aiDisposition) {
      updatePayload.aiDisposition = aiDisposition;
    }

    if (callStatus) {
      updatePayload.callStatus = callStatus;
    }

    await setDoc(
      leadRef,
      updatePayload,
      { merge: true }
    );

    console.log('✅ Updated lead', leadId, 'status to:', normalizedStatus);
  } catch (error) {
    console.error('Error updating lead status:', error);
    throw error;
  }
}

/**
 * Increments attempts counter for a lead
 * Helper function for Firestore increment operations
 */
function increment(value: number) {
  return value;
}

/**
 * Calculates the next retry timestamp (current time + 1 hour)
 * 
 * @returns Timestamp 60 minutes from now
 */
function calculateNextRetryAt(): Timestamp {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000); // Add 1 hour in milliseconds
  return Timestamp.fromDate(oneHourLater);
}

/**
 * Updates retry schedule for a failed call
 * Implements automatic retry logic:
 * - Max 3 attempts per lead
 * - 60-minute gap between retries
 * - After 3 failures -> status = completed
 * 
 * @param leadId - The lead ID to update retry schedule for
 */
export async function updateRetrySchedule(leadId: string): Promise<void> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!leadId) {
    throw new Error('leadId is required');
  }

  try {
    const leadRef = doc(db, 'leads', leadId);
    const leadSnap = await getDoc(leadRef);

    if (!leadSnap.exists()) {
      throw new Error(`Lead ${leadId} not found`);
    }

    const leadData = leadSnap.data() as Lead;
    const currentCallStatus = leadData.callStatus as CallStatus;
    const currentRetryCount = leadData.retryCount || 0;

    console.log('🔄 Retry evaluation for lead:', leadId);
    console.log('  - Current callStatus:', currentCallStatus);
    console.log('  - Current retryCount:', currentRetryCount);

    // Check if call failed and retry is possible
    const failedStatuses: CallStatus[] = ['failed', 'busy', 'unreachable'];
    const shouldRetry = failedStatuses.includes(currentCallStatus) && currentRetryCount < 3;

    if (shouldRetry) {
      // Schedule retry
      const newRetryCount = currentRetryCount + 1;
      const nextRetry = calculateNextRetryAt();

      await setDoc(
        leadRef,
        {
          retryCount: newRetryCount,
          nextRetryAt: nextRetry,
          status: 'queued', // Queue for retry
          lastActionAt: Timestamp.now(),
        },
        { merge: true }
      );

      console.log(`✅ Retry scheduled for lead ${leadId}:`);
      console.log(`  - Retry ${newRetryCount}/3`);
      console.log(`  - Next retry at:`, nextRetry.toDate());
      console.log(`  - Status set to: queued`);
    } else {
      // Max retries reached or not a retry-eligible status
      await setDoc(
        leadRef,
        {
          status: 'completed',
          lastActionAt: Timestamp.now(),
          nextRetryAt: null, // Clear retry schedule
        },
        { merge: true }
      );

      console.log(`🛑 Lead ${leadId} marked as completed:`);
      console.log(`  - Retry count: ${currentRetryCount}`);
      console.log(`  - Final callStatus: ${currentCallStatus}`);
    }
  } catch (error) {
    console.error('Error updating retry schedule:', error);
    throw error;
  }
}

/**
 * Gets lead count statistics for a batch
 * 
 * @param batchId - The batch ID
 * @returns Object with count statistics
 */
export async function getLeadCountStats(batchId: string): Promise<{
  total: number;
  queued: number;
  calling: number;
  answered: number;
  interested: number;
  not_interested: number;
  follow_up: number;
  completed: number;
}> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  try {
    const leads = await getLeadsForBatch(batchId);

    const stats = {
      total: leads.length,
      queued: leads.filter((l) => l.status === 'queued').length,
      calling: leads.filter((l) => l.status === 'calling').length,
      answered: leads.filter((l) => l.callStatus === 'answered').length,
      interested: leads.filter((l) => l.aiDisposition === 'interested').length,
      not_interested: leads.filter((l) => l.aiDisposition === 'not_interested').length,
      follow_up: leads.filter((l) => l.aiDisposition === 'follow_up').length,
      completed: leads.filter((l) => l.status === 'completed').length,
    };

    return stats;
  } catch (error) {
    console.error('Error getting lead count stats:', error);
    throw error;
  }
}

/**
 * Gets comprehensive batch statistics with success rate
 * Includes real-time calling progress metrics
 * 
 * @param batchId - The batch ID
 * @returns BatchStats object with all metrics and success rate
 */
export async function getBatchStats(batchId: string): Promise<BatchStats> {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!batchId) {
    throw new Error('batchId is required');
  }

  try {
    const leads = await getLeadsForBatch(batchId);

    const total = leads.length;
    const queued = leads.filter((l) => l.status === 'queued').length;
    const calling = leads.filter((l) => l.status === 'calling').length;
    const answered = leads.filter((l) => l.callStatus === 'answered').length;
    const interested = leads.filter((l) => l.aiDisposition === 'interested').length;
    const not_interested = leads.filter((l) => l.aiDisposition === 'not_interested').length;
    
    // Count failed based on callStatus
    const failed = leads.filter((l) => 
      ['failed', 'busy', 'unreachable'].includes(l.callStatus) && l.status === 'completed'
    ).length;

    // Calculate success rate: (interested / answered) * 100
    // If no calls answered, success rate is 0
    const successRate = answered > 0 ? Math.round((interested / answered) * 100) : 0;

    const stats: BatchStats = {
      total,
      queued,
      calling,
      answered,
      interested,
      not_interested,
      failed,
      successRate,
    };

    console.log('📊 Batch stats for', batchId, ':', stats);
    return stats;
  } catch (error) {
    console.error('Error getting batch stats:', error);
    throw error;
  }
}

/**
 * Subscribes to real-time batch statistics updates
 * Uses Firestore onSnapshot for live dashboard updates
 * 
 * @param batchId - The batch ID to monitor
 * @param callback - Function called with updated stats
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToBatchStats(
  batchId: string,
  callback: (stats: BatchStats) => void
): () => void {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  if (!batchId) {
    throw new Error('batchId is required');
  }

  console.log('👀 Setting up real-time listener for batch:', batchId);

  const q = query(
    collection(db, 'leads'),
    where('batchId', '==', batchId)
  );

  // Set up real-time listener
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const leads: Lead[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          leadId: data.leadId,
          batchId: data.batchId,
          phone: data.phone,
          userId: data.userId,
          status: normalizeLeadStatus(data.status as LeadStatusInput),
          createdAt: data.createdAt,
          lastActionAt: data.lastActionAt || null,
          attempts: data.attempts || 0,
          callStatus: data.callStatus || 'pending',
          lastAttemptAt: data.lastAttemptAt || null,
          retryCount: data.retryCount || 0,
          nextRetryAt: data.nextRetryAt || null,
          aiDisposition: data.aiDisposition || 'unknown',
          callDuration: data.callDuration || null,
          providerCallId: data.providerCallId || null,
          notes: data.notes || null,
        } as Lead;
      });

      // Calculate stats from real-time data
      const total = leads.length;
      const queued = leads.filter((l) => l.status === 'queued').length;
      const calling = leads.filter((l) => l.status === 'calling').length;
      const answered = leads.filter((l) => l.callStatus === 'answered').length;
      const interested = leads.filter((l) => l.aiDisposition === 'interested').length;
      const not_interested = leads.filter((l) => l.aiDisposition === 'not_interested').length;
      
      const failed = leads.filter((l) => 
        ['failed', 'busy', 'unreachable'].includes(l.callStatus) && l.status === 'completed'
      ).length;

      const successRate = answered > 0 ? Math.round((interested / answered) * 100) : 0;

      const stats: BatchStats = {
        total,
        queued,
        calling,
        answered,
        interested,
        not_interested,
        failed,
        successRate,
      };

      console.log('🔄 Real-time stats update:', stats);
      callback(stats);
    },
    (error) => {
      console.error('❌ Error in batch stats listener:', error);
    }
  );

  return unsubscribe;
}

/**
 * REAL-TIME LEAD LISTENER
 * Subscribes to all leads in a batch with live updates
 * Automatically updates UI when any lead's callStatus, attempts, or aiDisposition changes
 * 
 * @param batchId - The batch ID to listen for
 * @param callback - Function called with leads array on each update
 * @returns Unsubscribe function
 */
export function subscribeToBatchLeads(
  batchId: string,
  callback: (leads: Lead[]) => void
): () => void {
  if (!batchId) {
    throw new Error('batchId is required');
  }

  console.log('👀 Setting up real-time listener for batch leads:', batchId);

  const q = query(
    collection(db, 'leads'),
    where('batchId', '==', batchId)
  );

  // Set up real-time listener
  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const leads: Lead[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          leadId: data.leadId,
          batchId: data.batchId,
          phone: data.phone,
          userId: data.userId,
          status: normalizeLeadStatus(data.status as LeadStatusInput),
          createdAt: data.createdAt,
          lastActionAt: data.lastActionAt || null,
          attempts: data.attempts || 0,
          callStatus: data.callStatus || 'pending',
          lastAttemptAt: data.lastAttemptAt || null,
          retryCount: data.retryCount || 0,
          nextRetryAt: data.nextRetryAt || null,
          aiDisposition: data.aiDisposition || 'unknown',
          callDuration: data.callDuration || null,
          providerCallId: data.providerCallId || null,
          notes: data.notes || null,
        } as Lead;
      });

      console.log('🔄 Real-time leads update:', {
        batchId,
        totalLeads: leads.length,
        completed: leads.filter((l) => l.status === 'completed').length,
        pending: leads.filter((l) => l.status === 'queued').length,
      });

      callback(leads);
    },
    (error) => {
      console.error('❌ Error in batch leads listener:', error);
    }
  );

  return unsubscribe;
}
