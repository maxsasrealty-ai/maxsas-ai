import { Slot, usePathname, useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { ENTERPRISE_THEME } from "@/src/modules/enterprise/components/enterpriseTheme";

const TABS = [
  { label: "Dashboard", route: "/(enterprise)/dashboard" },
  { label: "Campaigns", route: "/(enterprise)/campaigns" },
  { label: "Contacts", route: "/(enterprise)/contacts" },
  { label: "Wallet", route: "/(enterprise)/wallet" },
  { label: "Transactions", route: "/(enterprise)/transactions" },
  { label: "Profile", route: "/(enterprise)/profile" },
] as const;

export default function EnterpriseLayout() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.layoutWrap}>
      <View style={styles.topBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {TABS.map((tab) => {
            const isActive = pathname === tab.route;

            return (
              <Pressable
                key={tab.route}
                onPress={() => router.replace(tab.route)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.slotWrap}>
        <Slot />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  layoutWrap: {
    flex: 1,
    backgroundColor: ENTERPRISE_THEME.page,
  },
  topBar: {
    borderBottomWidth: 1,
    borderBottomColor: ENTERPRISE_THEME.border,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: "rgba(4, 10, 22, 0.95)",
  },
  tabsContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  tabButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(201, 168, 76, 0.25)",
    backgroundColor: "rgba(13, 26, 49, 0.8)",
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tabButtonActive: {
    borderColor: "rgba(34, 197, 94, 0.4)",
    backgroundColor: "rgba(34, 197, 94, 0.2)",
  },
  tabText: {
    color: ENTERPRISE_THEME.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  tabTextActive: {
    color: ENTERPRISE_THEME.success,
  },
  slotWrap: {
    flex: 1,
  },
});
