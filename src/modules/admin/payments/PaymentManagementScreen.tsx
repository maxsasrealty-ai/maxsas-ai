import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import type { PaymentMethod } from "../types/paymentTypes";

type ClientWalletRow = {
  userId: string;
  clientName: string;
  currentBalance: number;
  lockedAmount: number;
  totalSpent: number;
  totalRecharged: number;
  lastUpdated: string;
};

const paymentMethods: PaymentMethod[] = [
  "UPI",
  "Bank Transfer",
  "Cash",
  "Manual Adjustment",
];

const walletRows: ClientWalletRow[] = [
  {
    userId: "usr_101",
    clientName: "ABC Realty",
    currentBalance: 18250,
    lockedAmount: 1200,
    totalSpent: 48300,
    totalRecharged: 66550,
    lastUpdated: "12 Mar 2026",
  },
];

const emptyCreditForm = {
  userId: "",
  amount: "",
  paymentMethod: "UPI" as PaymentMethod,
  referenceNumber: "",
  notes: "",
};

const emptyDeductForm = {
  userId: "",
  amount: "",
  reason: "",
  notes: "",
};

const emptyPaymentForm = {
  userId: "",
  clientName: "",
  amountPaid: "",
  paymentMode: "UPI" as PaymentMethod,
  transactionId: "",
  paymentDate: "",
  notes: "",
};

