import { ScrollView, StyleSheet, Text, View } from "react-native";

const classificationRows = [
  { label: "Qualified", value: 126, key: "qualified_lead" },
  { label: "Not Interested", value: 241, key: "not_interested" },
  { label: "Callback Requested", value: 84, key: "callback_requested" },
  { label: "Site Visit Scheduled", value: 58, key: "site_visit_scheduled" },
  { label: "Wrong Person", value: 17, key: "wrong_person" },
];

export default function LeadClassificationScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Lead Classification</Text>

      <View style={styles.cardsGrid}>
        {classificationRows.map((row) => (
          <View key={row.key} style={styles.card}>
            <Text style={styles.cardLabel}>{row.label}</Text>
            <Text style={styles.cardValue}>{row.value}</Text>
          </View>
        ))}
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.sectionTitle}>Classification Breakdown</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w180]}>Classification</Text>
              <Text style={[styles.headerCell, styles.w120]}>Count</Text>
              <Text style={[styles.headerCell, styles.w220]}>Description</Text>
            </View>
            {classificationRows.map((row) => (
              <View key={row.key} style={styles.row}>
                <Text style={[styles.cell, styles.w180]}>{row.label}</Text>
                <Text style={[styles.cell, styles.w120]}>{row.value}</Text>
                <Text style={[styles.cell, styles.w220]}>Admin view across basic, diamond, and enterprise calls</Text>
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
  tableCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    padding: 12,
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
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
  w120: { width: 120 },
  w180: { width: 180 },
  w220: { width: 220 },
});
