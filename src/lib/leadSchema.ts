/**
 * Standardized Lead Schema for Firestore
 * Ensures all leads follow the same structure
 * Ready for n8n automation
 */

export type LeadSource = 'manual' | 'csv' | 'clipboard' | 'image';
export const LEAD_STATUS_VALUES = [
  'queued',
  'calling',
  'completed',
] as const;
export type LeadStatus = (typeof LEAD_STATUS_VALUES)[number];
export type LegacyLeadStatus = 'new' | 'closed';
export type LeadStatusInput = LeadStatus | LegacyLeadStatus;
export type IntakeStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface HistoryEntry {
  action: string;
  timestamp: any; // Firebase Timestamp
  details?: string;
  updatedBy?: string;
}

export interface Lead {
  // Core fields
  phone: string;
  source: LeadSource;
  userId: string;

  // Timestamps
  createdAt: any; // Firebase Timestamp
  updatedAt?: any;
  lastActionAt?: any;

  // Status tracking (for n8n automation)
  status: LeadStatus;
  intakeAction: string; // "none", "call", "email", "sms", etc.
  intakeStatus: IntakeStatus;

  // Scheduling
  followUpRequired: boolean;
  scheduleAt?: any; // Firebase Timestamp for scheduled follow-up
  followUpNotes?: string;

  // Metadata
  notes: string;
  name?: string;
  interest?: string;
  budget?: string;

  // Activity log (for n8n to track history)
  history: HistoryEntry[];

  // Additional fields for tracking
  automationTriggered?: boolean;
  automationError?: string;
}

/**
 * Create a new lead with default schema
 */
export const normalizeLeadStatus = (status: LeadStatusInput): LeadStatus => {
  if (status === 'new') return 'queued';
  if (status === 'closed') return 'completed';
  return status;
};

export const createLeadSchema = (
  phone: string,
  source: LeadSource,
  overrides?: (Partial<Lead> & { status?: LeadStatusInput })
): Omit<Lead, 'userId' | 'createdAt'> => {
  const { status: overrideStatus, ...restOverrides } = overrides || {};
  const normalizedStatus = normalizeLeadStatus(overrideStatus ?? 'queued');

  return {
    phone,
    source,
    status: normalizedStatus,
    intakeAction: 'none',
    intakeStatus: 'pending',
    followUpRequired: false,
    scheduleAt: undefined,
    notes: '',
    history: [
      {
        action: 'created',
        details: `Lead created via ${source}`,
        timestamp: new Date().toISOString(),
      },
    ],
    automationTriggered: false,
    ...restOverrides,
  };
};

/**
 * Validate lead data against schema
 */
export const validateLeadSchema = (data: any): boolean => {
  if (!data.phone || typeof data.phone !== 'string') return false;
  if (!data.source || !['manual', 'csv', 'clipboard', 'image'].includes(data.source)) return false;
  if (!data.status || ![...LEAD_STATUS_VALUES, 'new', 'closed'].includes(data.status))
    return false;
  if (!data.intakeStatus || !['pending', 'in_progress', 'completed', 'failed'].includes(data.intakeStatus))
    return false;
  return true;
};