export default function PaymentManagementScreen() {
  const [searchUserId, setSearchUserId] = useState("");
  const [isCreditModalVisible, setIsCreditModalVisible] = useState(false);
  const [isDeductModalVisible, setIsDeductModalVisible] = useState(false);
  const [isRecordPaymentModalVisible, setIsRecordPaymentModalVisible] = useState(false);

  const [creditForm, setCreditForm] = useState(emptyCreditForm);
  const [deductForm, setDeductForm] = useState(emptyDeductForm);
  const [paymentForm, setPaymentForm] = useState(emptyPaymentForm);

  const filteredRows = walletRows.filter((row) =>
    row.userId.toLowerCase().includes(searchUserId.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manual Billing Control</Text>

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

      <View style={styles.actionBar}>
        <Pressable onPress={() => setIsCreditModalVisible(true)} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add Credit</Text>
        </Pressable>
        <Pressable onPress={() => setIsDeductModalVisible(true)} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Deduct Credit</Text>
        </Pressable>
        <Pressable
          onPress={() => setIsRecordPaymentModalVisible(true)}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Record Payment</Text>
        </Pressable>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w100]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w120]}>Client Name</Text>
              <Text style={[styles.headerCell, styles.w120]}>Current Balance</Text>
              <Text style={[styles.headerCell, styles.w110]}>Locked Amount</Text>
              <Text style={[styles.headerCell, styles.w100]}>Total Spent</Text>
              <Text style={[styles.headerCell, styles.w120]}>Total Recharged</Text>
              <Text style={[styles.headerCell, styles.w110]}>Last Updated</Text>
              <Text style={[styles.headerCell, styles.w150]}>Actions</Text>
            </View>
            {filteredRows.map((row) => (
              <View key={row.userId} style={styles.row}>
                <Text style={[styles.cell, styles.w100]}>{row.userId}</Text>
                <Text style={[styles.cell, styles.w120]}>{row.clientName}</Text>
                <Text style={[styles.cell, styles.w120]}>{row.currentBalance}</Text>
                <Text style={[styles.cell, styles.w110]}>{row.lockedAmount}</Text>
                <Text style={[styles.cell, styles.w100]}>{row.totalSpent}</Text>
                <Text style={[styles.cell, styles.w120]}>{row.totalRecharged}</Text>
                <Text style={[styles.cell, styles.w110]}>{row.lastUpdated}</Text>
                <Text style={[styles.cell, styles.w150]}>Add Credit | Deduct | View History</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={isCreditModalVisible}
        onRequestClose={() => setIsCreditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Credit</Text>
            <TextInput value={creditForm.userId} onChangeText={(value: string) => setCreditForm((prev) => ({ ...prev, userId: value }))} placeholder="User ID" placeholderTextColor="#94A3B8" style={styles.input} />
            <TextInput value={creditForm.amount} onChangeText={(value: string) => setCreditForm((prev) => ({ ...prev, amount: value }))} placeholder="Amount" placeholderTextColor="#94A3B8" style={styles.input} keyboardType="numeric" />

            <Text style={styles.fieldLabel}>Payment Method</Text>
            <View style={styles.pillRow}>
              {paymentMethods.map((method) => (
                <Pressable
                  key={method}
                  onPress={() => setCreditForm((prev) => ({ ...prev, paymentMethod: method }))}
                  style={[styles.pill, creditForm.paymentMethod === method && styles.pillActive]}
                >
                  <Text style={[styles.pillText, creditForm.paymentMethod === method && styles.pillTextActive]}>{method}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput value={creditForm.referenceNumber} onChangeText={(value: string) => setCreditForm((prev) => ({ ...prev, referenceNumber: value }))} placeholder="Reference Number" placeholderTextColor="#94A3B8" style={styles.input} />
            <TextInput value={creditForm.notes} onChangeText={(value: string) => setCreditForm((prev) => ({ ...prev, notes: value }))} placeholder="Notes" placeholderTextColor="#94A3B8" style={styles.input} />

            <View style={styles.modalActions}>
              <Pressable onPress={() => { setCreditForm(emptyCreditForm); setIsCreditModalVisible(false); }} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Confirm Credit</Text>
              </Pressable>
              <Pressable onPress={() => setIsCreditModalVisible(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={isDeductModalVisible}
        onRequestClose={() => setIsDeductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Deduct Credit</Text>
            <TextInput value={deductForm.userId} onChangeText={(value: string) => setDeductForm((prev) => ({ ...prev, userId: value }))} placeholder="User ID" placeholderTextColor="#94A3B8" style={styles.input} />
            <TextInput value={deductForm.amount} onChangeText={(value: string) => setDeductForm((prev) => ({ ...prev, amount: value }))} placeholder="Amount" placeholderTextColor="#94A3B8" style={styles.input} keyboardType="numeric" />
            <TextInput value={deductForm.reason} onChangeText={(value: string) => setDeductForm((prev) => ({ ...prev, reason: value }))} placeholder="Reason" placeholderTextColor="#94A3B8" style={styles.input} />
            <TextInput value={deductForm.notes} onChangeText={(value: string) => setDeductForm((prev) => ({ ...prev, notes: value }))} placeholder="Notes" placeholderTextColor="#94A3B8" style={styles.input} />

            <View style={styles.modalActions}>
              <Pressable onPress={() => { setDeductForm(emptyDeductForm); setIsDeductModalVisible(false); }} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Confirm Deduction</Text>
              </Pressable>
              <Pressable onPress={() => setIsDeductModalVisible(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="slide"
        visible={isRecordPaymentModalVisible}
        onRequestClose={() => setIsRecordPaymentModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Record Payment</Text>
            <TextInput value={paymentForm.userId} onChangeText={(value: string) => setPaymentForm((prev) => ({ ...prev, userId: value }))} placeholder="User ID" placeholderTextColor="#94A3B8" style={styles.input} />
            <TextInput value={paymentForm.clientName} onChangeText={(value: string) => setPaymentForm((prev) => ({ ...prev, clientName: value }))} placeholder="Client Name" placeholderTextColor="#94A3B8" style={styles.input} />
            <TextInput value={paymentForm.amountPaid} onChangeText={(value: string) => setPaymentForm((prev) => ({ ...prev, amountPaid: value }))} placeholder="Amount Paid" placeholderTextColor="#94A3B8" style={styles.input} keyboardType="numeric" />

            <Text style={styles.fieldLabel}>Payment Mode</Text>
            <View style={styles.pillRow}>
              {paymentMethods.map((method) => (
                <Pressable
                  key={method}
                  onPress={() => setPaymentForm((prev) => ({ ...prev, paymentMode: method }))}
                  style={[styles.pill, paymentForm.paymentMode === method && styles.pillActive]}
                >
                  <Text style={[styles.pillText, paymentForm.paymentMode === method && styles.pillTextActive]}>{method}</Text>
                </Pressable>
              ))}
            </View>

            <TextInput value={paymentForm.transactionId} onChangeText={(value: string) => setPaymentForm((prev) => ({ ...prev, transactionId: value }))} placeholder="Transaction ID" placeholderTextColor="#94A3B8" style={styles.input} />
            <TextInput value={paymentForm.paymentDate} onChangeText={(value: string) => setPaymentForm((prev) => ({ ...prev, paymentDate: value }))} placeholder="Payment Date" placeholderTextColor="#94A3B8" style={styles.input} />
            <TextInput value={paymentForm.notes} onChangeText={(value: string) => setPaymentForm((prev) => ({ ...prev, notes: value }))} placeholder="Notes" placeholderTextColor="#94A3B8" style={styles.input} />

            <View style={styles.modalActions}>
              <Pressable onPress={() => { setPaymentForm(emptyPaymentForm); setIsRecordPaymentModalVisible(false); }} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Save Payment Record</Text>
              </Pressable>
              <Pressable onPress={() => setIsRecordPaymentModalVisible(false)} style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  actionBar: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  primaryButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "700" },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: { color: "#475569", fontSize: 14, fontWeight: "700" },
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
  w100: { width: 100 },
  w110: { width: 110 },
  w120: { width: 120 },
  w150: { width: 150 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    gap: 10,
    maxHeight: "88%",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  input: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  fieldLabel: { fontSize: 12, color: "#475569", fontWeight: "600" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
  },
  pillActive: { borderColor: "#0F766E", backgroundColor: "#ECFEFF" },
  pillText: { fontSize: 12, color: "#334155", fontWeight: "600" },
  pillTextActive: { color: "#0F766E" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
});
