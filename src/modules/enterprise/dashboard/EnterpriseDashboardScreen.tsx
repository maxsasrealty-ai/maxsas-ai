import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import ActivityFeed from "@/src/modules/enterprise/components/ActivityFeed";
import EnterpriseMetricCard from "@/src/modules/enterprise/components/EnterpriseMetricCard";
import {
    ENTERPRISE_ACTIVITY_MESSAGES,
    ENTERPRISE_MOCK_METRICS,
    ENTERPRISE_THEME,
} from "@/src/modules/enterprise/components/enterpriseTheme";

const metrics = [
  { label: "Active Campaigns", value: ENTERPRISE_MOCK_METRICS.activeCampaigns, icon: "target" as const },
  { label: "Total Contacts", value: ENTERPRISE_MOCK_METRICS.totalContacts, icon: "users" as const },
  { label: "Calls Completed", value: ENTERPRISE_MOCK_METRICS.callsCompleted, icon: "phone-call" as const },
  { label: "Qualified Leads", value: ENTERPRISE_MOCK_METRICS.qualifiedLeads, icon: "check-circle" as const },
  { label: "Total Wallet Credits", value: ENTERPRISE_MOCK_METRICS.walletBalance, icon: "credit-card" as const },
];

export default function EnterpriseDashboardScreen() {
  const { width } = useWindowDimensions();
  const cardColumns = width >= 1200 ? 3 : width >= 760 ? 2 : 1;
  const cardWidth = cardColumns === 1 ? "100%" : cardColumns === 2 ? "48.8%" : "32.3%";

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={["#061024", ENTERPRISE_THEME.panel, ENTERPRISE_THEME.page]}
        style={styles.backgroundGradient}
      />
      <View style={styles.orbGold} />
      <View style={styles.orbBlue} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.badge}>ENTERPRISE COMMAND CENTER</Text>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Campaign activity, calls completed, wallet credits, and recent progress in one workspace.
        </Text>

        <View style={styles.cardsGrid}>
          {metrics.map((item) => (
            <View key={item.label} style={{ width: cardWidth }}>
              <EnterpriseMetricCard
                label={item.label}
                value={String(item.value)}
                icon={item.icon}
                indicator="Performance stream active"
              />
            </View>
          ))}
        </View>

        <ActivityFeed items={Array.from(ENTERPRISE_ACTIVITY_MESSAGES)} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: ENTERPRISE_THEME.page,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  orbGold: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 999,
    top: -80,
    right: -70,
    backgroundColor: "rgba(201,168,76,0.11)",
  },
  orbBlue: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 999,
    bottom: -120,
    left: -120,
    backgroundColor: "rgba(96,165,250,0.1)",
  },
  scrollContent: {
    padding: 20,
    gap: 12,
    paddingBottom: 42,
  },
  badge: {
    color: "#111827",
    backgroundColor: ENTERPRISE_THEME.gold,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    fontSize: 10,
    letterSpacing: 1.8,
    fontWeight: "700",
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  title: {
    marginTop: 12,
    fontSize: 30,
    color: ENTERPRISE_THEME.text,
    fontWeight: "800",
  },
  subtitle: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 14,
    marginTop: 6,
  },
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
});
