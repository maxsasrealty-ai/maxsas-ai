import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

type ProfileField = {
  label: string;
  value: string;
};

type ProfileSectionProps = {
  title: string;
  fields: ProfileField[];
};

export default function ProfileSection({ title, fields }: ProfileSectionProps) {
  return (
    <LinearGradient colors={[ENTERPRISE_THEME.cardStart, ENTERPRISE_THEME.cardEnd]} style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {fields.map((field) => (
        <View key={field.label} style={styles.row}>
          <Text style={styles.label}>{field.label}</Text>
          <Text style={styles.value}>{field.value}</Text>
        </View>
      ))}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: ENTERPRISE_THEME.border,
    padding: 14,
    gap: 10,
  },
  title: {
    color: ENTERPRISE_THEME.text,
    fontSize: 17,
    fontWeight: "700",
  },
  row: {
    borderTopWidth: 1,
    borderTopColor: "rgba(201, 168, 76, 0.12)",
    paddingTop: 10,
    gap: 3,
  },
  label: {
    color: ENTERPRISE_THEME.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  value: {
    color: ENTERPRISE_THEME.text,
    fontSize: 14,
    fontWeight: "500",
  },
});
