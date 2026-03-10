import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

const rows = [
  {
    agentName: "Ringg Agent A",
    totalCalls: 540,
    avgDuration: "42 sec",
    qualifiedLeads: 126,
    conversionRate: "23.3%",
  },
];

export default function AgentPerformanceScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agent Performance</Text>
      <TextInput style={styles.search} placeholder="Search by Agent" placeholderTextColor="#94A3B8" />
      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>Date range</Text>
        <Text style={styles.filterPill}>User ID</Text>
        <Text style={styles.filterPill}>Campaign</Text>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w150]}>Agent Name</Text>
              <Text style={[styles.headerCell, styles.w100]}>Total Calls</Text>
              <Text style={[styles.headerCell, styles.w110]}>Avg Duration</Text>
              <Text style={[styles.headerCell, styles.w120]}>Qualified Leads</Text>
              <Text style={[styles.headerCell, styles.w120]}>Conversion Rate</Text>
            </View>
            {rows.map((row) => (
              <View key={row.agentName} style={styles.row}>
                <Text style={[styles.cell, styles.w150]}>{row.agentName}</Text>
                <Text style={[styles.cell, styles.w100]}>{row.totalCalls}</Text>
                <Text style={[styles.cell, styles.w110]}>{row.avgDuration}</Text>
                <Text style={[styles.cell, styles.w120]}>{row.qualifiedLeads}</Text>
                <Text style={[styles.cell, styles.w120]}>{row.conversionRate}</Text>
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
  tableCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
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
  headerCell: { fontSize: 12, color: "#475569", fontWeight: "700", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w100: { width: 100 },
  w110: { width: 110 },
  w120: { width: 120 },
  w150: { width: 150 },
});
