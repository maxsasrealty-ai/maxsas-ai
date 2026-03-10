import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import CampaignCard from "@/src/modules/enterprise/components/CampaignCard";
import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

type CampaignStatus = "Active" | "Scheduled" | "Completed";

type Campaign = {
  id: string;
  campaignName: string;
  project: string;
  totalContacts: number;
  callsCompleted: number;
  qualifiedLeads: number;
  startDate: string;
  status: CampaignStatus;
};

const campaignData: Campaign[] = [
  {
    id: "active-1",
    campaignName: "Premium Buyer Outreach",
    project: "Palm Residency Phase 2",
    totalContacts: 0,
    callsCompleted: 0,
    qualifiedLeads: 0,
    startDate: "10 Mar 2026",
    status: "Active",
  },
  {
    id: "scheduled-1",
    campaignName: "Weekend Investor Drive",
    project: "Skyline Heights",
    totalContacts: 0,
    callsCompleted: 0,
    qualifiedLeads: 0,
    startDate: "15 Mar 2026",
    status: "Scheduled",
  },
  {
    id: "completed-1",
    campaignName: "Festival Lead Follow-up",
    project: "Green Avenue",
    totalContacts: 0,
    callsCompleted: 0,
    qualifiedLeads: 0,
    startDate: "02 Mar 2026",
    status: "Completed",
  },
];

export default function CampaignListScreen() {
  const { width } = useWindowDimensions();
  const cardWidth: `${number}%` = width >= 1080 ? "49%" : "100%";

  const active = campaignData.filter((item) => item.status === "Active");
  const scheduled = campaignData.filter((item) => item.status === "Scheduled");
  const completed = campaignData.filter((item) => item.status === "Completed");

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={["#061024", ENTERPRISE_THEME.panel, ENTERPRISE_THEME.page]}
        style={styles.backgroundGradient}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Campaigns</Text>
            <Text style={styles.subtitle}>
              Structured campaign workspace for active, scheduled, and completed performance tracking.
            </Text>
          </View>
          <Pressable style={styles.createButton}>
            <Text style={styles.createButtonText}>Create Campaign</Text>
          </Pressable>
        </View>

        <Section title="Active Campaigns" note="AI calling engine ready for active outreach windows." campaigns={active} cardWidth={cardWidth} />
        <Section
          title="Scheduled Campaigns"
          note="Upcoming campaign windows are organized and ready for launch."
          campaigns={scheduled}
          cardWidth={cardWidth}
        />
        <Section
          title="Completed Campaigns"
          note="Campaign performance insights will appear here."
          campaigns={completed}
          cardWidth={cardWidth}
        />
      </ScrollView>
    </View>
  );
}

function Section({
  title,
  note,
  campaigns,
  cardWidth,
}: {
  title: string;
  note: string;
  campaigns: Campaign[];
  cardWidth: `${number}%`;
}) {
  return (
    <View style={styles.sectionWrap}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionNote}>{note}</Text>
      </View>

      <View style={styles.grid}>
        {campaigns.map((campaign) => (
          <View key={campaign.id} style={{ width: cardWidth }}>
            <CampaignCard
              campaignName={campaign.campaignName}
              project={campaign.project}
              totalContacts={campaign.totalContacts}
              callsCompleted={campaign.callsCompleted}
              qualifiedLeads={campaign.qualifiedLeads}
              startDate={campaign.startDate}
              status={campaign.status}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: ENTERPRISE_THEME.page,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 20,
    paddingBottom: 44,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  title: {
    color: ENTERPRISE_THEME.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 14,
    marginTop: 6,
    maxWidth: 760,
  },
  createButton: {
    backgroundColor: ENTERPRISE_THEME.gold,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  createButtonText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
  },
  sectionWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    padding: 14,
    backgroundColor: "rgba(10, 19, 36, 0.62)",
    gap: 10,
  },
  sectionHeader: {
    gap: 4,
  },
  sectionTitle: {
    color: ENTERPRISE_THEME.goldSoft,
    fontSize: 18,
    fontWeight: "700",
  },
  sectionNote: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 13,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
