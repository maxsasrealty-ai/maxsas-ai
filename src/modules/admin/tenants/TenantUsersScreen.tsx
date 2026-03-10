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

import type { TenantUser } from "../types/tenantTypes";

const initialUsers: TenantUser[] = [
  {
    userId: "user_001",
    tenantId: "tenant_001",
    name: "Riya Singh",
    email: "riya@abcrealty.com",
    role: "Owner",
    status: "Active",
    lastLogin: "9 Mar 2026",
  },
  {
    userId: "user_002",
    tenantId: "tenant_001",
    name: "Arjun Mehta",
    email: "arjun@abcrealty.com",
    role: "Operator",
    status: "Active",
    lastLogin: "9 Mar 2026",
  },
];

const defaultUserForm = {
  userId: "",
  name: "",
  email: "",
  role: "Viewer" as TenantUser["role"],
};

export default function TenantUsersScreen() {
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState<TenantUser[]>(initialUsers);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newUser, setNewUser] = useState(defaultUserForm);

  const filteredUsers = users.filter(
    (user) =>
      user.userId.toLowerCase().includes(searchText.toLowerCase()) ||
      user.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleAddUser = () => {
    const item: TenantUser = {
      userId: newUser.userId || `user_${Date.now()}`,
      tenantId: "tenant_001",
      name: newUser.name || "New User",
      email: newUser.email || "user@example.com",
      role: newUser.role,
      status: "Active",
      lastLogin: "-",
    };

    setUsers((prev) => [item, ...prev]);
    setNewUser(defaultUserForm);
    setIsAddModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tenant Users</Text>
      <TextInput
        value={searchText}
        onChangeText={(value: string) => setSearchText(value)}
        style={styles.search}
        placeholder="Search by User ID or Name"
        placeholderTextColor="#94A3B8"
      />

      <View style={styles.actionsRow}>
        <Pressable style={styles.primaryButton} onPress={() => setIsAddModalVisible(true)}>
          <Text style={styles.primaryButtonText}>Add User</Text>
        </Pressable>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w100]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w130]}>Name</Text>
              <Text style={[styles.headerCell, styles.w170]}>Email</Text>
              <Text style={[styles.headerCell, styles.w100]}>Role</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w100]}>Last Login</Text>
              <Text style={[styles.headerCell, styles.w160]}>Actions</Text>
            </View>

            {filteredUsers.map((user) => (
              <View key={user.userId} style={styles.row}>
                <Text style={[styles.cell, styles.w100]}>{user.userId}</Text>
                <Text style={[styles.cell, styles.w130]}>{user.name}</Text>
                <Text style={[styles.cell, styles.w170]}>{user.email}</Text>
                <Text style={[styles.cell, styles.w100]}>{user.role}</Text>
                <Text style={[styles.cell, styles.w90]}>{user.status}</Text>
                <Text style={[styles.cell, styles.w100]}>{user.lastLogin}</Text>
                <Text style={[styles.cell, styles.w160]}>Disable User | Change Role</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add User</Text>
            <TextInput style={styles.input} value={newUser.userId} onChangeText={(value: string) => setNewUser((prev) => ({ ...prev, userId: value }))} placeholder="User ID" placeholderTextColor="#94A3B8" />
            <TextInput style={styles.input} value={newUser.name} onChangeText={(value: string) => setNewUser((prev) => ({ ...prev, name: value }))} placeholder="Name" placeholderTextColor="#94A3B8" />
            <TextInput style={styles.input} value={newUser.email} onChangeText={(value: string) => setNewUser((prev) => ({ ...prev, email: value }))} placeholder="Email" placeholderTextColor="#94A3B8" />

            <Text style={styles.sectionLabel}>Role</Text>
            <View style={styles.pillRow}>
              {(["Owner", "Admin", "Operator", "Viewer"] as TenantUser["role"][]).map((role) => (
                <Text
                  key={role}
                  style={[styles.pill, newUser.role === role && styles.pillActive]}
                  onPress={() => setNewUser((prev) => ({ ...prev, role }))}
                >
                  {role}
                </Text>
              ))}
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={styles.primaryButton} onPress={handleAddUser}>
                <Text style={styles.primaryButtonText}>Add User</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setIsAddModalVisible(false)}>
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
  },
  actionsRow: { flexDirection: "row", gap: 8 },
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
  w130: { width: 130 },
  w160: { width: 160 },
  w170: { width: 170 },
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
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  input: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },
  sectionLabel: { fontSize: 13, color: "#334155", fontWeight: "700" },
  pillRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
});
