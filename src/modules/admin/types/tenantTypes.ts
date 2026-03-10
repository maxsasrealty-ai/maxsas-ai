export interface Tenant {
  tenantId: string;
  companyName: string;
  plan: "Basic" | "Diamond" | "Enterprise";
  ownerEmail: string;
  ownerPhone: string;
  walletBalance: number;
  status: "Active" | "Inactive";
  createdAt: string;
}

export interface TenantUser {
  userId: string;
  tenantId: string;
  name: string;
  email: string;
  role: "Owner" | "Admin" | "Operator" | "Viewer";
  status: "Active" | "Disabled";
  lastLogin: string;
}
