import { Timestamp } from 'firebase/firestore';

export type BatchChargeStatus = 'running' | 'completed' | string;
export type BatchLeadStatus = 'connected' | 'failed' | 'completed' | string;

export type BatchChargeSummary = {
  batchId: string;
  batchTotalCost: number;
  status: BatchChargeStatus;
  totalContacts: number;
  connectedCount: number;
  completedCount: number;
  failedCount: number;
  runningCount: number;
  processingLock: boolean;
  completedAt: Timestamp | null;
  userId: string;
};

export type BatchLeadBillingRow = {
  leadId: string;
  batchId: string;
  phone: string;
  status: BatchLeadStatus;
  displayStatus: 'Connected' | 'Failed';
  duration: number;
  minutesCharged: number;
  callCost: number;
  successFee: number;
  totalCost: number;
  uiTotalCost: number;
};

export type BatchChargesState = {
  loading: boolean;
  error: string | null;
  batches: BatchChargeSummary[];
};

export type BatchBillingDetailState = {
  loading: boolean;
  error: string | null;
  batch: BatchChargeSummary | null;
  leads: BatchLeadBillingRow[];
};
