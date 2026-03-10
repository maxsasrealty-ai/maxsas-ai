import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import type { UserFeatureOverride } from "../types/planTypes";

const initialOverrides: UserFeatureOverride[] = [
  {
    overrideId: "ovr_1",
    userId: "user_123",
    planId: "plan_basic",
    featureId: "ai_analytics",
    status: "enabled",
    reason: "Special client",
    createdAt: "9 Mar 2026",
  },
];

export default function UserFeatureOverrideScreen() {
  const [searchUserId, setSearchUserId] = useState("");
  const [overrides, setOverrides] = useState<UserFeatureOverride[]>(initialOverrides);

  const filteredOverrides = overrides.filter((item) =>
    item.userId.toLowerCase().includes(searchUserId.toLowerCase())
  );

  const setStatus = (overrideId: string, enabled: boolean) => {
    setOverrides((prev) =>
      prev.map((item) =>
        item.overrideId === overrideId
          ? { ...item, status: enabled ? "enabled" : "disabled" }
          : item
      )
    );
  };

  const removeOverride = (overrideId: string) => {
    setOverrides((prev) => prev.filter((item) => item.overrideId !== overrideId));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Feature Overrides</Text>
      <TextInput
        value={searchUserId}
        onChangeText={(value: string) => setSearchUserId(value)}
        placeholder="Search by User ID"
        placeholderTextColor="#94A3B8"
        style={styles.search}
      />

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w100]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w100]}>Plan</Text>
              <Text style={[styles.headerCell, styles.w140]}>Feature</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w170]}>Override Reason</Text>
              <Text style={[styles.headerCell, styles.w220]}>Actions</Text>
            </View>

            {filteredOverrides.map((item) => {
              const isEnabled = item.status === "enabled";

              return (
                <View key={item.overrideId} style={styles.row}>
                  <Text style={[styles.cell, styles.w100]}>{item.userId}</Text>
                  <Text style={[styles.cell, styles.w100]}>{item.planId}</Text>
                  <Text style={[styles.cell, styles.w140]}>{item.featureId}</Text>
                  <Text style={[styles.cell, styles.w90]}>{item.status}</Text>
                  <Text style={[styles.cell, styles.w170]}>{item.reason}</Text>
                  <View style={[styles.actionCell, styles.w220]}>
                    <Text style={styles.actionLabel}>{isEnabled ? "Disable" : "Enable"}</Text>
                    <Switch value={isEnabled} onValueChange={(value: boolean) => setStatus(item.overrideId, value)} />
                    <Text style={styles.removeText} onPress={() => removeOverride(item.overrideId)}>
                      Remove Override
                    </Text>
                  </View>
                </View>
              );
            })}
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
  actionCell: { flexDirection: "row", alignItems: "center", gap: 8 },
  actionLabel: { fontSize: 12, color: "#334155", fontWeight: "600" },
  removeText: { fontSize: 12, color: "#B91C1C", fontWeight: "700" },
  w90: { width: 90 },
  w100: { width: 100 },
  w140: { width: 140 },
  w170: { width: 170 },
  w220: { width: 220 },
});
