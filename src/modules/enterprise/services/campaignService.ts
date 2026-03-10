import type { EnterpriseCampaign } from "../types/enterpriseTypes";

export const campaignService = {
  async listCampaigns(): Promise<EnterpriseCampaign[]> {
    // TODO: Replace with API integration once enterprise backend endpoints are available.
    return [];
  },

  async getCampaignById(campaignId: string): Promise<EnterpriseCampaign | null> {
    // TODO: Replace with API integration once enterprise backend endpoints are available.
    void campaignId;
    return null;
  },
};
