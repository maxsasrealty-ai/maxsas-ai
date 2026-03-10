import { StyleSheet, Text, View } from "react-native";

export default function EnterpriseAnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enterprise Analytics</Text>

      {/*
        Future functionality:
        - Render KPI charts for campaign outcomes, call completion, and conversion.
        - Add cross-client comparison and time-series trend analysis.
        - Add exportable reports and scheduled summary snapshots.
      */}

      <View style={styles.tablePlaceholder}>
        <View style={styles.headerRow}>
          <Text style={styles.headerCell}>KPI</Text>
          <Text style={styles.headerCell}>Current</Text>
          <Text style={styles.headerCell}>Previous</Text>
        </View>
        <Text style={styles.emptyState}>No analytics data available.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F9FC",
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  tablePlaceholder: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#C8D2E1",
    borderRadius: 10,
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    width: "32%",
  },
  emptyState: {
    marginTop: 24,
    textAlign: "center",
    fontSize: 14,
    color: "#64748B",
  },
});
