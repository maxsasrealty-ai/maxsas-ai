export const ENTERPRISE_THEME = {
  page: "#040A16",
  panel: "#0A1324",
  cardStart: "#0D1A31",
  cardEnd: "#12213B",
  gold: "#C9A84C",
  goldSoft: "#E9CB79",
  text: "#EAF0FA",
  muted: "rgba(234, 240, 250, 0.72)",
  border: "rgba(201, 168, 76, 0.28)",
  success: "#22C55E",
  successSoft: "rgba(34, 197, 94, 0.2)",
  bluePulse: "#60A5FA",
  cardGlow: "rgba(201, 168, 76, 0.24)",
} as const;

export const ENTERPRISE_MOCK_METRICS = {
  activeCampaigns: 0,
  totalContacts: 0,
  callsCompleted: 0,
  qualifiedLeads: 0,
  walletBalance: 0,
} as const;

export const ENTERPRISE_ACTIVITY_MESSAGES = [
  "AI agent successfully connected with a prospect.",
  "New qualified lead detected.",
  "Campaign performance improving.",
  "Site visit scheduled with a high-intent contact.",
] as const;
