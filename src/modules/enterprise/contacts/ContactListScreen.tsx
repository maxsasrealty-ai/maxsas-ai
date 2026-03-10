import { LinearGradient } from "expo-linear-gradient";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

type ContactStatus = "Connected" | "Follow-up Ready" | "Qualified";

type Contact = {
  id: string;
  name: string;
  phone: string;
  campaign: string;
  callStatus: ContactStatus;
  qualificationResult: string;
};

const contacts: Contact[] = [
  {
    id: "1",
    name: "Aarav Malhotra",
    phone: "+91 90000 00111",
    campaign: "Premium Buyer Outreach",
    callStatus: "Connected",
    qualificationResult: "Interested in a 3BHK site visit",
  },
  {
    id: "2",
    name: "Nisha Verma",
    phone: "+91 90000 00222",
    campaign: "Weekend Investor Drive",
    callStatus: "Follow-up Ready",
    qualificationResult: "Requested pricing details",
  },
  {
    id: "3",
    name: "Vikram Singh",
    phone: "+91 90000 00333",
    campaign: "Festival Lead Follow-up",
    callStatus: "Qualified",
    qualificationResult: "Ready for project walkthrough",
  },
];

export default function ContactListScreen() {
  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={["#061024", ENTERPRISE_THEME.panel, ENTERPRISE_THEME.page]}
        style={styles.backgroundGradient}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Contacts</Text>
            <Text style={styles.subtitle}>
              Unified contact intelligence with campaign context, call status, and qualification outcomes.
            </Text>
          </View>
          <Pressable style={styles.importButton}>
            <Text style={styles.importButtonText}>Import Contacts</Text>
          </Pressable>
        </View>

        <View style={styles.tableWrap}>
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, styles.colName]}>Name</Text>
            <Text style={[styles.headerText, styles.colPhone]}>Phone</Text>
            <Text style={[styles.headerText, styles.colCampaign]}>Campaign</Text>
            <Text style={[styles.headerText, styles.colStatus]}>Call Status</Text>
            <Text style={[styles.headerText, styles.colResult]}>Qualification Result</Text>
          </View>

          {contacts.map((contact) => (
            <View key={contact.id} style={styles.tableRow}>
              <Text style={[styles.cellText, styles.colName]}>{contact.name}</Text>
              <Text style={[styles.cellText, styles.colPhone]}>{contact.phone}</Text>
              <Text style={[styles.cellText, styles.colCampaign]}>{contact.campaign}</Text>
              <View style={[styles.colStatus, styles.statusPillWrap]}>
                <View style={styles.statusPill}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>{contact.callStatus}</Text>
                </View>
              </View>
              <Text style={[styles.cellText, styles.colResult]}>{contact.qualificationResult}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.helperMessage}>Campaign performance insights will appear here as contact volume grows.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pageWrap: {
    flex: 1,
    backgroundColor: ENTERPRISE_THEME.page,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 20,
    paddingBottom: 44,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  title: {
    color: ENTERPRISE_THEME.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 14,
    marginTop: 6,
    maxWidth: 760,
  },
  importButton: {
    backgroundColor: ENTERPRISE_THEME.gold,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  importButtonText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "700",
  },
  tableWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    backgroundColor: "rgba(10, 19, 36, 0.62)",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tableHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201, 168, 76, 0.2)",
    paddingBottom: 10,
    rowGap: 8,
  },
  tableRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(201, 168, 76, 0.1)",
    paddingVertical: 12,
    rowGap: 8,
  },
  headerText: {
    color: ENTERPRISE_THEME.gold,
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  cellText: {
    color: ENTERPRISE_THEME.text,
    fontSize: 13,
  },
  colName: {
    width: 190,
  },
  colPhone: {
    width: 150,
  },
  colCampaign: {
    width: 220,
  },
  colStatus: {
    width: 160,
  },
  colResult: {
    flex: 1,
    minWidth: 230,
  },
  statusPillWrap: {
    justifyContent: "center",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(34, 197, 94, 0.35)",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: ENTERPRISE_THEME.success,
  },
  statusText: {
    color: ENTERPRISE_THEME.success,
    fontSize: 11,
    fontWeight: "700",
  },
  helperMessage: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 13,
  },
});
