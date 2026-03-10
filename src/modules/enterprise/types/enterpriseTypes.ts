export interface EnterpriseCampaign {
  campaignId: string;
  clientId: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseContact {
  contactId: string;
  clientId: string;
  fullName: string;
  phoneNumber: string;
  email?: string;
  company?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface EnterpriseInventory {
  clientId: string;
  itemCode: string;
  itemName: string;
  quantityAvailable: number;
  unitPrice?: number;
  category?: string;
  updatedAt: string;
}

export interface EnterpriseCall {
  callId: string;
  campaignId: string;
  contactId: string;
  clientId: string;
  status: "queued" | "in_progress" | "completed" | "failed";
  durationSeconds?: number;
  disposition?: string;
  createdAt: string;
  updatedAt: string;
}
