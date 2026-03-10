import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

type ActivityFeedProps = {
  title?: string;
  items: string[];
};

export default function ActivityFeed({ title = "Live Activity Feed", items }: ActivityFeedProps) {
  return (
    <LinearGradient colors={[ENTERPRISE_THEME.cardStart, ENTERPRISE_THEME.cardEnd]} style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Signals</Text>
        </View>
      </View>

      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.itemRow}>
          <View style={styles.markerWrap}>
            <Feather name="check-circle" size={14} color={ENTERPRISE_THEME.success} />
          </View>
          <Text style={styles.itemText}>{item}</Text>
        </View>
      ))}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    padding: 14,
    shadowColor: ENTERPRISE_THEME.cardGlow,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 10,
  },
  title: {
    color: ENTERPRISE_THEME.text,
    fontSize: 22,
    fontWeight: "700",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.35)",
    backgroundColor: ENTERPRISE_THEME.successSoft,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: ENTERPRISE_THEME.success,
  },
  liveText: {
    color: ENTERPRISE_THEME.success,
    fontSize: 11,
    fontWeight: "700",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(201, 168, 76, 0.12)",
    paddingVertical: 11,
  },
  markerWrap: {
    width: 24,
    height: 24,
    borderRadius: 99,
    backgroundColor: "rgba(34, 197, 94, 0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemText: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
});
