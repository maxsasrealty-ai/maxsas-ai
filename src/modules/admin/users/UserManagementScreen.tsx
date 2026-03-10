import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { AdminUser } from "../types/adminTypes";

const users: AdminUser[] = [
  {
    userId: "usr_101",
    name: "Rahul Sharma",
    email: "rahul@company.com",
    plan: "diamond",
    walletBalance: 12450,
    totalCalls: 312,
    accountStatus: "active",
  },
];

export default function UserManagementScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <TextInput style={styles.search} placeholder="Search user by ID, name or email" placeholderTextColor="#94A3B8" />
      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>All Plans</Text>
        <Text style={styles.filterPill}>Basic</Text>
        <Text style={styles.filterPill}>Diamond</Text>
        <Text style={styles.filterPill}>Enterprise</Text>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w120]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w120]}>Name</Text>
              <Text style={[styles.headerCell, styles.w170]}>Email</Text>
              <Text style={[styles.headerCell, styles.w90]}>Plan</Text>
              <Text style={[styles.headerCell, styles.w110]}>Wallet Balance</Text>
              <Text style={[styles.headerCell, styles.w90]}>Total Calls</Text>
              <Text style={[styles.headerCell, styles.w120]}>Account Status</Text>
              <Text style={[styles.headerCell, styles.w220]}>Actions</Text>
            </View>
            {users.map((item) => (
              <View key={item.userId} style={styles.row}>
                <Text style={[styles.cell, styles.w120]}>{item.userId}</Text>
                <Text style={[styles.cell, styles.w120]}>{item.name}</Text>
                <Text style={[styles.cell, styles.w170]}>{item.email}</Text>
                <Text style={[styles.cell, styles.w90]}>{item.plan}</Text>
                <Text style={[styles.cell, styles.w110]}>{item.walletBalance}</Text>
                <Text style={[styles.cell, styles.w90]}>{item.totalCalls}</Text>
                <Text style={[styles.cell, styles.w120]}>{item.accountStatus}</Text>
                <Text style={[styles.cell, styles.w220]}>View | Disable | Adjust Wallet | Open Campaigns | Open Batches</Text>
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
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterPill: { backgroundColor: "#FFFFFF", borderColor: "#DCE3EE", borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, color: "#334155", fontSize: 12 },
  tableCard: { flex: 1, backgroundColor: "#FFFFFF", borderRadius: 12, borderWidth: 1, borderColor: "#DCE3EE", padding: 12 },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingBottom: 10 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEF2F7", paddingVertical: 10 },
  headerCell: { fontSize: 12, color: "#475569", fontWeight: "700", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w90: { width: 90 }, w110: { width: 110 }, w120: { width: 120 }, w170: { width: 170 }, w220: { width: 220 },
});
