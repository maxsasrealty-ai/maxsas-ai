import { StyleSheet, Text, View } from "react-native";

const cards = [
  "Total Agents",
  "Active Agents",
  "Agent Versions",
  "Campaigns Using Agents",
];

export default function AgentStudioDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Agent Studio</Text>

      {/*
        Future backend integration:
        Collections:
        - ai_agents
        - ai_agent_versions

        Fields:
        - agentId
        - agentName
        - provider
        - activeVersion
        - createdAt
        - updatedAt
      */}

      <View style={styles.grid}>
        {cards.map((label) => (
          <View key={label} style={styles.card}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue}>--</Text>
          </View>
        ))}
      </View>

      <Text style={styles.note}>Only administrators can edit agents.</Text>
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
  cardLabel: { fontSize: 12, color: "#475569", fontWeight: "600" },
  cardValue: { fontSize: 22, color: "#0F172A", fontWeight: "700" },
  note: { fontSize: 12, color: "#64748B" },
});
