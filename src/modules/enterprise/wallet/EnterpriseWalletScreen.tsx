import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import WalletCard from "@/src/modules/enterprise/components/WalletCard";
import { ENTERPRISE_MOCK_METRICS, ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

export default function EnterpriseWalletScreen() {
  const router = useRouter();

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={["#061024", ENTERPRISE_THEME.panel, ENTERPRISE_THEME.page]}
        style={styles.backgroundGradient}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Wallet</Text>
        <Text style={styles.subtitle}>Current wallet balance and calling credit visibility for smooth campaign execution.</Text>

        <WalletCard
          balance={ENTERPRISE_MOCK_METRICS.walletBalance}
          estimatedMinutes={0}
          onRequestRecharge={() => undefined}
          onViewTransactions={() => router.push("/(enterprise)/transactions")}
        />

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>Current Wallet Balance</Text>
          <Text style={styles.noteText}>Recharge workflows are ready to be connected with billing automation.</Text>
        </View>
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
  content: {
    padding: 20,
    paddingBottom: 44,
    gap: 14,
  },
  title: {
    color: ENTERPRISE_THEME.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 14,
  },
  noteCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    backgroundColor: "rgba(10, 19, 36, 0.62)",
    padding: 14,
    gap: 6,
  },
  noteTitle: {
    color: ENTERPRISE_THEME.goldSoft,
    fontSize: 17,
    fontWeight: "700",
  },
  noteText: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 13,
  },
});
