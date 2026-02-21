import { Timestamp } from 'firebase/firestore';

export type BatchStatus = 'draft' | 'queued' | 'scheduled' | 'running' | 'completed' | 'failed';
export type BatchAction = 'call_now' | 'schedule' | null;
export type BatchSource = 'manual' | 'csv' | 'clipboard' | 'image';
export type LeadStatus =
  | 'queued'
  | 'calling'
  | 'completed';
export type CallStatus = 'pending' | 'in_progress' | 'answered' | 'failed' | 'busy' | 'unreachable';
export type AiDisposition = 'interested' | 'not_interested' | 'follow_up' | 'unknown';
export type UserTier = 'free' | 'pro';
export type BillingStatus = 'pending' | 'charged' | 'refunded';

/**
 * USER DOCUMENT STRUCTURE
 * Stored in 'users' collection
 * PHASE 1: Enhanced with concurrency control fields
 */
export interface User {
  userId: string;
  email: string;
  displayName?: string;
  maxCurrentCalls: number; // Default: 2
  currentActiveCalls: number; // Default: 0
  tier: UserTier; // Default: 'free'
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * BATCH STATISTICS STRUCTURE
 * Real-time statistics for dashboard display
 */
export interface BatchStats {
  total: number;
  queued: number;
  calling: number;
  answered: number;
  interested: number;
  not_interested: number;
  failed: number;
  successRate: number;
}

export interface ExtractedContact {
  phone: string;
  name?: string;
  email?: string;
  confidence?: number;
}

/**
 * BATCH DOCUMENT STRUCTURE
 * Stored in 'batches' collection
 * One document per batch - metadata only, NO contacts array
 * PHASE 0 & 4: Enhanced with dispatcher concurrency control
 */
export interface Batch {
  batchId: string;
  userId: string;
  status: Exclude<BatchStatus, 'draft'>;
  processingLock: boolean; // Kept for backward compatibility
  lockOwner: string | null; // PHASE 4: Dispatcher instance ID
  lockExpiresAt: Timestamp | null; // PHASE 4: Lock expiration time
  priority: number; // PHASE 4: Default 1
  lastDispatchedAt: Timestamp; // PHASE 0: For fair batch rotation
  action: BatchAction;
  source: BatchSource;
  totalContacts: number;
  createdAt: Timestamp;
  updatedAt: Timestamp; // PHASE 4: Last update timestamp
  scheduleAt: Timestamp | null;
  startedAt: Timestamp | null;
  completedAt: Timestamp | null;
  completedCount: number;
  failedCount: number;
  runningCount: number;
  contacts?: ExtractedContact[]; // Only populated when fetched with leads
}

/**
 * BATCH DRAFT
 * Stored locally before user clicks "Call Now" or "Schedule"
 * NO Firebase write until user takes action
 */
export interface BatchDraft {
  batchId: string;
  createdAt: Timestamp;
  contacts: ExtractedContact[];
  status: 'draft';
  source: BatchSource;
  action: null;
  totalContacts: number;
  metadata?: {
    fileName?: string;
    uploadedFrom?: string;
    extractionType?: 'manual' | 'ai' | 'csv_parser';
  };
}

/**
 * LEAD DOCUMENT STRUCTURE
 * Stored in 'leads' collection
 * One document per phone number
 * MUST reference a batchId
 * PHASE 3: Enhanced with lock and billing fields
 */
export interface Lead {
  leadId: string;
  batchId: string;
  phone: string;
  userId: string;
  status: LeadStatus;
  createdAt: Timestamp;
  lastActionAt: Timestamp | null;
  attempts: number;
  maxAttempts: number; // PHASE 3: Default 3
  callStatus: CallStatus;
  lastAttemptAt: Timestamp | null;
  retryCount: number;
  nextRetryAt: Timestamp | null;
  aiDisposition: AiDisposition;
  callDuration: number | null;
  callStartedAt: Timestamp | null; // PHASE 3: When call started
  callEndedAt: Timestamp | null; // PHASE 3: When call ended
  providerCallId: string | null;
  notes: string | null;
  lockOwner: string | null; // PHASE 3: Dispatcher instance ID
  lockExpiresAt: Timestamp | null; // PHASE 3: Lock expiration time
  billingStatus: BillingStatus | null; // PHASE 3: Billing state
}

/**
 * WALLET STRUCTURE
 * Stored in 'wallets' collection
 * One document per user
 * PHASE 5: Cleaned up - removed deprecated fields
 */
export interface Wallet {
  userId: string;
  balance: number;
  lockedAmount: number;
  totalSpent: number;
  totalRecharged: number;
  updatedAt: Timestamp;
}

/**
 * SYSTEM RUNTIME STRUCTURE
 * Stored in 'system/runtime' document
 * PHASE 2: Global concurrency control
 */
export interface SystemRuntime {
  activeCalls: number; // Default: 0
  maxAllowedCalls: number; // Default: 40
  ringgChannelLimit: number; // Default: 50
  dispatcherInstanceCount: number; // Default: 1
  maintenanceMode: boolean; // Default: false
  updatedAt: Timestamp;
}

/**
 * WALLET TRANSACTION STRUCTURE
 * Stored in 'wallets/{userId}/transactions' subcollection
 */
export interface WalletTransaction {
  transactionId: string;
  userId: string;
  type: 'recharge' | 'deduction' | 'refund';
  amount: number;
  previousBalance: number;
  newBalance: number;
  batchId?: string;
  description: string;
  createdAt: Timestamp;
}

/**
 * WALLET OPERATION RESULT
 */
export interface WalletOperationResult {
  success: boolean;
  availableBalance?: number;
  requiredAmount?: number;
  errorMessage?: string;
}

export interface BatchOperationResult {
  success: boolean;
  errorMessage?: string;
  errorCode?: string;
  errorDetails?: any;
}

export interface BatchContextType {
  currentBatch: Batch | BatchDraft | null;
  allBatches: (Batch | BatchDraft)[];
  leadStatsByBatch: Record<string, { pending: number; running: number; completed: number; failed: number; retries: number }>;
  loading: boolean;
  error: string | null;
  
  // Actions
  createLocalBatch: (contacts: ExtractedContact[], source: BatchSource, metadata?: any) => BatchDraft;
  deleteDraftBatch: (batchId: string) => void;
  saveBatchToFirebase: (batch: Batch | BatchDraft, action: 'call_now' | 'schedule', scheduleAt?: Timestamp) => Promise<BatchOperationResult>;
  getAllBatches: () => Promise<void>;
  getBatchDetail: (batchId: string) => Promise<Batch | null>;
  updateBatchStatus: (batchId: string, status: BatchStatus) => Promise<void>;
  clearError: () => void;
}
