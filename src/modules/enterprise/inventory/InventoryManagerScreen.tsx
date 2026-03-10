import { useState } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

type InventoryStatus = "Active" | "Disabled";

type InventoryRecord = {
  inventoryId: string;
  clientId: string;
  projectName: string;
  location: string;
  priceMin: string;
  priceMax: string;
  bhk: string;
  status: InventoryStatus;
  updatedAt: string;
};

const initialInventory: InventoryRecord[] = [
  {
    inventoryId: "inv_1",
    clientId: "client_demo",
    projectName: "DLF New Gurgaon",
    location: "Sector 76 Gurgaon",
    priceMin: "80L",
    priceMax: "1.2Cr",
    bhk: "3 BHK",
    status: "Active",
    updatedAt: "12 Mar 2026",
  },
];

const emptyForm = {
  projectName: "",
  location: "",
  priceMin: "",
  priceMax: "",
  bhk: "",
  status: "Active" as InventoryStatus,
};

export default function InventoryManagerScreen() {
  const [inventory, setInventory] = useState<InventoryRecord[]>(initialInventory);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const handleOpenAddInventory = () => {
    setForm(emptyForm);
    setIsAddModalVisible(true);
  };

  const handleSaveInventory = () => {
    const newRecord: InventoryRecord = {
      inventoryId: `inv_${Date.now()}`,
      clientId: "client_local",
      projectName: form.projectName.trim() || "Untitled Project",
      location: form.location.trim() || "Unknown Location",
      priceMin: form.priceMin.trim() || "0",
      priceMax: form.priceMax.trim() || "0",
      bhk: form.bhk.trim() || "N/A",
      status: form.status,
      updatedAt: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };

    setInventory((prev) => [newRecord, ...prev]);
    setIsAddModalVisible(false);
    setForm(emptyForm);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inventory Manager</Text>

      {/*
        Future backend integration (Firestore):
        Collection: enterprise_inventory
        Fields:
        - inventoryId
        - clientId
        - projectName
        - location
        - priceMin
        - priceMax
        - bhk
        - status
        - updatedAt
      */}

      <View style={styles.actionBar}>
        <Pressable onPress={handleOpenAddInventory} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Add Inventory</Text>
        </Pressable>

        <Pressable disabled style={styles.disabledButton}>
          <Text style={styles.disabledButtonText}>Import CSV</Text>
        </Pressable>
      </View>

      <View style={styles.tableCard}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.colProject]}>Project Name</Text>
              <Text style={[styles.headerCell, styles.colLocation]}>Location</Text>
              <Text style={[styles.headerCell, styles.colPrice]}>Price Range</Text>
              <Text style={[styles.headerCell, styles.colBhk]}>BHK</Text>
              <Text style={[styles.headerCell, styles.colStatus]}>Status</Text>
              <Text style={[styles.headerCell, styles.colUpdated]}>Last Updated</Text>
              <Text style={[styles.headerCell, styles.colActions]}>Actions</Text>
            </View>

            {inventory.map((item) => (
              <View key={item.inventoryId} style={styles.bodyRow}>
                <Text style={[styles.bodyCell, styles.colProject]}>{item.projectName}</Text>
                <Text style={[styles.bodyCell, styles.colLocation]}>{item.location}</Text>
                <Text style={[styles.bodyCell, styles.colPrice]}>
                  {`Rs${item.priceMin} - Rs${item.priceMax}`}
                </Text>
                <Text style={[styles.bodyCell, styles.colBhk]}>{item.bhk}</Text>
                <Text style={[styles.bodyCell, styles.colStatus]}>{item.status}</Text>
                <Text style={[styles.bodyCell, styles.colUpdated]}>{item.updatedAt}</Text>
                <Text style={[styles.bodyCell, styles.colActions]}>Edit | Disable</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={isAddModalVisible}
        onRequestClose={() => setIsAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Inventory</Text>

            <TextInput
              value={form.projectName}
              onChangeText={(value: string) =>
                setForm((prev) => ({ ...prev, projectName: value }))
              }
              placeholder="Project Name"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
            <TextInput
              value={form.location}
              onChangeText={(value: string) =>
                setForm((prev) => ({ ...prev, location: value }))
              }
              placeholder="Location"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
            <TextInput
              value={form.priceMin}
              onChangeText={(value: string) =>
                setForm((prev) => ({ ...prev, priceMin: value }))
              }
              placeholder="Minimum Price"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
            <TextInput
              value={form.priceMax}
              onChangeText={(value: string) =>
                setForm((prev) => ({ ...prev, priceMax: value }))
              }
              placeholder="Maximum Price"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />
            <TextInput
              value={form.bhk}
              onChangeText={(value: string) => setForm((prev) => ({ ...prev, bhk: value }))}
              placeholder="BHK"
              placeholderTextColor="#94A3B8"
              style={styles.input}
            />

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <View style={styles.statusButtonsWrap}>
                <Pressable
                  onPress={() => setForm((prev) => ({ ...prev, status: "Active" }))}
                  style={[
                    styles.statusButton,
                    form.status === "Active" && styles.statusButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      form.status === "Active" && styles.statusButtonTextActive,
                    ]}
                  >
                    Active
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setForm((prev) => ({ ...prev, status: "Disabled" }))}
                  style={[
                    styles.statusButton,
                    form.status === "Disabled" && styles.statusButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      form.status === "Disabled" && styles.statusButtonTextActive,
                    ]}
                  >
                    Disabled
                  </Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable onPress={handleSaveInventory} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Save</Text>
              </Pressable>

              <Pressable
                onPress={() => setIsAddModalVisible(false)}
                style={styles.secondaryButton}
              >
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
  actionBar: {
    flexDirection: "row",
    gap: 10,
  },
  primaryButton: {
    backgroundColor: "#0F766E",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  disabledButtonText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },
  tableCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DCE3EE",
    padding: 12,
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
  colProject: {
    width: 150,
  },
  colLocation: {
    width: 170,
  },
  colPrice: {
    width: 140,
  },
  colBhk: {
    width: 80,
  },
  colStatus: {
    width: 90,
  },
  colUpdated: {
    width: 120,
  },
  colActions: {
    width: 120,
  },
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
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D3DCE8",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  statusRow: {
    marginTop: 2,
    gap: 8,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },
  statusButtonsWrap: {
    flexDirection: "row",
    gap: 8,
  },
  statusButton: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
  },
  statusButtonActive: {
    borderColor: "#0F766E",
    backgroundColor: "#E6FFFA",
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  statusButtonTextActive: {
    color: "#0F766E",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
});
