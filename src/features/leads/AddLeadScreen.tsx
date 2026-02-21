import { AppButton } from '@/src/components/ui/AppButton';
import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { AppInput } from '@/src/components/ui/AppInput';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAddLead } from './useAddLead';

export default function AddLeadScreen() {
  const { colors } = useAppTheme();
  const {
    phone,
    leads,
    reviewMode,
    handlePhoneChange,
    handleAddLead,
    handleRemoveLead,
    handleReview,
    handleConfirm,
    setReviewMode,
  } = useAddLead();

  if (reviewMode) {
    return (
      <ScreenContainer>
        <View style={styles.reviewContainer}>
          <AppHeader title={`Review ${leads.length} Contact${leads.length !== 1 ? 's' : ''}`} subtitle="Create a batch from these contacts" />
          <ScrollView style={styles.reviewList}>
            {leads.map((lead) => (
              <AppCard key={lead.id} style={styles.leadCard}>
                <Text style={[styles.leadPhone, { color: colors.text }]}>{lead.phone}</Text>
              </AppCard>
            ))}
          </ScrollView>
          <View style={styles.reviewActions}>
            <AppButton title="✓ Create Batch" onPress={handleConfirm} />
            <AppButton title="Cancel" variant="ghost" onPress={() => setReviewMode(false)} />
          </View>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppHeader title="Add Leads" subtitle="Enter lead details and review before submitting" />

        <View style={styles.container}>
          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Add new lead</Text>
            <AppInput
              placeholder="+91 98765 43210"
              value={phone}
              onChangeText={handlePhoneChange}
              containerStyle={styles.input}
              keyboardType="phone-pad"
              maxLength={13}
            />
            <AppButton title="+ Add Lead" onPress={handleAddLead} />
          </View>

          {/* Leads List Section */}
          {leads.length > 0 && (
            <View style={styles.listSection}>
              <View style={styles.listHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Added leads ({leads.length})
                </Text>
              </View>
              <ScrollView style={styles.listScroll} nestedScrollEnabled>
                {leads.map((lead) => (
                  <AppCard key={lead.id} style={styles.leadCard}>
                    <View style={styles.leadContent}>
                      <Text style={[styles.leadPhone, { color: colors.text }]}>{lead.phone}</Text>
                    </View>
                    <Pressable
                      onPress={() => handleRemoveLead(lead.id)}
                      style={[styles.removeButton, { backgroundColor: colors.danger }]}
                      accessibilityRole="button"
                    >
                      <Ionicons name="trash-bin" size={18} color="white" />
                    </Pressable>
                  </AppCard>
                ))}
              </ScrollView>

              {/* Review Button */}
              <View style={styles.reviewButtonContainer}>
                <AppButton
                  title="Review All Leads"
                  onPress={handleReview}
                  variant="primary"
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  container: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 12,
  },
  input: {
    marginBottom: 12,
  },
  listSection: {
    marginBottom: 24,
  },
  listHeader: {
    marginBottom: 12,
  },
  listScroll: {
    maxHeight: 300,
    marginBottom: 12,
  },
  leadCard: {
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  leadContent: {
    flex: 1,
  },
  leadName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  leadPhone: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  leadMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewButtonContainer: {
    marginTop: 12,
  },
  reviewContainer: {
    flex: 1,
    padding: 16,
  },
  reviewList: {
    flex: 1,
    marginVertical: 16,
  },
  reviewActions: {
    gap: 12,
    paddingVertical: 16,
  },
});
