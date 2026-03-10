import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { AdminCall } from "../types/adminTypes";

const calls: AdminCall[] = [
  {
    callId: "call_5001",
    userId: "usr_101",
    campaignOrBatch: "cmp_301",
    contactOrLead: "Rahul Sharma",
    status: "completed",
    duration: "03:42",
    classification: "Not Interested",
    createdAt: "12 Mar 2026",
  },
];

export default function CallLogsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Call Logs</Text>
      <TextInput style={styles.search} placeholder="Search call ID, user ID or campaign/batch" placeholderTextColor="#94A3B8" />
      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>All Statuses</Text>
        <Text style={styles.filterPill}>Completed</Text>
        <Text style={styles.filterPill}>Failed</Text>
      </View>
      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w120]}>Call ID</Text>
              <Text style={[styles.headerCell, styles.w100]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w130]}>Campaign/Batch</Text>
              <Text style={[styles.headerCell, styles.w120]}>Contact/Lead</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w80]}>Duration</Text>
              <Text style={[styles.headerCell, styles.w120]}>Classification</Text>
              <Text style={[styles.headerCell, styles.w110]}>Created At</Text>
              <Text style={[styles.headerCell, styles.w160]}>Actions</Text>
            </View>
            {calls.map((item) => (
              <View key={item.callId} style={styles.row}>
                <Text style={[styles.cell, styles.w120]}>{item.callId}</Text>
                <Text style={[styles.cell, styles.w100]}>{item.userId}</Text>
                <Text style={[styles.cell, styles.w130]}>{item.campaignOrBatch}</Text>
                <Text style={[styles.cell, styles.w120]}>{item.contactOrLead}</Text>
                <Text style={[styles.cell, styles.w90]}>{item.status}</Text>
                <Text style={[styles.cell, styles.w80]}>{item.duration}</Text>
                <Text style={[styles.cell, styles.w120]}>{item.classification}</Text>
                <Text style={[styles.cell, styles.w110]}>{item.createdAt}</Text>
                <Text style={[styles.cell, styles.w160]}>View Transcript | View Analysis</Text>
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
  w80: { width: 80 }, w90: { width: 90 }, w100: { width: 100 }, w110: { width: 110 }, w120: { width: 120 }, w130: { width: 130 }, w160: { width: 160 },
});
