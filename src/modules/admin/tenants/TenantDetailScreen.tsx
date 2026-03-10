import { StyleSheet, Text, View } from "react-native";

const tenant = {
  tenantId: "tenant_001",
  companyName: "ABC Realty",
  plan: "Enterprise",
  ownerEmail: "admin@abcrealty.com",
  ownerPhone: "+91XXXXXXXXXX",
  walletBalance: "Rs52,000",
  campaignCount: 4,
  batchCount: 7,
  createdAt: "12 Mar 2026",
};

export default function TenantDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tenant Detail</Text>

      <View style={styles.detailCard}>
        <Text style={styles.detailRow}>Tenant ID: {tenant.tenantId}</Text>
        <Text style={styles.detailRow}>Company Name: {tenant.companyName}</Text>
        <Text style={styles.detailRow}>Plan: {tenant.plan}</Text>
        <Text style={styles.detailRow}>Owner Email: {tenant.ownerEmail}</Text>
        <Text style={styles.detailRow}>Owner Phone: {tenant.ownerPhone}</Text>
        <Text style={styles.detailRow}>Wallet Balance: {tenant.walletBalance}</Text>
        <Text style={styles.detailRow}>Campaign Count: {tenant.campaignCount}</Text>
        <Text style={styles.detailRow}>Batch Count: {tenant.batchCount}</Text>
        <Text style={styles.detailRow}>Created At: {tenant.createdAt}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Campaign Summary</Text>
        <Text style={styles.sectionText}>Active campaigns, outcomes, and utilization will appear here.</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Batch Summary</Text>
        <Text style={styles.sectionText}>Batch usage and completion insights will appear here.</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Call Statistics</Text>
        <Text style={styles.sectionText}>Call volume, duration, and conversion insights will appear here.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB", padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  detailRow: { fontSize: 13, color: "#334155" },
  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  sectionText: { fontSize: 13, color: "#475569" },
});
