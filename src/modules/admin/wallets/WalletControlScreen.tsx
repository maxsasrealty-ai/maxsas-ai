import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { AdminWallet } from "../types/adminTypes";

const wallets: AdminWallet[] = [
  { userId: "usr_101", balance: 12450, lockedAmount: 1500, totalSpent: 28500 },
];

const operations = ["Manual Recharge", "Manual Deduction", "Refund", "Freeze Wallet"];

export default function WalletControlScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet Control</Text>
      <TextInput style={styles.search} placeholder="Search user ID" placeholderTextColor="#94A3B8" />
      <View style={styles.filterRow}>
        {operations.map((op) => (
          <Text key={op} style={styles.filterPill}>{op}</Text>
        ))}
      </View>

      {/* Future integration: wallet ledger reconciliation and adjustment audit trails. */}

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w120]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w100]}>Balance</Text>
              <Text style={[styles.headerCell, styles.w120]}>Locked Amount</Text>
              <Text style={[styles.headerCell, styles.w100]}>Total Spent</Text>
              <Text style={[styles.headerCell, styles.w220]}>Actions</Text>
            </View>
            {wallets.map((item) => (
              <View key={item.userId} style={styles.row}>
                <Text style={[styles.cell, styles.w120]}>{item.userId}</Text>
                <Text style={[styles.cell, styles.w100]}>{item.balance}</Text>
                <Text style={[styles.cell, styles.w120]}>{item.lockedAmount}</Text>
                <Text style={[styles.cell, styles.w100]}>{item.totalSpent}</Text>
                <Text style={[styles.cell, styles.w220]}>Manual Recharge | Manual Deduction | Refund | Freeze Wallet</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB", padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  search: { borderWidth: 1, borderColor: "#D3DCE8", borderRadius: 10, padding: 10, backgroundColor: "#FFFFFF", color: "#0F172A" },
  filterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterPill: { backgroundColor: "#FFFFFF", borderColor: "#DCE3EE", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, color: "#334155", fontSize: 12 },
  tableCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#DCE3EE", padding: 12 },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingBottom: 10 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEF2F7", paddingVertical: 10 },
  headerCell: { fontSize: 12, color: "#475569", fontWeight: "700", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w100: { width: 100 }, w120: { width: 120 }, w220: { width: 220 },
});
