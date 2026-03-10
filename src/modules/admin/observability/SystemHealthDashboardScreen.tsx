import { StyleSheet, Text, View } from "react-native";

import type { HealthIndicator } from "../types/observabilityTypes";

const healthCards: { label: string; status: HealthIndicator }[] = [
  { label: "Ringg API Status", status: "Healthy" },
  { label: "n8n Workflow Status", status: "Warning" },
  { label: "Firestore Status", status: "Healthy" },
  { label: "Call Engine Status", status: "Healthy" },
  { label: "Wallet Engine Status", status: "Healthy" },
  { label: "Campaign Engine Status", status: "Down" },
];

const statusColor: Record<HealthIndicator, string> = {
  Healthy: "#16A34A",
  Warning: "#D97706",
  Down: "#DC2626",
};

export default function SystemHealthDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform System Health</Text>

      {/*
        Future data sources:
        - Ringg webhook payload logs
        - n8n execution logs
        - Firestore error events
        - API error tracking
        - call processing failures
      */}

      <View style={styles.grid}>
        {healthCards.map((card) => (
          <View key={card.label} style={styles.card}>
            <Text style={styles.cardLabel}>{card.label}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.dot, { backgroundColor: statusColor[card.status] }]} />
              <Text style={[styles.statusText, { color: statusColor[card.status] }]}>{card.status}</Text>
            </View>
          </View>
        ))}
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
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 12,
    padding: 12,
    minHeight: 88,
    justifyContent: "space-between",
  },
  cardLabel: { fontSize: 13, color: "#334155", fontWeight: "600" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  dot: { width: 10, height: 10, borderRadius: 10 },
  statusText: { fontSize: 14, fontWeight: "700" },
});
