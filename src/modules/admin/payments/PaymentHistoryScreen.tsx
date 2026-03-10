import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { PaymentTransaction } from "../types/paymentTypes";

const historyRows: PaymentTransaction[] = [
  {
    transactionId: "txn_9001",
    userId: "usr_101",
    amount: 5000,
    type: "admin_credit",
    paymentMethod: "UPI",
    referenceId: "UPI_12345",
    notes: "Monthly recharge by admin",
    createdAt: "12 Mar 2026",
  },
  {
    transactionId: "txn_9002",
    userId: "usr_204",
    amount: 1800,
    type: "manual_payment",
    paymentMethod: "Bank Transfer",
    referenceId: "BANK_9876",
    notes: "Offline transfer",
    createdAt: "12 Mar 2026",
  },
];

const typeFilters: (PaymentTransaction["type"] | "all")[] = [
  "all",
  "admin_credit",
  "admin_debit",
  "manual_payment",
  "refund",
];

export default function PaymentHistoryScreen() {
  const [searchUserId, setSearchUserId] = useState("");
  const [selectedType, setSelectedType] = useState<(typeof typeFilters)[number]>("all");

  const filteredRows = historyRows.filter((row) => {
    const userMatch = row.userId.toLowerCase().includes(searchUserId.toLowerCase());
    const typeMatch = selectedType === "all" ? true : row.type === selectedType;
    return userMatch && typeMatch;
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Billing Ledger</Text>

      {/*
        Future backend integration:
        Collections:
        - admin_payments
        - wallet_transactions
        - billing_ledger

        Fields:
        - transactionId
        - userId
        - amount
        - type
        - paymentMethod
        - referenceId
        - notes
        - createdAt
      */}

      <TextInput
        value={searchUserId}
        onChangeText={(value: string) => setSearchUserId(value)}
        placeholder="Search by userId"
        placeholderTextColor="#94A3B8"
        style={styles.search}
      />

      <View style={styles.filterRow}>
        {typeFilters.map((filterValue) => (
          <Text
            key={filterValue}
            onPress={() => setSelectedType(filterValue)}
            style={[
              styles.filterPill,
              selectedType === filterValue && styles.filterPillActive,
            ]}
          >
            {filterValue}
          </Text>
        ))}
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w120]}>Transaction ID</Text>
              <Text style={[styles.headerCell, styles.w100]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w90]}>Amount</Text>
              <Text style={[styles.headerCell, styles.w120]}>Transaction Type</Text>
              <Text style={[styles.headerCell, styles.w120]}>Payment Method</Text>
              <Text style={[styles.headerCell, styles.w120]}>Reference ID</Text>
              <Text style={[styles.headerCell, styles.w170]}>Notes</Text>
              <Text style={[styles.headerCell, styles.w110]}>Created At</Text>
            </View>

            {filteredRows.map((row) => (
              <View key={row.transactionId} style={styles.row}>
                <Text style={[styles.cell, styles.w120]}>{row.transactionId}</Text>
                <Text style={[styles.cell, styles.w100]}>{row.userId}</Text>
                <Text style={[styles.cell, styles.w90]}>{row.amount}</Text>
                <Text style={[styles.cell, styles.w120]}>{row.type}</Text>
                <Text style={[styles.cell, styles.w120]}>{row.paymentMethod}</Text>
                <Text style={[styles.cell, styles.w120]}>{row.referenceId}</Text>
                <Text style={[styles.cell, styles.w170]}>{row.notes}</Text>
                <Text style={[styles.cell, styles.w110]}>{row.createdAt}</Text>
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
    padding: 10,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterPill: {
    backgroundColor: "#FFFFFF",
    borderColor: "#DCE3EE",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    color: "#334155",
    fontSize: 12,
  },
  filterPillActive: {
    borderColor: "#0F766E",
    backgroundColor: "#ECFEFF",
    color: "#0F766E",
    fontWeight: "700",
  },
  tableCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    padding: 12,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 10,
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
    paddingVertical: 10,
  },
  headerCell: { fontSize: 12, color: "#475569", fontWeight: "700", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w90: { width: 90 },
  w100: { width: 100 },
  w110: { width: 110 },
  w120: { width: 120 },
  w170: { width: 170 },
});
