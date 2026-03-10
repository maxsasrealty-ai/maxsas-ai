import { ScrollView, StyleSheet, Text, View } from "react-native";

const versions = [
  {
    version: "v1",
    createdBy: "admin",
    createdAt: "10 Mar 2026",
    notes: "Initial version",
    status: "Inactive",
  },
  {
    version: "v2",
    createdBy: "admin",
    createdAt: "12 Mar 2026",
    notes: "Updated pitch",
    status: "Active",
  },
];

export default function AgentVersionHistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agent Version History</Text>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w90]}>Version</Text>
              <Text style={[styles.headerCell, styles.w100]}>Created By</Text>
              <Text style={[styles.headerCell, styles.w110]}>Created At</Text>
              <Text style={[styles.headerCell, styles.w170]}>Notes</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w90]}>Actions</Text>
            </View>

            {versions.map((item) => (
              <View key={item.version} style={styles.row}>
                <Text style={[styles.cell, styles.w90]}>{item.version}</Text>
                <Text style={[styles.cell, styles.w100]}>{item.createdBy}</Text>
                <Text style={[styles.cell, styles.w110]}>{item.createdAt}</Text>
                <Text style={[styles.cell, styles.w170]}>{item.notes}</Text>
                <Text style={[styles.cell, styles.w90]}>{item.status}</Text>
                <Text style={[styles.cell, styles.w90]}>View</Text>
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
  w90: { width: 90 },
  w100: { width: 100 },
  w110: { width: 110 },
  w170: { width: 170 },
});
