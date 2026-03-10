import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { Tenant } from "../types/tenantTypes";

const tenants: Tenant[] = [
  {
    tenantId: "tenant_001",
    companyName: "ABC Realty",
    plan: "Enterprise",
    ownerEmail: "admin@abcrealty.com",
    ownerPhone: "+91XXXXXXXXXX",
    walletBalance: 52000,
    status: "Active",
    createdAt: "12 Mar 2026",
  },
];

export default function TenantManagementScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Client Workspaces</Text>
      <TextInput
        style={styles.search}
        placeholder="Search by tenant ID / company / owner email"
        placeholderTextColor="#94A3B8"
      />
      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>Plan</Text>
        <Text style={styles.filterPill}>Status</Text>
        <Text style={styles.filterPill}>Created Date</Text>
      </View>

      {/*
        Future backend integration:
        Collections:
        - tenants
        - tenant_users

        Fields:
        - tenantId
        - companyName
        - plan
        - ownerEmail
        - walletBalance
        - status
        - createdAt
      */}

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w110]}>Tenant ID</Text>
              <Text style={[styles.headerCell, styles.w140]}>Company Name</Text>
              <Text style={[styles.headerCell, styles.w90]}>Plan</Text>
              <Text style={[styles.headerCell, styles.w170]}>Owner Email</Text>
              <Text style={[styles.headerCell, styles.w90]}>Total Users</Text>
              <Text style={[styles.headerCell, styles.w120]}>Active Campaigns</Text>
              <Text style={[styles.headerCell, styles.w110]}>Wallet Balance</Text>
              <Text style={[styles.headerCell, styles.w100]}>Created At</Text>
              <Text style={[styles.headerCell, styles.w150]}>Actions</Text>
            </View>

            {tenants.map((item) => (
              <View key={item.tenantId} style={styles.row}>
                <Text style={[styles.cell, styles.w110]}>{item.tenantId}</Text>
                <Text style={[styles.cell, styles.w140]}>{item.companyName}</Text>
                <Text style={[styles.cell, styles.w90]}>{item.plan}</Text>
                <Text style={[styles.cell, styles.w170]}>{item.ownerEmail}</Text>
                <Text style={[styles.cell, styles.w90]}>3</Text>
                <Text style={[styles.cell, styles.w120]}>4</Text>
                <Text style={[styles.cell, styles.w110]}>Rs52,000</Text>
                <Text style={[styles.cell, styles.w100]}>{item.createdAt}</Text>
                <Text style={[styles.cell, styles.w150]}>View | Manage Users</Text>
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
  search: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  filterRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  filterPill: {
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#334155",
    fontSize: 12,
  },
  tableCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 12,
    padding: 12,
  },
  headerRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#E2E8F0", paddingBottom: 10 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#EEF2F7", paddingVertical: 10 },
  headerCell: { fontSize: 12, fontWeight: "700", color: "#475569", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w90: { width: 90 },
  w100: { width: 100 },
  w110: { width: 110 },
  w120: { width: 120 },
  w140: { width: 140 },
  w150: { width: 150 },
  w170: { width: 170 },
});
