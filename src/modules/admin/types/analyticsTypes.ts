export type CallClassification =
  | "qualified_lead"
  | "not_interested"
  | "callback_requested"
  | "site_visit_scheduled"
  | "wrong_person";

export type CallStatus =
  | "completed"
  | "failed"
  | "no_answer"
  | "busy"
  | "callback_requested";

export interface CallAnalytics {
  callId: string;
  userId: string;
  campaignId: string;
  batchId: string;
  contactName: string;
  phoneNumber: string;
  callDuration: string;
  classification: CallClassification;
  status: CallStatus;
  createdAt: string;
}
