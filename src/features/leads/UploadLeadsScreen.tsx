import { AppButton } from '@/src/components/ui/AppButton';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { LeadReviewPanel } from '@/src/components/ui/LeadReviewPanel';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { useBatch } from '@/src/context/BatchContext';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useFileUpload } from './useFileUpload';

export default function UploadLeadsScreen() {
  const { loading, pickAndParseFile } = useFileUpload();
  const { createLocalBatch } = useBatch();
  const { requireAuth } = useAuth();
  const [reviewLeads, setReviewLeads] = useState<any[] | null>(null);

  const handleFilePick = async () => {
    requireAuth(async () => {
      const leads = await pickAndParseFile();
      if (leads) {
        setReviewLeads(leads);
      }
    });
  };

  const handleConfirm = async () => {
    requireAuth(async () => {
      if (!reviewLeads || reviewLeads.length === 0) {
        Alert.alert('No leads', 'No leads to import.');
        return;
      }

      try {
        // Convert leads to contacts format
        const contacts = reviewLeads.map((lead) => ({
          phone: lead.phoneRaw || lead.phone,
          name: lead.name,
          email: lead.email,
        }));

        // Create batch in local state (NO Firebase write)
        const batch = createLocalBatch(contacts, 'csv', {
          fileName: 'CSV Upload',
          uploadedFrom: 'UploadLeadsScreen',
          extractionType: 'csv_parser',
        });

        console.log('✅ Batch created locally:', batch.batchId);

        // Redirect to dashboard with success message
        router.replace({
          pathname: '/batch-dashboard',
          params: { successMessage: 'Batch created successfully' },
        });
      } catch (error) {
        console.error('Error creating batch:', error);
        Alert.alert('Error', 'Failed to create batch. Please try again.');
      }
    });
  };

  return (
    <ScreenContainer>
      {reviewLeads ? (
        <>
          <AppHeader title={`Found ${reviewLeads.length} Contacts`} subtitle="Review before creating batch" />
          <View style={styles.previewContainer}>
            <LeadReviewPanel
              leads={reviewLeads}
              onConfirm={handleConfirm}
              onCancel={() => setReviewLeads(null)}
              loading={false}
            />
          </View>
        </>
      ) : (
        <>
          <AppHeader title="Upload Leads" subtitle="Import leads from a CSV or Excel file" />
          <View style={styles.container}>
            <AppButton
              title={loading ? 'Processing...' : 'Select File'}
              onPress={handleFilePick}
              disabled={loading}
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  previewContainer: {
    flex: 1,
    padding: 16,
  },
});

