import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";

import type { PlanConfig } from "../types/planTypes";

const initialPlans: PlanConfig[] = [
  {
    planId: "plan_basic",
    planName: "Basic",
    price: 999,
    maxCalls: 500,
    maxCampaigns: 2,
    maxContacts: 2000,
    features: {
      enableBatchCalling: true,
      enableCampaignCalling: false,
      enableAIAnalytics: false,
      enableAdvancedReports: false,
      enableInventoryManager: false,
      enableAdminAccess: false,
    },
    status: "active",
  },
  {
    planId: "plan_diamond",
    planName: "Diamond",
    price: 2999,
    maxCalls: 3000,
    maxCampaigns: 10,
    maxContacts: 15000,
    features: {
      enableBatchCalling: true,
      enableCampaignCalling: true,
      enableAIAnalytics: true,
      enableAdvancedReports: true,
      enableInventoryManager: false,
      enableAdminAccess: false,
    },
    status: "active",
  },
  {
    planId: "plan_enterprise",
    planName: "Enterprise",
    price: 9999,
    maxCalls: 50000,
    maxCampaigns: 200,
    maxContacts: 300000,
    features: {
      enableBatchCalling: true,
      enableCampaignCalling: true,
      enableAIAnalytics: true,
      enableAdvancedReports: true,
      enableInventoryManager: true,
      enableAdminAccess: true,
    },
    status: "active",
  },
];

type EditablePlan = {
  planName: "Basic" | "Diamond" | "Enterprise";
  price: string;
  maxCalls: string;
  maxCampaigns: string;
  maxContacts: string;
  enableBatchCalling: boolean;
  enableCampaignCalling: boolean;
  enableAIAnalytics: boolean;
  enableAdvancedReports: boolean;
  enableInventoryManager: boolean;
  enableAdminAccess: boolean;
};

const defaultEditablePlan: EditablePlan = {
  planName: "Basic",
  price: "",
  maxCalls: "",
  maxCampaigns: "",
  maxContacts: "",
  enableBatchCalling: false,
  enableCampaignCalling: false,
  enableAIAnalytics: false,
  enableAdvancedReports: false,
  enableInventoryManager: false,
  enableAdminAccess: false,
};

