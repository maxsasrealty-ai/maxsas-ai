export type HealthIndicator = "Healthy" | "Warning" | "Down";

export interface SystemLog {
  logId: string;
  module:
    | "batch_engine"
    | "campaign_engine"
    | "wallet_engine"
    | "ringg_integration"
    | "n8n_workflow"
    | "firestore_write";
  userId: string;
  errorType: string;
  message: string;
  timestamp: string;
  status: "open" | "resolved";
}

export interface WebhookEvent {
  eventId: string;
  eventType:
    | "call_completed"
    | "client_analysis_completed"
    | "platform_analysis_completed";
  callId: string;
  userId: string;
  campaignId: string;
  batchId: string;
  status: "processed" | "pending" | "failed";
  receivedAt: string;
}

export interface WorkflowStatus {
  workflowName: string;
  service: "n8n" | "Ringg" | "Webhook Listener" | "Call Dispatcher";
  status: "running" | "warning" | "down";
  lastRun: string;
  successCount: number;
  failureCount: number;
}
