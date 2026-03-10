import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

type CampaignCardProps = {
  campaignName: string;
  project: string;
  totalContacts: number;
  callsCompleted: number;
  qualifiedLeads: number;
  startDate: string;
  status: "Active" | "Scheduled" | "Completed";
};

export default function CampaignCard({
  campaignName,
  project,
  totalContacts,
  callsCompleted,
  qualifiedLeads,
  startDate,
  status,
}: CampaignCardProps) {
  return (
    <LinearGradient colors={[ENTERPRISE_THEME.cardStart, ENTERPRISE_THEME.cardEnd]} style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{campaignName}</Text>
          <Text style={styles.project}>{project}</Text>
        </View>
        <View style={styles.statusPill}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Feather name="users" size={13} color={ENTERPRISE_THEME.bluePulse} />
          <Text style={styles.metricText}>Contacts: {totalContacts}</Text>
        </View>
        <View style={styles.metricItem}>
          <Feather name="phone-call" size={13} color={ENTERPRISE_THEME.bluePulse} />
          <Text style={styles.metricText}>Calls: {callsCompleted}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricItem}>
          <Feather name="check-circle" size={13} color={ENTERPRISE_THEME.success} />
          <Text style={styles.metricText}>Qualified: {qualifiedLeads}</Text>
        </View>
        <View style={styles.metricItem}>
          <Feather name="calendar" size={13} color={ENTERPRISE_THEME.goldSoft} />
          <Text style={styles.metricText}>Start: {startDate}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    padding: 14,
    gap: 10,
    shadowColor: ENTERPRISE_THEME.cardGlow,
    shadowOpacity: 0.28,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  name: {
    color: ENTERPRISE_THEME.text,
    fontSize: 16,
    fontWeight: "700",
  },
  project: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 13,
    marginTop: 4,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.35)",
    backgroundColor: ENTERPRISE_THEME.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: ENTERPRISE_THEME.success,
  },
  statusText: {
    color: ENTERPRISE_THEME.success,
    fontSize: 11,
    fontWeight: "700",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  metricText: {
    color: ENTERPRISE_THEME.text,
    fontSize: 13,
    fontWeight: "500",
  },
});
