import type { EnterpriseInventory } from "../types/enterpriseTypes";

export const inventoryService = {
  async listInventory(clientId: string): Promise<EnterpriseInventory[]> {
    // TODO: Replace with API integration once enterprise backend endpoints are available.
    void clientId;
    return [];
  },
};
