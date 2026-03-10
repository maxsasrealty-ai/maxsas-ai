import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/src/context/AuthContext";
import ProfileSection from "@/src/modules/enterprise/components/ProfileSection";
import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

export default function EnterpriseProfileScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      await logout();
      router.replace("/");
    } catch {
      router.replace("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <View style={styles.pageWrap}>
      <LinearGradient
        colors={["#061024", ENTERPRISE_THEME.panel, ENTERPRISE_THEME.page]}
        style={styles.backgroundGradient}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.subtitle}>Client account settings and support touchpoints for enterprise operations.</Text>

        <ProfileSection
          title="Account Details"
          fields={[
            { label: "Company Name", value: "Maxsas Realty" },
            { label: "Account Email", value: "enterprise@maxsas.ai" },
            { label: "Contact Person", value: "Anubhav Chaudhary" },
            { label: "Phone Number", value: "+91 90000 00444" },
            { label: "Client ID", value: "ENT-CLIENT-1024" },
          ]}
        />

        <ProfileSection
          title="Billing Information"
          fields={[
            { label: "Plan", value: "Enterprise Growth" },
            { label: "Billing Cycle", value: "Monthly" },
            { label: "Payment Method", value: "Razorpay Business" },
          ]}
        />

        <ProfileSection
          title="Support Contact"
          fields={[
            { label: "Support Email", value: "support@maxsas.ai" },
            { label: "Support Line", value: "+91 90000 00555" },
            { label: "Success Manager", value: "Assigned and Active" },
          ]}
        />

        <Pressable onPress={handleLogout} disabled={isLoggingOut} style={styles.logoutButton}>
          <Text style={styles.logoutButtonText}>{isLoggingOut ? "Logging out..." : "Logout"}</Text>
        </Pressable>
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
  title: {
    color: ENTERPRISE_THEME.text,
    fontSize: 30,
    fontWeight: "800",
  },
  subtitle: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "rgba(34, 197, 94, 0.35)",
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  logoutButtonText: {
    color: ENTERPRISE_THEME.success,
    fontSize: 14,
    fontWeight: "700",
  },
});
