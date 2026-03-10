export interface PlanConfig {
  planId: string;
  planName: "Basic" | "Diamond" | "Enterprise";
  price: number;
  maxCalls: number;
  maxCampaigns: number;
  maxContacts: number;
  features: {
    enableBatchCalling: boolean;
    enableCampaignCalling: boolean;
    enableAIAnalytics: boolean;
    enableAdvancedReports: boolean;
    enableInventoryManager: boolean;
    enableAdminAccess: boolean;
  };
  status: "active" | "inactive";
}

export interface FeatureFlag {
  featureId: string;
  featureName: string;
  module: string;
  status: "enabled" | "disabled";
  description: string;
}

export interface UserFeatureOverride {
  overrideId: string;
  userId: string;
  planId: string;
  featureId: string;
  status: "enabled" | "disabled";
  reason: string;
  createdAt: string;
}
