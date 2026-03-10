import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { Agent } from "../types/agentTypes";

const agents: Agent[] = [
  {
    agentId: "agent_001",
    agentName: "Real Estate Qualifier",
    provider: "Ringg AI",
    activeVersion: "v3",
    createdAt: "10 Mar 2026",
    updatedAt: "12 Mar 2026",
  },
];

export default function AgentListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agent Manager</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by Agent ID or Name"
        placeholderTextColor="#94A3B8"
      />

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w110]}>Agent ID</Text>
              <Text style={[styles.headerCell, styles.w170]}>Agent Name</Text>
              <Text style={[styles.headerCell, styles.w100]}>Provider</Text>
              <Text style={[styles.headerCell, styles.w80]}>Version</Text>
              <Text style={[styles.headerCell, styles.w130]}>Linked Campaigns</Text>
              <Text style={[styles.headerCell, styles.w110]}>Last Updated</Text>
              <Text style={[styles.headerCell, styles.w120]}>Actions</Text>
            </View>

            {agents.map((agent) => (
              <View key={agent.agentId} style={styles.row}>
                <Text style={[styles.cell, styles.w110]}>{agent.agentId}</Text>
                <Text style={[styles.cell, styles.w170]}>{agent.agentName}</Text>
                <Text style={[styles.cell, styles.w100]}>{agent.provider}</Text>
                <Text style={[styles.cell, styles.w80]}>{agent.activeVersion}</Text>
                <Text style={[styles.cell, styles.w130]}>5 campaigns</Text>
                <Text style={[styles.cell, styles.w110]}>{agent.updatedAt}</Text>
                <Text style={[styles.cell, styles.w120]}>Edit | Versions</Text>
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
  tableCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 12,
    padding: 12,
  },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingBottom: 10 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEF2F7", paddingVertical: 10 },
  headerCell: { fontSize: 12, color: "#475569", fontWeight: "700", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w80: { width: 80 },
  w100: { width: 100 },
  w110: { width: 110 },
  w120: { width: 120 },
  w130: { width: 130 },
  w170: { width: 170 },
});
