export interface AdminUser {
  userId: string;
  name: string;
  email: string;
  plan: "basic" | "diamond" | "enterprise";
  walletBalance: number;
  totalCalls: number;
  accountStatus: "active" | "disabled";
}

export interface AdminBatch {
  batchId: string;
  userId: string;
  totalLeads: number;
  running: number;
  completed: number;
  failed: number;
  createdAt: string;
}

export interface AdminCampaign {
  campaignId: string;
  clientId: string;
  project: string;
  contacts: number;
  callsCompleted: number;
  qualifiedLeads: number;
  status: "active" | "paused" | "completed";
}

export interface AdminCall {
  callId: string;
  userId: string;
  campaignOrBatch: string;
  contactOrLead: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  duration: string;
  classification: string;
  createdAt: string;
}

export interface AdminWallet {
  userId: string;
  balance: number;
  lockedAmount: number;
  totalSpent: number;
}

export interface SystemLog {
  logId: string;
  module: "batch_engine" | "campaign_engine" | "wallet_engine" | "ringg_integration";
  userId: string;
  errorMessage: string;
  timestamp: string;
  status: "open" | "resolved";
}
