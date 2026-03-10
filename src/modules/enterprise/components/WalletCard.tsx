import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

type WalletCardProps = {
  balance: number;
  estimatedMinutes: number;
  onRequestRecharge?: () => void;
  onViewTransactions?: () => void;
};

export default function WalletCard({
  balance,
  estimatedMinutes,
  onRequestRecharge,
  onViewTransactions,
}: WalletCardProps) {
  return (
    <LinearGradient colors={[ENTERPRISE_THEME.cardStart, ENTERPRISE_THEME.cardEnd]} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Calling Credits</Text>
        <View style={styles.iconWrap}>
          <Feather name="credit-card" size={15} color={ENTERPRISE_THEME.goldSoft} />
        </View>
      </View>

      <Text style={styles.balance}>Rs {balance.toLocaleString("en-IN")}</Text>
      <Text style={styles.minutes}>{estimatedMinutes.toLocaleString("en-IN")} estimated calling minutes remaining</Text>

      <View style={styles.actions}>
        <Pressable onPress={onRequestRecharge} style={styles.primaryAction}>
          <Text style={styles.primaryActionText}>Request Recharge</Text>
        </Pressable>
        <Pressable onPress={onViewTransactions} style={styles.secondaryAction}>
          <Text style={styles.secondaryActionText}>View Transactions</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    padding: 16,
    gap: 10,
    shadowColor: ENTERPRISE_THEME.cardGlow,
    shadowOpacity: 0.34,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: ENTERPRISE_THEME.gold,
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    flex: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    backgroundColor: "rgba(201, 168, 76, 0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  balance: {
    color: ENTERPRISE_THEME.text,
    fontSize: 36,
    fontWeight: "800",
  },
  minutes: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 6,
  },
  primaryAction: {
    backgroundColor: ENTERPRISE_THEME.gold,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 13,
  },
  secondaryAction: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    backgroundColor: "rgba(13, 26, 49, 0.6)",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: ENTERPRISE_THEME.text,
    fontWeight: "700",
    fontSize: 13,
  },
});
