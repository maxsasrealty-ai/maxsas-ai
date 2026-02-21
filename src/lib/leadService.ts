/**
 * Enhanced Lead Service
 * Manages lead lifecycle with standardized schema
 * Integrates history tracking and automation readiness
 */

import {
    addDoc,
    arrayUnion,
    collection,
    doc,
    getDocs,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from 'firebase/firestore';
import { db, getCurrentUserId } from './firebase';
import {
    createLeadSchema,
    HistoryEntry,
    IntakeStatus,
    Lead,
    LeadStatusInput,
    normalizeLeadStatus,
} from './leadSchema';

/**
 * PHASE 1: Enhanced addLead with schema enforcement
 * @deprecated Direct lead creation is deprecated. All leads must be created through batches.
 */
export const addLeadWithSchema = async (
  phone: string,
  source: 'manual' | 'csv' | 'clipboard' | 'image',
  additionalData?: Partial<Lead>
) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Create lead with standardized schema
    const leadData = createLeadSchema(phone, source, additionalData);

    // Add user and timestamp
    const dataToSave = {
      ...leadData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Save directly to Firestore leads collection
    const docRef = await addDoc(collection(db, 'leads'), dataToSave);
    console.log('✅ Lead created with schema:', docRef.id);
    return docRef;
  } catch (error) {
    console.error('❌ Error adding lead with schema:', error);
    throw error;
  }
};

/**
 * PHASE 3: Update lead status (for follow-ups and user actions)
 */
export const updateLeadStatus = async (
  leadId: string,
  status: LeadStatusInput,
  notes?: string,
  aiDisposition?: 'interested' | 'not_interested' | 'follow_up' | 'unknown',
  callStatus?: 'pending' | 'in_progress' | 'answered' | 'failed' | 'busy' | 'unreachable'
) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const normalizedStatus = normalizeLeadStatus(status);

    const leadRef = doc(db, 'leads', leadId);

    // Add history entry
    const historyEntry: HistoryEntry = {
      action: `status_changed_to_${normalizedStatus}`,
      details: notes || `Lead status changed to ${normalizedStatus}`,
      timestamp: serverTimestamp(),
      updatedBy: userId,
    };

    const updatePayload: Record<string, unknown> = {
      status: normalizedStatus,
      updatedAt: serverTimestamp(),
      lastActionAt: serverTimestamp(),
      notes: notes ? notes : '',
      history: arrayUnion(historyEntry),
    };

    if (aiDisposition) {
      updatePayload.aiDisposition = aiDisposition;
    }

    if (callStatus) {
      updatePayload.callStatus = callStatus;
    }

    await updateDoc(leadRef, updatePayload);

    console.log('✅ Lead status updated:', leadId, status);
  } catch (error) {
    console.error('❌ Error updating lead status:', error);
    throw error;
  }
};

/**
 * PHASE 3: Schedule a follow-up
 */
export const scheduleFollowUp = async (
  leadId: string,
  scheduleDate: Date,
  followUpNotes: string
) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const leadRef = doc(db, 'leads', leadId);

    // Add history entry
    const historyEntry: HistoryEntry = {
      action: 'follow_up_scheduled',
      details: `Follow-up scheduled for ${scheduleDate.toLocaleString()}`,
      timestamp: serverTimestamp(),
      updatedBy: userId,
    };

    await updateDoc(leadRef, {
      scheduleAt: Timestamp.fromDate(scheduleDate),
      followUpRequired: true,
      followUpNotes,
      updatedAt: serverTimestamp(),
      history: arrayUnion(historyEntry),
    });

    console.log('✅ Follow-up scheduled:', leadId);
  } catch (error) {
    console.error('❌ Error scheduling follow-up:', error);
    throw error;
  }
};

/**
 * PHASE 4: Add custom history entry
 */
export const addHistoryEntry = async (leadId: string, action: string, details?: string) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const leadRef = doc(db, 'leads', leadId);

    const historyEntry: HistoryEntry = {
      action,
      details: details || '',
      timestamp: serverTimestamp(),
      updatedBy: userId,
    };

    await updateDoc(leadRef, {
      history: arrayUnion(historyEntry),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ History entry added:', leadId);
  } catch (error) {
    console.error('❌ Error adding history entry:', error);
    throw error;
  }
};

/**
 * PHASE 2: Get dashboard statistics
 */
