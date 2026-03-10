export interface Agent {
  agentId: string;
  agentName: string;
  provider: "Ringg AI" | "Other";
  activeVersion: string;
  createdAt: string;
  updatedAt: string;
}

export interface AgentPromptConfig {
  introduction: string;
  conversationFlow: string;
  leadQualification: string;
  pitchLogic: string;
  objectionHandling: string;
  closingMessage: string;
}

export interface AgentVersion {
  versionId: string;
  agentId: string;
  versionNumber: string;
  promptConfig: AgentPromptConfig;
  createdBy: string;
  createdAt: string;
  status: "Active" | "Inactive";
}
