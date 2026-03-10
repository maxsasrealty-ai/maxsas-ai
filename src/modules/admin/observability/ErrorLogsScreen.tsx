import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { SystemLog } from "../types/observabilityTypes";

const logs: SystemLog[] = [
  {
    logId: "log_7002",
    module: "ringg_integration",
    userId: "user_123",
    errorType: "Timeout",
    message: "Ringg callback timeout after 30s",
    timestamp: "9 Mar 2026 14:30",
    status: "open",
  },
];

const moduleFilters: SystemLog["module"][] = [
  "batch_engine",
  "campaign_engine",
  "wallet_engine",
  "ringg_integration",
  "n8n_workflow",
  "firestore_write",
];

export default function ErrorLogsScreen() {
  const [searchUserId, setSearchUserId] = useState("");

  const filteredLogs = logs.filter((log) =>
    log.userId.toLowerCase().includes(searchUserId.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>System Error Logs</Text>

      <TextInput
        value={searchUserId}
        onChangeText={(value: string) => setSearchUserId(value)}
        style={styles.search}
        placeholder="Search by User ID"
        placeholderTextColor="#94A3B8"
      />

      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>Module</Text>
        <Text style={styles.filterPill}>User ID</Text>
        <Text style={styles.filterPill}>Error Type</Text>
        <Text style={styles.filterPill}>Date Range</Text>
      </View>

      <View style={styles.moduleRow}>
        {moduleFilters.map((module) => (
          <Text key={module} style={styles.modulePill}>{module}</Text>
        ))}
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w100]}>Log ID</Text>
              <Text style={[styles.headerCell, styles.w140]}>Module</Text>
              <Text style={[styles.headerCell, styles.w100]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w110]}>Error Type</Text>
              <Text style={[styles.headerCell, styles.w220]}>Error Message</Text>
              <Text style={[styles.headerCell, styles.w130]}>Timestamp</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w150]}>Actions</Text>
            </View>

            {filteredLogs.map((log) => (
              <View key={log.logId} style={styles.row}>
                <Text style={[styles.cell, styles.w100]}>{log.logId}</Text>
                <Text style={[styles.cell, styles.w140]}>{log.module}</Text>
                <Text style={[styles.cell, styles.w100]}>{log.userId}</Text>
                <Text style={[styles.cell, styles.w110]}>{log.errorType}</Text>
                <Text style={[styles.cell, styles.w220]}>{log.message}</Text>
                <Text style={[styles.cell, styles.w130]}>{log.timestamp}</Text>
                <Text style={[styles.cell, styles.w90]}>{log.status}</Text>
                <Text style={[styles.cell, styles.w150]}>View Details | Mark Resolved</Text>
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
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#334155",
    fontSize: 12,
  },
  moduleRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  modulePill: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: "#475569",
    fontSize: 11,
  },
  tableCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    padding: 12,
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
  headerCell: { fontSize: 12, fontWeight: "700", color: "#475569", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w90: { width: 90 },
  w100: { width: 100 },
  w110: { width: 110 },
  w130: { width: 130 },
  w140: { width: 140 },
  w150: { width: 150 },
  w220: { width: 220 },
});
