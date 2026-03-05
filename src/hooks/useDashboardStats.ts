/**
 * Dashboard Statistics Hook
 * Real-time statistics for Home Screen using Firestore listeners
 * 
 * Listens to:
 * - batches collection (for batch-level stats)
 * - leads collection (for lead-level stats)
 * 
 * Updates instantly when Firestore data changes
 */

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
    collection,
    onSnapshot,
    query,
    where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { Batch, Lead } from '../types/batch';

type DashboardLeadStatus = 'queued' | 'calling' | 'completed' | 'failed' | 'unknown';

const normalizeDashboardStatus = (rawStatus: unknown): DashboardLeadStatus => {
  if (typeof rawStatus !== 'string') {
    return 'unknown';
  }

  const normalized = rawStatus.toLowerCase();

  if (normalized === 'new') return 'queued';
  if (normalized === 'closed') return 'completed';

  if (normalized === 'queued') return 'queued';
  if (normalized === 'pending') return 'queued';
  if (normalized === 'calling') return 'calling';
  if (normalized === 'in_progress') return 'calling';
  if (normalized === 'completed') return 'completed';
  if (normalized === 'failed') return 'failed';
  if (normalized === 'failed_retryable') return 'failed';
  if (normalized === 'failed_permanent') return 'failed';

  return 'unknown';
};

export interface DashboardStats {
  // Batch Statistics
  totalBatches: number;
  runningBatches: number;
  scheduledBatches: number;
  completedBatches: number;
  
  // Lead Statistics
  totalLeads: number;
  pendingLeads: number; // queued
  completedLeads: number;
  failedLeads: number;
  
  // Aggregated Counts
  totalRunningCalls: number; // In-progress leads (calling)
  totalCompletedCalls: number; // Sum of completedCount from all batches

  // Value signals
  qualifiedLeadsToday: number;
  qualifiedLeadsTodayFromCompletedBatches: number;
  completedBatchesToday: number;
  qualifiedLeadsFromCompletedBatches: number;
  
  // Loading state
  loading: boolean;
  error: string | null;
}

/**
 * Hook for real-time dashboard statistics
 * Uses Firestore onSnapshot for live updates
 */
