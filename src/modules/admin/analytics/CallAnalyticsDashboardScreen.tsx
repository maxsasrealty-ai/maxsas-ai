import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { CallAnalytics } from "../types/analyticsTypes";

const summaryCards = [
  "Total Calls Today",
  "Total Calls This Month",
  "Average Call Duration",
  "Qualified Leads",
  "Not Interested",
  "Site Visits Scheduled",
  "Conversion Rate",
];

const callStatusSegments = [
  "Completed",
  "Failed",
  "No Answer",
  "Busy",
  "Callback Requested",
];

const recentCalls: CallAnalytics[] = [
  {
    callId: "5710e756...",
    userId: "user_123",
    campaignId: "Campaign_A",
    batchId: "-",
    contactName: "Rahul Sharma",
    phoneNumber: "+91XXXXXXXXXX",
    callDuration: "33 sec",
    classification: "not_interested",
    status: "completed",
    createdAt: "9 Mar 2026",
  },
];

export default function CallAnalyticsDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Call Intelligence</Text>

      {/*
        Future backend data sources:
        - Ringg AI webhook payloads
        - Firestore call_logs
        - Batch lead results
        - Campaign contact results
      */}

      <TextInput
        style={styles.search}
        placeholder="Search by User ID"
        placeholderTextColor="#94A3B8"
      />
      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>Date range</Text>
        <Text style={styles.filterPill}>User ID</Text>
        <Text style={styles.filterPill}>Agent</Text>
        <Text style={styles.filterPill}>Campaign</Text>
        <Text style={styles.filterPill}>Batch</Text>
      </View>

      <View style={styles.cardsGrid}>
        {summaryCards.map((label) => (
          <View key={label} style={styles.card}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue}>--</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.sectionTitle}>Call Status Pie Chart (placeholder)</Text>
        <View style={styles.legendWrap}>
          {callStatusSegments.map((segment) => (
            <View key={segment} style={styles.legendItem}>
              <View style={styles.legendDot} />
              <Text style={styles.legendText}>{segment}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.sectionTitle}>Recent Calls</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w120]}>Call ID</Text>
              <Text style={[styles.headerCell, styles.w90]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w130]}>Campaign/Batch</Text>
              <Text style={[styles.headerCell, styles.w120]}>Contact/Lead</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w90]}>Duration</Text>
              <Text style={[styles.headerCell, styles.w120]}>Classification</Text>
              <Text style={[styles.headerCell, styles.w100]}>Created At</Text>
              <Text style={[styles.headerCell, styles.w120]}>Actions</Text>
            </View>
            {recentCalls.map((call) => (
              <View key={call.callId} style={styles.row}>
                <Text style={[styles.cell, styles.w120]}>{call.callId}</Text>
                <Text style={[styles.cell, styles.w90]}>{call.userId}</Text>
                <Text style={[styles.cell, styles.w130]}>{call.campaignId}</Text>
                <Text style={[styles.cell, styles.w120]}>{call.contactName}</Text>
                <Text style={[styles.cell, styles.w90]}>{call.status}</Text>
                <Text style={[styles.cell, styles.w90]}>{call.callDuration}</Text>
                <Text style={[styles.cell, styles.w120]}>{call.classification}</Text>
                <Text style={[styles.cell, styles.w100]}>{call.createdAt}</Text>
                <Text style={[styles.cell, styles.w120]}>View Transcript</Text>
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
  search: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterPill: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE3EE",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#334155",
    fontSize: 12,
  },
  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    padding: 12,
    minHeight: 84,
    justifyContent: "space-between",
  },
  cardLabel: { color: "#475569", fontSize: 12, fontWeight: "600" },
  cardValue: { color: "#0F172A", fontSize: 20, fontWeight: "700" },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    padding: 12,
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  legendWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 10, backgroundColor: "#0F766E" },
  legendText: { fontSize: 12, color: "#334155" },
  tableCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    padding: 12,
    gap: 8,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
    paddingVertical: 10,
  },
  headerCell: { fontSize: 12, color: "#475569", fontWeight: "700", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w90: { width: 90 },
  w100: { width: 100 },
  w120: { width: 120 },
  w130: { width: 130 },
});
