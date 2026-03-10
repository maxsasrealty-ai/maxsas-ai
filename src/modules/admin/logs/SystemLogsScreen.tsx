import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { SystemLog } from "../types/adminTypes";

const logs: SystemLog[] = [
  {
    logId: "log_7001",
    module: "campaign_engine",
    userId: "ent_901",
    errorMessage: "Timeout while syncing contact outcomes",
    timestamp: "12 Mar 2026 15:42",
    status: "open",
  },
];

export default function SystemLogsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Logs</Text>
      <TextInput style={styles.search} placeholder="Search log ID, module or user ID" placeholderTextColor="#94A3B8" />
      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>batch_engine</Text>
        <Text style={styles.filterPill}>campaign_engine</Text>
        <Text style={styles.filterPill}>wallet_engine</Text>
        <Text style={styles.filterPill}>ringg_integration</Text>
      </View>

      {/* Future integrations: Firestore error sink, Ringg API diagnostics, n8n execution logs. */}

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w100]}>Log ID</Text>
              <Text style={[styles.headerCell, styles.w130]}>Module</Text>
              <Text style={[styles.headerCell, styles.w100]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w240]}>Error Message</Text>
              <Text style={[styles.headerCell, styles.w150]}>Timestamp</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
            </View>
            {logs.map((item) => (
              <View key={item.logId} style={styles.row}>
                <Text style={[styles.cell, styles.w100]}>{item.logId}</Text>
                <Text style={[styles.cell, styles.w130]}>{item.module}</Text>
                <Text style={[styles.cell, styles.w100]}>{item.userId}</Text>
                <Text style={[styles.cell, styles.w240]}>{item.errorMessage}</Text>
                <Text style={[styles.cell, styles.w150]}>{item.timestamp}</Text>
                <Text style={[styles.cell, styles.w90]}>{item.status}</Text>
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
  w90: { width: 90 }, w100: { width: 100 }, w130: { width: 130 }, w150: { width: 150 }, w240: { width: 240 },
});
