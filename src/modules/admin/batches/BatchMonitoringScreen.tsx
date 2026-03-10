import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { AdminBatch } from "../types/adminTypes";

const batches: AdminBatch[] = [
  { batchId: "bat_901", userId: "usr_101", totalLeads: 250, running: 38, completed: 192, failed: 20, createdAt: "12 Mar 2026" },
];

export default function BatchMonitoringScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Batch Monitoring</Text>
      <TextInput style={styles.search} placeholder="Search batch by ID or user ID" placeholderTextColor="#94A3B8" />
      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>All</Text>
        <Text style={styles.filterPill}>Running</Text>
        <Text style={styles.filterPill}>Failed</Text>
        <Text style={styles.filterPill}>Completed</Text>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w110]}>Batch ID</Text>
              <Text style={[styles.headerCell, styles.w110]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w100]}>Total Leads</Text>
              <Text style={[styles.headerCell, styles.w90]}>Running</Text>
              <Text style={[styles.headerCell, styles.w100]}>Completed</Text>
              <Text style={[styles.headerCell, styles.w80]}>Failed</Text>
              <Text style={[styles.headerCell, styles.w110]}>Created At</Text>
              <Text style={[styles.headerCell, styles.w170]}>Actions</Text>
            </View>
            {batches.map((item) => (
              <View key={item.batchId} style={styles.row}>
                <Text style={[styles.cell, styles.w110]}>{item.batchId}</Text>
                <Text style={[styles.cell, styles.w110]}>{item.userId}</Text>
                <Text style={[styles.cell, styles.w100]}>{item.totalLeads}</Text>
                <Text style={[styles.cell, styles.w90]}>{item.running}</Text>
                <Text style={[styles.cell, styles.w100]}>{item.completed}</Text>
                <Text style={[styles.cell, styles.w80]}>{item.failed}</Text>
                <Text style={[styles.cell, styles.w110]}>{item.createdAt}</Text>
                <Text style={[styles.cell, styles.w170]}>View Leads | Retry Failed | Debug</Text>
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
  w80: { width: 80 }, w90: { width: 90 }, w100: { width: 100 }, w110: { width: 110 }, w170: { width: 170 },
});
