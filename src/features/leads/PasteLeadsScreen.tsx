/**
 * Paste from Clipboard Screen
 * Users can paste text with phone numbers
 * Cross-platform: Android, iOS, Web
 */

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Keyboard,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import { AppButton } from '@/src/components/ui/AppButton';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useBatch } from '@/src/context/BatchContext';
import type { ExtractedLead } from '@/src/lib/phoneExtractor';
import { extractPhoneNumbers, formatPhoneForDisplay } from '@/src/lib/phoneExtractor';
import { useAppTheme } from '@/src/theme/use-app-theme';

export default function PasteLeadsScreen() {
  const { colors } = useAppTheme();
  const { createLocalBatch } = useBatch();
  const [pastedText, setPastedText] = useState('');
  const [extractedLeads, setExtractedLeads] = useState<ExtractedLead[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleExtractFromText = () => {
    if (!pastedText.trim()) {
      Alert.alert('Empty Text', 'Please paste or type some text first');
      return;
    }

    setIsProcessing(true);
    try {
      const result = extractPhoneNumbers(pastedText, 'clipboard');

      if (result.leads.length === 0) {
        Alert.alert(
          'No Numbers Found',
          `No phone numbers found in the text.\n\nInvalid entries: ${result.invalidCount}`
        );
        return;
      }

      setExtractedLeads(result.leads);
      setShowPreview(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to extract phone numbers');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveLead = (index: number) => {
    setExtractedLeads(extractedLeads.filter((_, i) => i !== index));
  };

  const handleProceedToReview = async () => {
    Keyboard.dismiss();

    if (extractedLeads.length === 0) {
      Alert.alert('No leads', 'No phone numbers extracted.');
      return;
    }

    try {
      // Convert leads to contacts format
      const contacts = extractedLeads.map((lead) => ({
        phone: lead.phone,
      }));

      // Create batch in local state (NO Firebase write)
      const batch = createLocalBatch(contacts, 'clipboard', {
        fileName: 'Clipboard Paste',
        uploadedFrom: 'PasteLeadsScreen',
        extractionType: 'manual',
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
  };

  if (showPreview && extractedLeads.length > 0) {
    return (
      <ScreenContainer>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <AppHeader
            title={`Found ${extractedLeads.length} Number${extractedLeads.length !== 1 ? 's' : ''}`}
            subtitle="Review before adding to database"
          />

          <View style={styles.container}>
            <View style={styles.previewList}>
              {extractedLeads.map((lead, index) => (
                <View
                  key={index}
                  style={[
                    styles.previewItem,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.card,
                    },
                  ]}
                >
                  <View style={styles.previewContent}>
                    <Text style={[styles.previewPhone, { color: colors.text }]}>
                      {formatPhoneForDisplay(lead.phone)}
                    </Text>
                    {lead.originalValue && (
                      <Text
                        style={[styles.originalValue, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        Original: {lead.originalValue}
                      </Text>
                    )}
                  </View>
                  <Pressable
                    onPress={() => handleRemoveLead(index)}
                    style={[styles.removeBtn, { backgroundColor: '#FF3B30' }]}
                  >
                    <Ionicons name="trash-bin" size={16} color="white" />
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.actions}>
              <AppButton title="✓ Add All to Database" onPress={handleProceedToReview} />
              <AppButton
                title="← Back to Input"
                variant="ghost"
                onPress={() => {
                  setShowPreview(false);
                  setExtractedLeads([]);
                }}
              />
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppHeader title="Paste Numbers" subtitle="Extract multiple phone numbers from text" />

        <View style={styles.container}>
          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: colors.text }]}>Paste your text here:</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  color: colors.text,
                },
              ]}
              placeholder="Paste text with phone numbers..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={8}
              value={pastedText}
              onChangeText={setPastedText}
            />
            <Text style={[styles.charCount, { color: colors.textMuted }]}>
              {pastedText.length} characters
            </Text>
          </View>

          <View style={styles.actions}>
            <AppButton
              title="🔍 Extract Numbers"
              onPress={handleExtractFromText}
              loading={isProcessing}
              disabled={!pastedText.trim()}
            />
          </View>

          <View
            style={[
              styles.infoBox,
              {
                backgroundColor: colors.info + '10',
                borderColor: colors.info,
              },
            ]}
          >
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.info}
              style={styles.infoIcon}
            />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Supported Formats</Text>
              <Text style={[styles.infoText, { color: colors.textMuted }]}>
                {`• Plain numbers: 9876543210\n`}
                {`• With country code: +91 9876543210\n`}
                {`• With separators: 98765-43210 or 98765.43210\n`}
                {`• Inside text: Call me at 9876543210`}
              </Text>
            </View>
          </View>
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
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  inputSection: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    fontSize: 14,
    fontFamily: 'Menlo',
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
  },
  actions: {
    gap: 12,
    marginBottom: 24,
  },
  previewList: {
    marginTop: 16,
    marginBottom: 24,
    gap: 8,
  },
  previewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewContent: {
    flex: 1,
  },
  previewPhone: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  originalValue: {
    fontSize: 12,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  infoBox: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 24,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
