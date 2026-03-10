import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import type { WebhookEvent } from "../types/observabilityTypes";

const events: WebhookEvent[] = [
  {
    eventId: "evt_1001",
    eventType: "call_completed",
    callId: "call_5710",
    userId: "user_123",
    campaignId: "Campaign_A",
    batchId: "-",
    status: "processed",
    receivedAt: "9 Mar 2026 10:12",
  },
  {
    eventId: "evt_1002",
    eventType: "client_analysis_completed",
    callId: "call_5711",
    userId: "user_333",
    campaignId: "Campaign_B",
    batchId: "-",
    status: "pending",
    receivedAt: "9 Mar 2026 10:22",
  },
];

export default function WebhookEventsScreen() {
  const [searchUserId, setSearchUserId] = useState("");

  const filteredEvents = events.filter((event) =>
    event.userId.toLowerCase().includes(searchUserId.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Webhook Event Tracker</Text>
      <TextInput
        value={searchUserId}
        onChangeText={(value: string) => setSearchUserId(value)}
        style={styles.search}
        placeholder="Search by User ID"
        placeholderTextColor="#94A3B8"
      />

      <View style={styles.filterRow}>
        <Text style={styles.filterPill}>Date Range</Text>
        <Text style={styles.filterPill}>Event Type</Text>
        <Text style={styles.filterPill}>Status</Text>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.w100]}>Event ID</Text>
              <Text style={[styles.headerCell, styles.w170]}>Event Type</Text>
              <Text style={[styles.headerCell, styles.w100]}>Call ID</Text>
              <Text style={[styles.headerCell, styles.w90]}>User ID</Text>
              <Text style={[styles.headerCell, styles.w130]}>Campaign/Batch</Text>
              <Text style={[styles.headerCell, styles.w90]}>Status</Text>
              <Text style={[styles.headerCell, styles.w140]}>Received At</Text>
              <Text style={[styles.headerCell, styles.w120]}>Actions</Text>
            </View>

            {filteredEvents.map((event) => (
              <View key={event.eventId} style={styles.row}>
                <Text style={[styles.cell, styles.w100]}>{event.eventId}</Text>
                <Text style={[styles.cell, styles.w170]}>{event.eventType}</Text>
                <Text style={[styles.cell, styles.w100]}>{event.callId}</Text>
                <Text style={[styles.cell, styles.w90]}>{event.userId}</Text>
                <Text style={[styles.cell, styles.w130]}>
                  {event.campaignId !== "-" ? event.campaignId : event.batchId}
                </Text>
                <Text style={[styles.cell, styles.w90]}>{event.status}</Text>
                <Text style={[styles.cell, styles.w140]}>{event.receivedAt}</Text>
                <Text style={[styles.cell, styles.w120]}>View Details</Text>
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
    borderWidth: 1,
    borderColor: "#DCE3EE",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
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
  headerCell: { fontSize: 12, fontWeight: "700", color: "#475569", paddingRight: 10 },
  cell: { fontSize: 13, color: "#0F172A", paddingRight: 10 },
  w90: { width: 90 },
  w100: { width: 100 },
  w120: { width: 120 },
  w130: { width: 130 },
  w140: { width: 140 },
  w170: { width: 170 },
});
