import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { WorkflowStatus } from "../types/observabilityTypes";

const workflows: WorkflowStatus[] = [
  {
    workflowName: "Lead Outcome Sync",
    service: "n8n",
    status: "running",
    lastRun: "9 Mar 2026 11:00",
    successCount: 980,
    failureCount: 12,
  },
  {
    workflowName: "Webhook Payload Parser",
    service: "Webhook Listener",
    status: "warning",
    lastRun: "9 Mar 2026 10:54",
    successCount: 743,
    failureCount: 31,
  },
  {
    workflowName: "Call Dispatch Engine",
    service: "Call Dispatcher",
    status: "down",
    lastRun: "9 Mar 2026 10:38",
    successCount: 1200,
    failureCount: 87,
  },
];

export default function WorkflowMonitoringScreen() {
  const [searchText, setSearchText] = useState("");

  const filteredWorkflows = workflows.filter(
    (row) =>
      row.workflowName.toLowerCase().includes(searchText.toLowerCase()) ||
      row.service.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Automation Workflow Monitor</Text>
      <TextInput
        value={searchText}
        onChangeText={(value: string) => setSearchText(value)}
        style={styles.search}
        placeholder="Search workflow/service"
        placeholderTextColor="#94A3B8"
      />

      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>Date Range</Text>
        <Text style={styles.filterPill}>Service</Text>
        <Text style={styles.filterPill}>Status</Text>
      </View>

      <View style={styles.serviceRow}>
        <Text style={styles.serviceTag}>n8n</Text>
        <Text style={styles.serviceTag}>Ringg</Text>
        <Text style={styles.serviceTag}>Webhook Listener</Text>
        <Text style={styles.serviceTag}>Call Dispatcher</Text>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w170]}>Workflow Name</Text>
              <Text style={[styles.headerCell, styles.w140]}>Service</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w140]}>Last Run</Text>
              <Text style={[styles.headerCell, styles.w110]}>Success Count</Text>
              <Text style={[styles.headerCell, styles.w110]}>Failure Count</Text>
              <Text style={[styles.headerCell, styles.w140]}>Actions</Text>
            </View>

            {filteredWorkflows.map((row) => (
              <View key={row.workflowName} style={styles.row}>
                <Text style={[styles.cell, styles.w170]}>{row.workflowName}</Text>
                <Text style={[styles.cell, styles.w140]}>{row.service}</Text>
                <Text style={[styles.cell, styles.w90]}>{row.status}</Text>
                <Text style={[styles.cell, styles.w140]}>{row.lastRun}</Text>
                <Text style={[styles.cell, styles.w110]}>{row.successCount}</Text>
                <Text style={[styles.cell, styles.w110]}>{row.failureCount}</Text>
                <Text style={[styles.cell, styles.w140]}>View Details | Retry</Text>
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
  serviceRow: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  serviceTag: {
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
  w110: { width: 110 },
  w140: { width: 140 },
  w170: { width: 170 },
});