export default function PlanManagementScreen() {
  const [plans] = useState<PlanConfig[]>(initialPlans);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<EditablePlan>(defaultEditablePlan);

  const openEditModal = (plan: PlanConfig) => {
    setEditingPlan({
      planName: plan.planName,
      price: String(plan.price),
      maxCalls: String(plan.maxCalls),
      maxCampaigns: String(plan.maxCampaigns),
      maxContacts: String(plan.maxContacts),
      enableBatchCalling: plan.features.enableBatchCalling,
      enableCampaignCalling: plan.features.enableCampaignCalling,
      enableAIAnalytics: plan.features.enableAIAnalytics,
      enableAdvancedReports: plan.features.enableAdvancedReports,
      enableInventoryManager: plan.features.enableInventoryManager,
      enableAdminAccess: plan.features.enableAdminAccess,
    });
    setIsModalVisible(true);
  };

  const featuresEnabledCount = (plan: PlanConfig) =>
    Object.values(plan.features).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Platform Plans</Text>

      {/*
        Future backend integration:
        Collections:
        - platform_plans
        - feature_flags
        - user_feature_overrides

        Key fields:
        - planId
        - featureId
        - userId
        - status
        - createdAt
      */}

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w120]}>Plan Name</Text>
              <Text style={[styles.headerCell, styles.w110]}>Monthly Price</Text>
              <Text style={[styles.headerCell, styles.w90]}>Max Calls</Text>
              <Text style={[styles.headerCell, styles.w110]}>Max Campaigns</Text>
              <Text style={[styles.headerCell, styles.w100]}>Max Contacts</Text>
              <Text style={[styles.headerCell, styles.w130]}>Features Enabled</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w130]}>Actions</Text>
            </View>

            {plans.map((plan) => (
              <View key={plan.planId} style={styles.row}>
                <Text style={[styles.cell, styles.w120]}>{plan.planName}</Text>
                <Text style={[styles.cell, styles.w110]}>{plan.price}</Text>
                <Text style={[styles.cell, styles.w90]}>{plan.maxCalls}</Text>
                <Text style={[styles.cell, styles.w110]}>{plan.maxCampaigns}</Text>
                <Text style={[styles.cell, styles.w100]}>{plan.maxContacts}</Text>
                <Text style={[styles.cell, styles.w130]}>{featuresEnabledCount(plan)}</Text>
                <Text style={[styles.cell, styles.w90]}>{plan.status}</Text>
                <Text style={[styles.cell, styles.w130]} onPress={() => openEditModal(plan)}>
                  Edit Plan | View Features
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Plan Configuration</Text>
            <TextInput
              style={styles.input}
              value={editingPlan.planName}
              onChangeText={(value: string) =>
                setEditingPlan((prev) => ({
                  ...prev,
                  planName: (value as EditablePlan["planName"]) || prev.planName,
                }))
              }
              placeholder="Plan Name"
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={styles.input}
              value={editingPlan.price}
              onChangeText={(value: string) => setEditingPlan((prev) => ({ ...prev, price: value }))}
              placeholder="Monthly Price"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={editingPlan.maxCalls}
              onChangeText={(value: string) => setEditingPlan((prev) => ({ ...prev, maxCalls: value }))}
              placeholder="Max Calls"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={editingPlan.maxCampaigns}
              onChangeText={(value: string) =>
                setEditingPlan((prev) => ({ ...prev, maxCampaigns: value }))
              }
              placeholder="Max Campaigns"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              value={editingPlan.maxContacts}
              onChangeText={(value: string) =>
                setEditingPlan((prev) => ({ ...prev, maxContacts: value }))
              }
              placeholder="Max Contacts"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
            />

            <Text style={styles.sectionLabel}>Feature toggles</Text>
            <View style={styles.toggleRow}><Text style={styles.toggleText}>Enable Batch Calling</Text><Switch value={editingPlan.enableBatchCalling} onValueChange={(value: boolean) => setEditingPlan((prev) => ({ ...prev, enableBatchCalling: value }))} /></View>
            <View style={styles.toggleRow}><Text style={styles.toggleText}>Enable Campaign Calling</Text><Switch value={editingPlan.enableCampaignCalling} onValueChange={(value: boolean) => setEditingPlan((prev) => ({ ...prev, enableCampaignCalling: value }))} /></View>
            <View style={styles.toggleRow}><Text style={styles.toggleText}>Enable AI Analytics</Text><Switch value={editingPlan.enableAIAnalytics} onValueChange={(value: boolean) => setEditingPlan((prev) => ({ ...prev, enableAIAnalytics: value }))} /></View>
            <View style={styles.toggleRow}><Text style={styles.toggleText}>Enable Advanced Reports</Text><Switch value={editingPlan.enableAdvancedReports} onValueChange={(value: boolean) => setEditingPlan((prev) => ({ ...prev, enableAdvancedReports: value }))} /></View>
            <View style={styles.toggleRow}><Text style={styles.toggleText}>Enable Inventory Manager</Text><Switch value={editingPlan.enableInventoryManager} onValueChange={(value: boolean) => setEditingPlan((prev) => ({ ...prev, enableInventoryManager: value }))} /></View>
            <View style={styles.toggleRow}><Text style={styles.toggleText}>Enable Admin Access</Text><Switch value={editingPlan.enableAdminAccess} onValueChange={(value: boolean) => setEditingPlan((prev) => ({ ...prev, enableAdminAccess: value }))} /></View>

            <View style={styles.actionsRow}>
              <Pressable style={styles.primaryButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.primaryButtonText}>Save Plan</Text>
              </Pressable>
              <Pressable style={styles.secondaryButton} onPress={() => setIsModalVisible(false)}>
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
  w130: { width: 130 },
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
    maxHeight: "90%",
  },
  modalTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  input: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: "#334155", marginTop: 2 },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F8FAFC",
  },
  toggleText: { fontSize: 13, color: "#334155", fontWeight: "600" },
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
