import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type CampaignStatus = "Active" | "Paused" | "Draft";

type Campaign = {
  campaignId: string;
  clientId: string;
  campaignName: string;
  projectName: string;
  agentName: string;
  status: CampaignStatus;
  startTime: string;
  endTime: string;
  contactCount: number;
  createdAt: string;
};

const projectOptions = ["DLF New Gurgaon", "Sobha City", "M3M Capital"];
const agentOptions = ["Real Estate Agent v1", "Luxury Segment Agent", "Investor Agent"];

const emptyDraft = {
  campaignName: "",
  projectName: projectOptions[0],
  agentName: agentOptions[0],
  startTime: "",
  endTime: "",
  uploadContacts: "",
  contactCount: 0,
};

export default function CampaignBuilderScreen() {
  const [draft, setDraft] = useState(emptyDraft);
  const [localCampaigns, setLocalCampaigns] = useState<Campaign[]>([]);

  const handleCreateCampaign = () => {
    const campaign: Campaign = {
      campaignId: `cmp_${Date.now()}`,
      clientId: "client_local",
      campaignName: draft.campaignName.trim() || "Untitled Campaign",
      projectName: draft.projectName,
      agentName: draft.agentName,
      status: "Draft",
      startTime: draft.startTime.trim() || "TBD",
      endTime: draft.endTime.trim() || "TBD",
      contactCount: draft.contactCount,
      createdAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setLocalCampaigns((prev) => [campaign, ...prev]);
    setDraft(emptyDraft);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Campaign Builder</Text>

      {/*
        Future backend integration (Firestore):
        Collection: enterprise_campaigns
        Fields:
        - campaignId
        - clientId
        - campaignName
        - projectName
        - agentId
        - status
        - startTime
        - endTime
        - contactCount
        - createdAt
      */}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create Campaign</Text>

        <TextInput
          value={draft.campaignName}
          onChangeText={(value: string) => setDraft((prev) => ({ ...prev, campaignName: value }))}
          placeholder="Campaign Name"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <Text style={styles.fieldLabel}>Project (dropdown placeholder)</Text>
        <View style={styles.pillRow}>
          {projectOptions.map((project) => (
            <Pressable
              key={project}
              onPress={() => setDraft((prev) => ({ ...prev, projectName: project }))}
              style={[styles.pill, draft.projectName === project && styles.pillActive]}
            >
              <Text style={[styles.pillText, draft.projectName === project && styles.pillTextActive]}>
                {project}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Agent (dropdown placeholder)</Text>
        <View style={styles.pillRow}>
          {agentOptions.map((agent) => (
            <Pressable
              key={agent}
              onPress={() => setDraft((prev) => ({ ...prev, agentName: agent }))}
              style={[styles.pill, draft.agentName === agent && styles.pillActive]}
            >
              <Text style={[styles.pillText, draft.agentName === agent && styles.pillTextActive]}>
                {agent}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={draft.startTime}
          onChangeText={(value: string) => setDraft((prev) => ({ ...prev, startTime: value }))}
          placeholder="Start Time"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />
        <TextInput
          value={draft.endTime}
          onChangeText={(value: string) => setDraft((prev) => ({ ...prev, endTime: value }))}
          placeholder="End Time"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />
        <TextInput
          value={draft.uploadContacts}
          onChangeText={(value: string) =>
            setDraft((prev) => ({
              ...prev,
              uploadContacts: value,
              contactCount: value.trim() ? 150 : 0,
            }))
          }
          placeholder="Upload Contacts (CSV placeholder)"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <View style={styles.contactCountBox}>
          <Text style={styles.contactCountLabel}>Contact Count (auto placeholder)</Text>
          <Text style={styles.contactCountValue}>{draft.contactCount}</Text>
        </View>

        <Pressable onPress={handleCreateCampaign} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Create Campaign</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Campaign Drafts (Local State)</Text>
        {localCampaigns.length === 0 ? (
          <Text style={styles.emptyState}>No local campaigns created yet.</Text>
        ) : (
          localCampaigns.map((campaign) => (
            <View key={campaign.campaignId} style={styles.localCampaignRow}>
              <Text style={styles.localCampaignTitle}>{campaign.campaignName}</Text>
              <Text style={styles.localCampaignMeta}>
                {campaign.projectName} | {campaign.agentName} | Contacts: {campaign.contactCount}
              </Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
  },
  content: {
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    backgroundColor: "#FFFFFF",
    padding: 12,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  fieldLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
  },
  pillActive: {
    borderColor: "#0F766E",
    backgroundColor: "#ECFEFF",
  },
  pillText: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "600",
  },
  pillTextActive: {
    color: "#0F766E",
  },
  contactCountBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
    padding: 10,
  },
  contactCountLabel: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "600",
  },
  contactCountValue: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  primaryButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyState: {
    fontSize: 14,
    color: "#64748B",
  },
  localCampaignRow: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#F8FAFC",
    gap: 3,
  },
  localCampaignTitle: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  localCampaignMeta: {
    fontSize: 12,
    color: "#475569",
  },
});
