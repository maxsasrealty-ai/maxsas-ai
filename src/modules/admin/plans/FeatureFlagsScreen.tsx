import { useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import type { FeatureFlag } from "../types/planTypes";

const initialFlags: FeatureFlag[] = [
  {
    featureId: "feat_1",
    featureName: "batch_calling",
    module: "batch_engine",
    status: "enabled",
    description: "Enable batch calling workflows.",
  },
  {
    featureId: "feat_2",
    featureName: "campaign_calling",
    module: "campaign_engine",
    status: "enabled",
    description: "Enable campaign-based calling.",
  },
  {
    featureId: "feat_3",
    featureName: "inventory_management",
    module: "inventory",
    status: "disabled",
    description: "Enable inventory controls.",
  },
  {
    featureId: "feat_4",
    featureName: "ai_analytics",
    module: "analytics",
    status: "enabled",
    description: "Enable AI insights and metrics.",
  },
  {
    featureId: "feat_5",
    featureName: "advanced_reports",
    module: "reports",
    status: "disabled",
    description: "Enable advanced reports package.",
  },
  {
    featureId: "feat_6",
    featureName: "call_transcripts",
    module: "calls",
    status: "enabled",
    description: "Enable transcript viewer.",
  },
  {
    featureId: "feat_7",
    featureName: "call_recordings",
    module: "calls",
    status: "disabled",
    description: "Enable recording playback.",
  },
];

export default function FeatureFlagsScreen() {
  const [searchUserId, setSearchUserId] = useState("");
  const [flags, setFlags] = useState<FeatureFlag[]>(initialFlags);

  const filteredFlags = flags.filter((flag) =>
    flag.featureName.toLowerCase().includes(searchUserId.toLowerCase())
  );

  const toggleFeature = (featureId: string, enabled: boolean) => {
    setFlags((prev) =>
      prev.map((flag) =>
        flag.featureId === featureId
          ? { ...flag, status: enabled ? "enabled" : "disabled" }
          : flag
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feature Flags</Text>
      <TextInput
        value={searchUserId}
        onChangeText={(value: string) => setSearchUserId(value)}
        placeholder="Search feature"
        placeholderTextColor="#94A3B8"
        style={styles.search}
      />

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w150]}>Feature Name</Text>
              <Text style={[styles.headerCell, styles.w130]}>Module</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w220]}>Description</Text>
              <Text style={[styles.headerCell, styles.w120]}>Actions</Text>
            </View>

            {filteredFlags.map((flag) => {
              const isEnabled = flag.status === "enabled";

              return (
                <View key={flag.featureId} style={styles.row}>
                  <Text style={[styles.cell, styles.w150]}>{flag.featureName}</Text>
                  <Text style={[styles.cell, styles.w130]}>{flag.module}</Text>
                  <Text style={[styles.cell, styles.w90]}>{flag.status}</Text>
                  <Text style={[styles.cell, styles.w220]}>{flag.description}</Text>
                  <View style={[styles.actionCell, styles.w120]}>
                    <Text style={styles.actionLabel}>{isEnabled ? "Disable" : "Enable"}</Text>
                    <Switch
                      value={isEnabled}
                      onValueChange={(value: boolean) => toggleFeature(flag.featureId, value)}
                    />
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
  w90: { width: 90 },
  w120: { width: 120 },
  w130: { width: 130 },
  w150: { width: 150 },
  w220: { width: 220 },
});
