import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

type MetricIcon = React.ComponentProps<typeof Feather>["name"];

type EnterpriseMetricCardProps = {
  label: string;
  value: string;
  icon: MetricIcon;
  indicator?: string;
};

export default function EnterpriseMetricCard({ label, value, icon, indicator }: EnterpriseMetricCardProps) {
  return (
    <LinearGradient colors={[ENTERPRISE_THEME.cardStart, ENTERPRISE_THEME.cardEnd]} style={styles.card}>
      <Text style={styles.watermark}>LIVE</Text>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.iconWrap}>
          <Feather name={icon} size={14} color={ENTERPRISE_THEME.goldSoft} />
        </View>
      </View>
      <Text style={styles.value}>{value}</Text>
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.badgeText}>{indicator ?? "Tracking active"}</Text>
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
    minHeight: 132,
    justifyContent: "space-between",
    overflow: "hidden",
    shadowColor: ENTERPRISE_THEME.cardGlow,
    shadowOpacity: 0.36,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  watermark: {
    position: "absolute",
    right: -16,
    bottom: 2,
    fontSize: 36,
    fontWeight: "800",
    color: "rgba(201, 168, 76, 0.09)",
    transform: [{ rotate: "-18deg" }],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  label: {
    color: ENTERPRISE_THEME.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.4,
    textTransform: "uppercase",
    flex: 1,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    backgroundColor: "rgba(201, 168, 76, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    color: ENTERPRISE_THEME.text,
    fontSize: 32,
    fontWeight: "800",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.35)",
    backgroundColor: ENTERPRISE_THEME.successSoft,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: ENTERPRISE_THEME.success,
  },
  badgeText: {
    color: ENTERPRISE_THEME.success,
    fontSize: 11,
    fontWeight: "700",
  },
});
