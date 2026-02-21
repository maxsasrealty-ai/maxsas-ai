export type LeadStatus =
  | 'queued'
  | 'calling'
  | 'completed';

export type Lead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  propertyInterest: string;
  budget: string;
  status: LeadStatus;
  aiDisposition?: 'interested' | 'not_interested' | 'follow_up' | 'unknown';
  callStatus?: 'pending' | 'in_progress' | 'answered' | 'failed' | 'busy' | 'unreachable';
};
