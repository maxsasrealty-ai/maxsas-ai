import { StyleSheet, Text, View } from "react-native";

const analyticsCards = [
  "Total Calls",
  "Average Call Duration",
  "Qualified Leads",
  "Not Interested",
  "Site Visits Scheduled",
  "Conversion Rate",
];

export default function PlatformAnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform Analytics</Text>
      <View style={styles.grid}>
        {analyticsCards.map((label) => (
          <View key={label} style={styles.card}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue}>--</Text>
          </View>
        ))}
      </View>

      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Ringg Analytics Placeholder</Text>
        <Text style={styles.noteText}>Detailed call quality, intent scoring, and trend breakouts will be connected in a future Ringg analytics integration.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB", padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  card: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    padding: 12,
    minHeight: 90,
    justifyContent: "space-between",
  },
  cardLabel: { color: "#475569", fontSize: 12, fontWeight: "600" },
  cardValue: { color: "#0F172A", fontSize: 22, fontWeight: "700" },
  noteCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    padding: 12,
    gap: 4,
  },
  noteTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  noteText: { fontSize: 13, color: "#475569" },
});
