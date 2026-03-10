import { Feather } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

type TransactionItemProps = {
  date: string;
  type: "Recharge" | "Call Usage" | "Adjustment";
  amount: string;
  referenceId: string;
  status: "Completed" | "Processing";
};

export default function TransactionItem({ date, type, amount, referenceId, status }: TransactionItemProps) {
  const statusColor = status === "Completed" ? ENTERPRISE_THEME.success : ENTERPRISE_THEME.bluePulse;

  return (
    <View style={styles.row}>
      <View style={styles.dateCell}>
        <Text style={styles.date}>{date}</Text>
      </View>
      <View style={styles.typeCell}>
        <Feather name="repeat" size={13} color={ENTERPRISE_THEME.goldSoft} />
        <Text style={styles.valueText}>{type}</Text>
      </View>
      <Text style={styles.valueText}>{amount}</Text>
      <Text style={styles.reference}>{referenceId}</Text>
      <View style={[styles.statusPill, { borderColor: `${statusColor}66`, backgroundColor: `${statusColor}24` }]}>
        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(201, 168, 76, 0.12)",
    paddingVertical: 12,
  },
  dateCell: {
    minWidth: 130,
  },
  typeCell: {
    minWidth: 150,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  date: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 13,
  },
  valueText: {
    color: ENTERPRISE_THEME.text,
    fontSize: 13,
    minWidth: 100,
  },
  reference: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 13,
    minWidth: 150,
    fontFamily: "monospace",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
});
