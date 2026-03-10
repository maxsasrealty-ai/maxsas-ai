import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function TenantCreateScreen() {
  const [companyName, setCompanyName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [plan, setPlan] = useState<"Basic" | "Diamond" | "Enterprise">("Basic");
  const [initialWalletCredit, setInitialWalletCredit] = useState("");
  const [workspaceStatus, setWorkspaceStatus] = useState<"Active" | "Inactive">("Active");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Create Workspace</Text>

      <TextInput style={styles.input} value={companyName} onChangeText={(value: string) => setCompanyName(value)} placeholder="Company Name" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.input} value={ownerName} onChangeText={(value: string) => setOwnerName(value)} placeholder="Owner Name" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.input} value={ownerEmail} onChangeText={(value: string) => setOwnerEmail(value)} placeholder="Owner Email" placeholderTextColor="#94A3B8" />
      <TextInput style={styles.input} value={ownerPhone} onChangeText={(value: string) => setOwnerPhone(value)} placeholder="Owner Phone" placeholderTextColor="#94A3B8" />

      <Text style={styles.sectionLabel}>Plan</Text>
      <View style={styles.pillRow}>
        {(["Basic", "Diamond", "Enterprise"] as const).map((item) => (
          <Text
            key={item}
            style={[styles.pill, plan === item && styles.pillActive]}
            onPress={() => setPlan(item)}
          >
            {item}
          </Text>
        ))}
      </View>

      <TextInput
        style={styles.input}
        value={initialWalletCredit}
        onChangeText={(value: string) => setInitialWalletCredit(value)}
        placeholder="Initial Wallet Credit"
        placeholderTextColor="#94A3B8"
        keyboardType="numeric"
      />

      <Text style={styles.sectionLabel}>Workspace Status</Text>
      <View style={styles.pillRow}>
        {(["Active", "Inactive"] as const).map((item) => (
          <Text
            key={item}
            style={[styles.pill, workspaceStatus === item && styles.pillActive]}
            onPress={() => setWorkspaceStatus(item)}
          >
            {item}
          </Text>
        ))}
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Create Workspace</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Cancel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F7FB" },
  content: { padding: 16, gap: 10 },
  title: { fontSize: 24, fontWeight: "700", color: "#0F172A" },
  input: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  sectionLabel: { fontSize: 13, color: "#334155", fontWeight: "700" },
  pillRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  pill: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 12,
    color: "#334155",
  },
  pillActive: { borderColor: "#0F766E", backgroundColor: "#ECFEFF", color: "#0F766E" },
  actionsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  primaryButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "700", fontSize: 14 },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: { color: "#475569", fontWeight: "700", fontSize: 14 },
});
