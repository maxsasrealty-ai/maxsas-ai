import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import TransactionItem from "@/src/modules/enterprise/components/TransactionItem";
import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

const transactions = [
  {
    date: "10 Mar 2026",
    type: "Recharge" as const,
    amount: "+ Rs 0",
    referenceId: "RCH-ENT-1020",
    status: "Completed" as const,
  },
  {
    date: "09 Mar 2026",
    type: "Call Usage" as const,
    amount: "- Rs 0",
    referenceId: "USE-ENT-1011",
    status: "Completed" as const,
  },
  {
    date: "08 Mar 2026",
    type: "Adjustment" as const,
    amount: "+ Rs 0",
    referenceId: "ADJ-ENT-1007",
    status: "Processing" as const,
  },
];

export default function EnterpriseTransactionsScreen() {
  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={["#061024", ENTERPRISE_THEME.panel, ENTERPRISE_THEME.page]}
        style={styles.backgroundGradient}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Transactions</Text>
        <Text style={styles.subtitle}>SaaS billing timeline for recharges, call usage, and wallet adjustments.</Text>

        <View style={styles.tableWrap}>
          <View style={styles.tableHeader}>
            <View style={styles.headerItem}>
              <Feather name="calendar" size={12} color={ENTERPRISE_THEME.goldSoft} />
              <Text style={styles.headerText}>Date</Text>
            </View>
            <Text style={styles.headerText}>Type</Text>
            <Text style={styles.headerText}>Amount</Text>
            <Text style={styles.headerText}>Reference ID</Text>
            <Text style={styles.headerText}>Status</Text>
          </View>

          {transactions.map((item) => (
            <TransactionItem
              key={item.referenceId}
              date={item.date}
              type={item.type}
              amount={item.amount}
              referenceId={item.referenceId}
              status={item.status}
            />
          ))}
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
  tableWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    backgroundColor: "rgba(10, 19, 36, 0.62)",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201, 168, 76, 0.2)",
    paddingBottom: 10,
  },
  headerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  headerText: {
    color: ENTERPRISE_THEME.gold,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    minWidth: 90,
  },
});