export const getDashboardStats = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const leadsRef = collection(db, 'leads');

    // Fetch all leads for user
    const allLeadsQuery = query(leadsRef, where('userId', '==', userId));
    const allLeadsSnapshot = await getDocs(allLeadsQuery);
    const allLeads = allLeadsSnapshot.docs.map((doc) => {
      const data = doc.data() as Lead;
      return {
        id: doc.id,
        ...data,
        status: normalizeLeadStatus(data.status as LeadStatusInput),
      };
    }) as Lead[];

    // Calculate statistics
    const stats = {
      totalLeads: allLeads.length,
      queuedLeads: allLeads.filter((lead) => lead.status === 'queued').length,
      callingLeads: allLeads.filter((lead) => lead.status === 'calling').length,
      answeredLeads: allLeads.filter((lead) => lead.callStatus === 'answered').length,
      interestedLeads: allLeads.filter((lead) => lead.aiDisposition === 'interested').length,
      notInterestedLeads: allLeads.filter((lead) => lead.aiDisposition === 'not_interested').length,
      followUpLeads: allLeads.filter((lead) => lead.aiDisposition === 'follow_up').length,
      completedLeads: allLeads.filter((lead) => lead.status === 'completed').length,
      pendingAutomation: allLeads.filter(lead => lead.intakeStatus === 'pending').length,
      scheduledLeads: allLeads.filter(lead => lead.scheduleAt !== null && lead.scheduleAt !== undefined).length,
      followUpsDueToday: allLeads.filter(lead => {
        if (!lead.scheduleAt) return false;
        const leadDate = new Date(lead.scheduleAt.seconds * 1000);
        const today = new Date();
        return (
          leadDate.getDate() === today.getDate() &&
          leadDate.getMonth() === today.getMonth() &&
          leadDate.getFullYear() === today.getFullYear()
        );
      }).length,
    };

    console.log('📊 Dashboard stats:', stats);
    return stats;
  } catch (error) {
    console.error('❌ Error getting dashboard stats:', error);
    throw error;
  }
};

/**
 * PHASE 3: Get scheduled follow-ups
 */
export const getScheduledFollowUps = async () => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const leadsRef = collection(db, 'leads');
    const scheduledQuery = query(
      leadsRef,
      where('userId', '==', userId),
      where('followUpRequired', '==', true)
    );

    const snapshot = await getDocs(scheduledQuery);
    const followUps = snapshot.docs
      .map((doc) => {
        const data = doc.data() as Lead;
        return {
          id: doc.id,
          ...data,
          status: normalizeLeadStatus(data.status as LeadStatusInput),
        };
      })
      .filter(lead => lead.scheduleAt) // Only leads with schedule date
      .sort((a, b) => {
        const aTime = a.scheduleAt?.seconds || 0;
        const bTime = b.scheduleAt?.seconds || 0;
        return aTime - bTime;
      }) as (Lead & { id: string })[];

    console.log('📅 Scheduled follow-ups:', followUps.length);
    return followUps;
  } catch (error) {
    console.error('❌ Error getting scheduled follow-ups:', error);
    throw error;
  }
};

/**
 * PHASE 2: Update intake status (for automation readiness)
 */
export const updateIntakeStatus = async (
  leadId: string,
  intakeStatus: IntakeStatus,
  intakeAction?: string
) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const leadRef = doc(db, 'leads', leadId);

    const historyEntry: HistoryEntry = {
      action: `intake_status_${intakeStatus}`,
      details: `Intake status updated to ${intakeStatus}`,
      timestamp: serverTimestamp(),
      updatedBy: userId,
    };

    await updateDoc(leadRef, {
      intakeStatus,
      intakeAction: intakeAction || 'none',
      updatedAt: serverTimestamp(),
      history: arrayUnion(historyEntry),
    });

    console.log('✅ Intake status updated:', leadId, intakeStatus);
  } catch (error) {
    console.error('❌ Error updating intake status:', error);
    throw error;
  }
};

/**
 * Trigger automation for a lead (called when n8n should process)
 */
export const triggerAutomation = async (leadId: string) => {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const leadRef = doc(db, 'leads', leadId);

    const historyEntry: HistoryEntry = {
      action: 'automation_triggered',
      details: 'Automation workflow initiated',
      timestamp: serverTimestamp(),
      updatedBy: userId,
    };

    await updateDoc(leadRef, {
      automationTriggered: true,
      intakeStatus: 'in_progress',
      updatedAt: serverTimestamp(),
      history: arrayUnion(historyEntry),
    });

    console.log('🚀 Automation triggered:', leadId);
  } catch (error) {
    console.error('❌ Error triggering automation:', error);
    throw error;
  }
};