export function useDashboardStats(): DashboardStats {
  const [userId, setUserId] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalBatches: 0,
    runningBatches: 0,
    scheduledBatches: 0,
    completedBatches: 0,
    totalLeads: 0,
    pendingLeads: 0,
    completedLeads: 0,
    failedLeads: 0,
    totalRunningCalls: 0,
    totalCompletedCalls: 0,
    qualifiedLeadsToday: 0,
    qualifiedLeadsTodayFromCompletedBatches: 0,
    completedBatchesToday: 0,
    qualifiedLeadsFromCompletedBatches: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const auth = getAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid ?? null);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!userId) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: 'User not authenticated',
      }));
      return;
    }

    setStats(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    console.log('📊 [Dashboard] Home dashboard loaded');
    console.log('📡 [Dashboard] Setting up real-time stats listeners');

    let batchData: Batch[] = [];
    let leadData: Lead[] = [];
    let batchesLoaded = false;
    let leadsLoaded = false;

    const QUALIFIED_DISPOSITIONS = new Set(['interested', 'callback_requested', 'meeting_scheduled']);

    const toDate = (value: unknown): Date | null => {
      if (!value) return null;

      if (value instanceof Date) return value;

      if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate();
      }

      if (typeof value === 'string' || typeof value === 'number') {
        const date = new Date(value);
        if (!Number.isNaN(date.getTime())) {
          return date;
        }
      }

      return null;
    };

    const isToday = (value: unknown): boolean => {
      const date = toDate(value);
      if (!date) return false;

      const now = new Date();
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    };

    // Helper to calculate and update stats
    const updateStats = () => {
      if (!batchesLoaded || !leadsLoaded) {
        return; // Wait for both to load
      }

      console.log('🔄 [Dashboard] Recalculating counters');
      console.log('  - Batches:', batchData.length);
      console.log('  - Leads:', leadData.length);

      // Batch Statistics
      const totalBatches = batchData.length;
      const runningBatches = batchData.filter(b => b.status === 'running').length;
      const scheduledBatches = batchData.filter(b => b.status === 'scheduled').length;
      const completedBatches = batchData.filter(b => b.status === 'completed').length;
      const completedBatchesToday = batchData.filter(
        (b) => b.status === 'completed' && isToday(b.completedAt || b.updatedAt)
      ).length;

      const completedBatchIds = new Set(
        batchData
          .filter((b) => b.status === 'completed')
          .map((b) => b.batchId)
      );

      // Aggregated counts from batch metadata
      const totalCompletedCalls = batchData
        .reduce((sum, b) => sum + (b.completedCount || 0), 0);

      // Lead Statistics (derived from lead status)
      const totalLeads = leadData.length;

      const leadStatusCounts = leadData.reduce(
        (acc, lead) => {
          const status = normalizeDashboardStatus(lead.status);
          const callStatus = String(lead.callStatus || '').toLowerCase();
          const isFailed = status === 'failed' || ['failed', 'busy', 'unreachable'].includes(callStatus);

          if (status === 'queued') acc.pending += 1;
          if (status === 'calling' || callStatus === 'in_progress') acc.inProgress += 1;
          if (status === 'completed') acc.completed += 1;
          if (isFailed) acc.failed += 1;

          return acc;
        },
        { pending: 0, inProgress: 0, completed: 0, failed: 0 }
      );

      // Pending = queued (not yet calling)
      const pendingLeads = leadStatusCounts.pending;

      // In progress = calling
      const inProgressLeads = leadStatusCounts.inProgress;

      // Completed leads
      const completedLeads = leadStatusCounts.completed;

      // Failed leads
      const failedLeads = leadStatusCounts.failed;

      const qualifiedLeads = leadData.filter((lead) =>
        QUALIFIED_DISPOSITIONS.has(String(lead.aiDisposition || '').toLowerCase())
      );

      const qualifiedLeadsToday = qualifiedLeads.filter((lead) =>
        isToday(lead.lastActionAt || lead.lastAttemptAt || lead.createdAt)
      ).length;

      const qualifiedLeadsFromCompletedBatches = qualifiedLeads.filter((lead) =>
        completedBatchIds.has(lead.batchId)
      ).length;

      const qualifiedLeadsTodayFromCompletedBatches = qualifiedLeads.filter((lead) =>
        completedBatchIds.has(lead.batchId) &&
        isToday(lead.lastActionAt || lead.lastAttemptAt || lead.createdAt)
      ).length;

      const newStats: DashboardStats = {
        totalBatches,
        runningBatches,
        scheduledBatches,
        completedBatches,
        totalLeads,
        pendingLeads,
        completedLeads,
        failedLeads,
        totalRunningCalls: inProgressLeads,
        totalCompletedCalls,
        qualifiedLeadsToday,
        qualifiedLeadsTodayFromCompletedBatches,
        completedBatchesToday,
        qualifiedLeadsFromCompletedBatches,
        loading: false,
        error: null,
      };

      console.log('✅ [Dashboard] Counters updated:', newStats);
      setStats(newStats);
    };

    // Listener 1: Batches Collection
    const batchesQuery = query(
      collection(db, 'batches'),
      where('userId', '==', userId)
    );

    const unsubscribeBatches = onSnapshot(
      batchesQuery,
      (snapshot) => {
        console.log('🔥 [Dashboard] Batches snapshot update:', snapshot.docs.length, 'batches');
        
        batchData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            batchId: data.batchId,
            userId: data.userId,
            status: data.status,
            processingLock: data.processingLock ?? false,
            lockOwner: data.lockOwner ?? null,
            lockExpiresAt: data.lockExpiresAt || null,
            priority: data.priority ?? 1,
            lastDispatchedAt: data.lastDispatchedAt || data.updatedAt || data.createdAt,
            action: data.action,
            source: data.source,
            totalContacts: data.totalContacts,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt || data.createdAt,
            startedAt: data.startedAt || null,
            scheduleAt: data.scheduleAt || null,
            completedAt: data.completedAt || null,
            completedCount: data.completedCount || 0,
            failedCount: data.failedCount || 0,
            runningCount: data.runningCount || 0,
            contacts: [],
          } as Batch;
        });

        batchesLoaded = true;
        updateStats();
      },
      (error) => {
        console.error('❌ Error in batches listener:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    );

    // Listener 2: Leads Collection
    const leadsQuery = query(
      collection(db, 'leads'),
      where('userId', '==', userId)
    );

    const unsubscribeLeads = onSnapshot(
      leadsQuery,
      (snapshot) => {
        console.log('📞 [Dashboard] Leads snapshot update:', snapshot.docs.length, 'leads');
        
        leadData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            leadId: data.leadId,
            batchId: data.batchId,
            phone: data.phone,
            userId: data.userId,
            status: data.status,
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

        leadsLoaded = true;
        updateStats();
      },
      (error) => {
        console.error('❌ Error in leads listener:', error);
        setStats(prev => ({
          ...prev,
          loading: false,
          error: error.message,
        }));
      }
    );

    // Cleanup listeners on unmount
    return () => {
      console.log('🔌 Cleaning up dashboard stats listeners');
      unsubscribeBatches();
      unsubscribeLeads();
    };
  }, [userId]);

  return stats;
}
