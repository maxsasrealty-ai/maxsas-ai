import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const TOKENS = {
  page: "#050d1a",
  cardStart: "#0c1a2e",
  cardEnd: "#0a1525",
  primary: "#4F8CFF",
  secondary: "#00D084",
  warning: "#F59E0B",
  danger: "#EF4444",
  muted: "rgba(232,237,245,0.45)",
  text: "#e8edf5",
  border: "rgba(79,140,255,0.16)",
  borderActive: "rgba(79,140,255,0.35)",
};

const dashboardCards = [
  { label: "Total Users", value: "--", tone: TOKENS.primary, icon: "users" as const },
  { label: "Active Basic Plan Users", value: "--", tone: TOKENS.secondary, icon: "user-check" as const },
  { label: "Active Diamond Plan Users", value: "--", tone: "#93C5FD", icon: "star" as const },
  { label: "Active Enterprise Clients", value: "--", tone: "#60A5FA", icon: "briefcase" as const },
  { label: "Total Calls Today", value: "--", tone: TOKENS.warning, icon: "phone-call" as const },
  { label: "Total Calls This Month", value: "--", tone: TOKENS.primary, icon: "bar-chart-2" as const },
  { label: "Total Wallet Balance", value: "--", tone: TOKENS.secondary, icon: "credit-card" as const },
  { label: "System Errors", value: "--", tone: TOKENS.danger, icon: "alert-triangle" as const },
];

const activityFeed = [
  { text: "Webhook retries stabilized for ring automation", at: "09:13" },
  { text: "New enterprise tenant successfully provisioned", at: "09:24" },
  { text: "Payment sync queue drained without failures", at: "09:31" },
];

export default function AdminDashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 980;

  return (
    <View style={styles.page}>
      <LinearGradient colors={["#071225", TOKENS.page]} style={styles.backgroundGradient} />
      <View style={styles.glowOne} />
      <View style={styles.glowTwo} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.sectionLabel}>CONTROL ROOM</Text>
            <Text style={styles.title}>Platform Admin Dashboard</Text>
          </View>

          <Pressable style={styles.createClientCta} onPress={() => router.push("/(admin)/tenant-create")}>
            <Feather name="plus" size={14} color="#FFFFFF" />
            <Text style={styles.createClientCtaText}>Create Enterprise Client</Text>
          </Pressable>
        </View>

        <View style={styles.grid}>
          {dashboardCards.map((item) => (
            <LinearGradient
              key={item.label}
              colors={[TOKENS.cardStart, TOKENS.cardEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, isCompact ? styles.compactCard : styles.wideCard]}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <View style={[styles.iconChip, { borderColor: item.tone }]}>
                  <Feather name={item.icon} size={14} color={item.tone} />
                </View>
              </View>
              <Text style={[styles.cardValue, { color: item.tone }]}>{item.value}</Text>
            </LinearGradient>
          ))}
        </View>

        <View style={[styles.bottomPanels, isCompact ? styles.bottomPanelsStack : styles.bottomPanelsRow]}>
          <LinearGradient colors={[TOKENS.cardStart, TOKENS.cardEnd]} style={styles.activityCard}>
            <Text style={styles.panelTitle}>Recent Activity</Text>
            {activityFeed.map((item) => (
              <View key={`${item.text}-${item.at}`} style={styles.activityRow}>
                <View style={styles.liveDot} />
                <Text style={styles.activityText}>{item.text}</Text>
                <Text style={styles.activityTime}>{item.at}</Text>
              </View>
            ))}
          </LinearGradient>

          <LinearGradient colors={[TOKENS.cardStart, TOKENS.cardEnd]} style={styles.quickActionCard}>
            <Text style={styles.panelTitle}>Quick Actions</Text>
            <Pressable style={styles.actionButtonPrimary}>
              <Text style={styles.actionButtonPrimaryText}>Trigger Health Check</Text>
            </Pressable>
            <Pressable style={styles.actionButtonGhost}>
              <Text style={styles.actionButtonGhostText}>Review System Errors</Text>
            </Pressable>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: TOKENS.page },
  backgroundGradient: { ...StyleSheet.absoluteFillObject },
  glowOne: {
    position: "absolute",
    width: 260,
    height: 260,
    top: -40,
    right: -40,
    borderRadius: 999,
    backgroundColor: "rgba(79,140,255,0.16)",
  },
  glowTwo: {
    position: "absolute",
    width: 300,
    height: 300,
    left: -120,
    bottom: -90,
    borderRadius: 999,
    backgroundColor: "rgba(0,208,132,0.1)",
  },
  scrollContent: { padding: 20, gap: 16, paddingBottom: 42 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap",
  },
  sectionLabel: {
    color: TOKENS.muted,
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "700",
  },
  title: { fontSize: 30, fontWeight: "800", color: TOKENS.text, marginTop: 6 },
  createClientCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: TOKENS.primary,
    borderWidth: 1,
    borderColor: TOKENS.borderActive,
    shadowColor: TOKENS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  createClientCtaText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TOKENS.border,
    padding: 14,
    minHeight: 120,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  compactCard: { width: "100%" },
  wideCard: { width: "48.7%" },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  iconChip: {
    width: 30,
    height: 30,
    borderRadius: 99,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(79,140,255,0.08)",
  },
  cardLabel: { color: TOKENS.muted, fontSize: 12, fontWeight: "600" },
  cardValue: { fontSize: 28, fontWeight: "800", marginTop: 8 },
  bottomPanels: { gap: 12 },
  bottomPanelsStack: { flexDirection: "column" },
  bottomPanelsRow: { flexDirection: "row" },
  activityCard: {
    flex: 1.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TOKENS.border,
    padding: 14,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: TOKENS.border,
    padding: 14,
    gap: 10,
  },
  panelTitle: { color: TOKENS.text, fontSize: 20, fontWeight: "700", marginBottom: 8 },
  activityRow: {
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: TOKENS.secondary,
  },
  activityText: { flex: 1, color: "rgba(232,237,245,0.78)", fontSize: 13, fontWeight: "500" },
  activityTime: { color: TOKENS.muted, fontSize: 12 },
  actionButtonPrimary: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: TOKENS.primary,
  },
  actionButtonPrimaryText: { color: "#FFFFFF", fontWeight: "700" },
  actionButtonGhost: {
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: TOKENS.borderActive,
    backgroundColor: "transparent",
  },
  actionButtonGhostText: { color: "rgba(232,237,245,0.8)", fontWeight: "600" },
});
