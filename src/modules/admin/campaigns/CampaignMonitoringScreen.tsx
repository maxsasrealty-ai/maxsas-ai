import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { AdminCampaign } from "../types/adminTypes";

const campaigns: AdminCampaign[] = [
  {
    campaignId: "cmp_301",
    clientId: "ent_901",
    project: "DLF New Gurgaon",
    contacts: 450,
    callsCompleted: 218,
    qualifiedLeads: 64,
    status: "active",
  },
];

export default function CampaignMonitoringScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campaign Monitoring</Text>
      <TextInput style={styles.search} placeholder="Search campaign by ID or client ID" placeholderTextColor="#94A3B8" />
      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>All</Text>
        <Text style={styles.filterPill}>Active</Text>
        <Text style={styles.filterPill}>Paused</Text>
        <Text style={styles.filterPill}>Completed</Text>
      </View>
      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w120]}>Campaign ID</Text>
              <Text style={[styles.headerCell, styles.w100]}>Client ID</Text>
              <Text style={[styles.headerCell, styles.w140]}>Project</Text>
              <Text style={[styles.headerCell, styles.w90]}>Contacts</Text>
              <Text style={[styles.headerCell, styles.w120]}>Calls Completed</Text>
              <Text style={[styles.headerCell, styles.w120]}>Qualified Leads</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w180]}>Actions</Text>
            </View>
            {campaigns.map((item) => (
              <View key={item.campaignId} style={styles.row}>
                <Text style={[styles.cell, styles.w120]}>{item.campaignId}</Text>
                <Text style={[styles.cell, styles.w100]}>{item.clientId}</Text>
                <Text style={[styles.cell, styles.w140]}>{item.project}</Text>
                <Text style={[styles.cell, styles.w90]}>{item.contacts}</Text>
                <Text style={[styles.cell, styles.w120]}>{item.callsCompleted}</Text>
                <Text style={[styles.cell, styles.w120]}>{item.qualifiedLeads}</Text>
                <Text style={[styles.cell, styles.w90]}>{item.status}</Text>
                <Text style={[styles.cell, styles.w180]}>Open Campaign | View Contacts | Debug</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB", padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  search: { borderWidth: 1, borderColor: "#D3DCE8", borderRadius: 10, padding: 10, backgroundColor: "#FFFFFF", color: "#0F172A" },
  filterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterPill: { backgroundColor: "#FFFFFF", borderColor: "#DCE3EE", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, color: "#334155", fontSize: 12 },
  tableCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#DCE3EE", padding: 12 },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingBottom: 10 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEF2F7", paddingVertical: 10 },
  headerCell: { fontSize: 12, color: "#475569", fontWeight: "700", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w90: { width: 90 }, w100: { width: 100 }, w120: { width: 120 }, w140: { width: 140 }, w180: { width: 180 },
});
