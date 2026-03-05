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
  aiDisposition?: 'interested' | 'callback_requested' | 'meeting_scheduled' | 'not_interested' | 'follow_up' | 'unknown';
  callStatus?: 'pending' | 'in_progress' | 'answered' | 'failed' | 'busy' | 'unreachable';
};
