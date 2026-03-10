import { ScrollView, StyleSheet, Text, View } from "react-native";

const campaignSummary = {
  campaignName: "Gurgaon Investment Leads",
  projectName: "DLF New Gurgaon",
  agentName: "Real Estate Agent v1",
  status: "Active",
  totalContacts: 150,
  callsCompleted: 92,
  qualifiedLeads: 27,
  notInterested: 41,
};

const contactRows = [
  {
    name: "Rahul Sharma",
    phone: "+91XXXXXXXXXX",
    callStatus: "Completed",
    leadClassification: "Not Interested",
    action: "View Call",
  },
  {
    name: "Neha Verma",
    phone: "+91XXXXXXXXXX",
    callStatus: "Completed",
    leadClassification: "Qualified",
    action: "View Call",
  },
];

export default function CampaignDetailScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campaign Detail</Text>

      {/*
        Future backend integration (Firestore):
        Collection: enterprise_campaigns
        Fields:
        - campaignId
        - clientId
        - campaignName
        - projectName
        - agentId
        - status
        - startTime
        - endTime
        - contactCount
        - createdAt
      */}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryMainTitle}>{campaignSummary.campaignName}</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Project</Text>
            <Text style={styles.summaryValue}>{campaignSummary.projectName}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Agent</Text>
            <Text style={styles.summaryValue}>{campaignSummary.agentName}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Status</Text>
            <Text style={styles.summaryValue}>{campaignSummary.status}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Total Contacts</Text>
            <Text style={styles.summaryValue}>{campaignSummary.totalContacts}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Calls Completed</Text>
            <Text style={styles.summaryValue}>{campaignSummary.callsCompleted}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Qualified Leads</Text>
            <Text style={styles.summaryValue}>{campaignSummary.qualifiedLeads}</Text>
          </View>
          <View style={styles.summaryChip}>
            <Text style={styles.summaryLabel}>Not Interested</Text>
            <Text style={styles.summaryValue}>{campaignSummary.notInterested}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.contactsTitle}>Contacts List</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.colName]}>Name</Text>
              <Text style={[styles.headerCell, styles.colPhone]}>Phone</Text>
              <Text style={[styles.headerCell, styles.colStatus]}>Call Status</Text>
              <Text style={[styles.headerCell, styles.colClass]}>Lead Classification</Text>
              <Text style={[styles.headerCell, styles.colAction]}>Actions</Text>
            </View>

            {contactRows.map((row, index) => (
              <View key={`${row.name}-${index}`} style={styles.bodyRow}>
                <Text style={[styles.bodyCell, styles.colName]}>{row.name}</Text>
                <Text style={[styles.bodyCell, styles.colPhone]}>{row.phone}</Text>
                <Text style={[styles.bodyCell, styles.colStatus]}>{row.callStatus}</Text>
                <Text style={[styles.bodyCell, styles.colClass]}>{row.leadClassification}</Text>
                <Text style={[styles.bodyCell, styles.colAction]}>{row.action}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F7FB",
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    backgroundColor: "#FFFFFF",
    padding: 12,
    gap: 10,
  },
  summaryMainTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryChip: {
    width: "48%",
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 10,
    gap: 2,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 14,
    color: "#0F172A",
    fontWeight: "700",
  },
  tableCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    padding: 12,
    gap: 8,
  },
  contactsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 10,
  },
  bodyRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EEF2F7",
    paddingVertical: 11,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
    paddingRight: 10,
  },
  bodyCell: {
    fontSize: 13,
    color: "#0F172A",
    paddingRight: 10,
  },
  colName: { width: 140 },
  colPhone: { width: 130 },
  colStatus: { width: 120 },
  colClass: { width: 140 },
  colAction: { width: 90 },
});
