/**
 * Image Import Screen
 * Allows users to upload screenshots/images and extract phone numbers using Gemini AI
 * 
 * Flow:
 * 1. User selects image from gallery
 * 2. Image is sent to Gemini API for OCR
 * 3. Extracted phone numbers are shown in preview
 * 4. User can review and save numbers to Firebase
 */

import { AppButton } from '@/src/components/ui/AppButton';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAuth } from '@/src/context/AuthContext';
import { useBatch } from '@/src/context/BatchContext';
import { formatPhoneForDisplay } from '@/src/lib/phoneExtractor';
import type { ExtractedPhoneFromImage } from '@/src/services/geminiExtractor';
import { createGeminiExtractorWithKey } from '@/src/services/geminiExtractor';
import { useAppTheme } from '@/src/theme/use-app-theme';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

type Lead = {
  id: string;
  phone: string;
  phoneRaw: string;
  source: string;
  confidence?: number;
};

export default function ImageImportScreen() {
  const { colors } = useAppTheme();
  const { createLocalBatch } = useBatch();
  const { requireAuth } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [extractedPhones, setExtractedPhones] = useState<ExtractedPhoneFromImage[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [processTime, setProcessTime] = useState<number>(0);

  /**
   * Pick image from device gallery
   */
  const pickImage = async () => {
    requireAuth(async () => {
      try {
        // Request image picker permissions
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
          Alert.alert(
            'Permission Required',
            'Please allow access to your photo gallery to upload images.',
            [{ text: 'OK' }]
          );
          return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          quality: 0.8,
          base64: true, // IMPORTANT: Get base64 data directly
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];

          if (!asset.base64) {
            Alert.alert('Error', 'Could not read image. Please try another image.');
            return;
          }

          console.log('✅ Image selected:', {
            size: asset.width && asset.height ? `${asset.width}x${asset.height}` : 'unknown',
            uri: asset.uri,
            base64Length: asset.base64.length,
          });

          setSelectedImage(asset.uri);
          setErrorMessage('');

          // Auto-extract phone numbers after image selection
          await extractPhonesFromImage(asset.base64, asset.mimeType || 'image/jpeg');
        }
      } catch (error) {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to pick image. Please try again.');
      }
    });
  };

  /**
   * Send image to Gemini API for phone number extraction
   */
  const extractPhonesFromImage = async (base64Data: string, mimeType: string) => {
    setExtracting(true);
    setErrorMessage('');
    const startTime = Date.now();

    try {
      console.log('🚀 Starting phone extraction from image...');

      // Initialize Gemini extractor with API key
      // Note: API key should be in environment variable EXPO_PUBLIC_GEMINI_API_KEY
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyC7zB8i08EsfZSt87Dsg32MiKzlHo_qU4A';
      
      if (!apiKey) {
        throw new Error('Gemini API key not configured');
      }

      const extractor = createGeminiExtractorWithKey(apiKey);
      const result = await extractor.extractPhoneNumbers(base64Data, mimeType);

      const processTimeMs = Date.now() - startTime;
      setProcessTime(processTimeMs);

      console.log('📊 Extraction result:', result);

      if (!result.success && result.phones.length === 0) {
        setErrorMessage(result.error || 'No phone numbers found in the image');
        setExtractedPhones([]);
        setShowPreview(false);
        
        Alert.alert(
          'No Numbers Found',
          result.error || 'Could not find any valid Indian phone numbers in this image.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Convert to leads format
      const newLeads = result.phones.map((phone) => ({
        id: `lead_${Date.now()}_${Math.random()}`,
        phone: formatPhoneForDisplay(phone.phone),
        phoneRaw: phone.phone,
        source: 'image',
        confidence: phone.confidence,
      }));

      setExtractedPhones(result.phones);
      setLeads(newLeads);
      setShowPreview(true);

      console.log(`✅ Extracted ${newLeads.length} phone numbers in ${processTimeMs}ms`);
    } catch (error) {
      console.error('❌ Error extracting phones:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to extract phone numbers';
      setErrorMessage(errorMsg);
      Alert.alert('Extraction Error', errorMsg, [{ text: 'OK' }]);
    } finally {
      setExtracting(false);
    }
  };

  /**
   * Remove a lead from the preview
   */
  const removeLead = (id: string) => {
    const updated = leads.filter((l) => l.id !== id);
    setLeads(updated);

    if (updated.length === 0) {
      setShowPreview(false);
    }
  };

  /**
   * PHASE 1 - Create batch and redirect to dashboard
   * (NO Firebase write happens here)
   */
  const handleCreateBatch = () => {
    requireAuth(() => {
      if (leads.length === 0) {
        Alert.alert('No leads', 'Please extract at least one lead to create a batch.');
        return;
      }

      // Create contacts from leads
      const contacts = leads.map((lead) => ({
        phone: lead.phoneRaw,
        confidence: lead.confidence,
      }));

      // Create batch in local state (no Firebase write)
      const batch = createLocalBatch(contacts, 'image', {
        fileName: `Image_${new Date().toISOString()}`,
        uploadedFrom: 'ImageImportScreen',
        extractionType: 'ai',
      });

      console.log('✅ Batch created locally:', batch.batchId);

      // Redirect to dashboard with success message
      router.replace({
        pathname: '/batch-dashboard',
        params: { successMessage: 'Batch created successfully' },
      });
    });
  };

  // Preview Screen - Show extracted numbers
  if (showPreview && leads.length > 0) {
    return (
      <ScreenContainer>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header with Image Thumbnail */}
          <View style={styles.previewHeader}>
            {selectedImage && (
              <Image
                source={{ uri: selectedImage }}
                style={styles.thumbnailImage}
              />
            )}
            <View style={styles.previewTitleSection}>
              <View style={[styles.aiBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.aiBadgeText}>🤖 AI Extracted</Text>
              </View>
              <AppHeader
                title={`Found ${leads.length} Number${leads.length !== 1 ? 's' : ''}`}
                subtitle={`Extracted in ${processTime}ms`}
              />
            </View>
          </View>

          {/* Confidence Info */}
          {extractedPhones.length > 0 && (
            <View style={[styles.infoBox, { backgroundColor: colors.background }]}>
              <Ionicons name="information-circle" size={16} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textMuted }]}>
                Numbers extracted with AI confidence scores. Review before saving.
              </Text>
            </View>
          )}

          {/* Extracted Numbers List */}
          <View style={styles.container}>
            <ScrollView nestedScrollEnabled style={styles.numbersList}>
              {leads.map((lead, index) => {
                const phoneData = extractedPhones.find((p) => p.phone === lead.phoneRaw);
                const confidence = phoneData?.confidence || 1;

                return (
                  <View key={lead.id} style={styles.numberCard}>
                    <View style={styles.numberContent}>
                      <View style={styles.numberHeader}>
                        <Text style={[styles.index, { color: colors.primary }]}>
                          {index + 1}
                        </Text>
                        <Text style={[styles.number, { color: colors.text }]}>
                          {lead.phone}
                        </Text>
                      </View>

                      {/* Confidence Badge */}
                      <View style={styles.confidenceContainer}>
                        <View
                          style={[
                            styles.confidenceBadge,
                            {
                              backgroundColor:
                                confidence > 0.9
                                  ? '#4CAF50'
                                  : confidence > 0.7
                                    ? '#FFC107'
                                    : '#FF9800',
                            },
                          ]}
                        >
                          <Text style={styles.confidenceText}>
                            {Math.round(confidence * 100)}% confidence
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Remove Button */}
                    <Pressable
                      onPress={() => removeLead(lead.id)}
                      style={[styles.removeButton, { backgroundColor: colors.danger }]}
                    >
                      <Ionicons name="close" size={18} color="white" />
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Action Buttons - PHASE 1 CHANGE: Create Batch Instead of Save */}
          <View style={styles.actions}>
            <AppButton
              title={`📱 Create Batch (${leads.length} Number${leads.length !== 1 ? 's' : ''})`}
              onPress={handleCreateBatch}
            />
          </View>

          <View style={styles.actions}>
            <AppButton
              title="Back to Image"
              onPress={() => setShowPreview(false)}
              variant="ghost"
            />
            <View style={styles.actionGap} />
            <AppButton
              title="Cancel"
              onPress={() => {
                setLeads([]);
                setSelectedImage(null);
                setExtractedPhones([]);
                setShowPreview(false);
              }}
              variant="ghost"
            />
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  // Main Screen - Image Selection
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppHeader
          title="Upload from Gallery"
          subtitle="Select an image to extract phone numbers using AI"
        />

        <View style={styles.container}>
          {/* Image Preview */}
          {selectedImage ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.image}
                resizeMode="contain"
              />
              <Pressable
                onPress={() => {
                  setSelectedImage(null);
                  setExtractedPhones([]);
                  setLeads([]);
                  setShowPreview(false);
                  setErrorMessage('');
                }}
                style={[styles.clearButton, { backgroundColor: colors.danger }]}
              >
                <Ionicons name="close" size={20} color="white" />
                <Text style={styles.clearButtonText}>Clear</Text>
              </Pressable>
            </View>
          ) : (
            <View
              style={[
                styles.imagePlaceholder,
                { backgroundColor: colors.card },
              ]}
            >
              <Ionicons name="image-outline" size={64} color={colors.textMuted} />
              <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
                No image selected
              </Text>
            </View>
          )}

          {/* Loading State */}
          {extracting && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.text }]}>
                🤖 Extracting phone numbers with AI...
              </Text>
              <Text style={[styles.processingHint, { color: colors.textMuted }]}>
                This may take a few seconds
              </Text>
            </View>
          )}

          {/* Error Message */}
          {errorMessage && !extracting && (
            <View style={[styles.errorBox, { backgroundColor: colors.danger + '20' }]}>
              <Ionicons name="alert-circle" size={20} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>
                {errorMessage}
              </Text>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonGroup}>
            <AppButton
              title={extracting ? 'Processing...' : '📷 Select Image from Gallery'}
              onPress={pickImage}
              disabled={extracting}
            />
          </View>

          {/* Info Section */}
          <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              How it works:
            </Text>
            <Text style={[styles.infoItem, { color: colors.textMuted }]}>
              ✅ Select a screenshot or image from your gallery
            </Text>
            <Text style={[styles.infoItem, { color: colors.textMuted }]}>
              ✅ AI automatically scans the image for phone numbers
            </Text>
            <Text style={[styles.infoItem, { color: colors.textMuted }]}>
              ✅ Only Indian mobile numbers (6-9 start) are extracted
            </Text>
            <Text style={[styles.infoItem, { color: colors.textMuted }]}>
              ✅ Review and save the extracted numbers
            </Text>
          </View>

          {/* Supported Formats */}
          <View style={[styles.infoSection, { backgroundColor: colors.card }]}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              Works with:
            </Text>
            <Text style={[styles.infoItem, { color: colors.textMuted }]}>
              📸 Screenshots of contact lists
            </Text>
            <Text style={[styles.infoItem, { color: colors.textMuted }]}>
              📋 Business cards with phone numbers
            </Text>
            <Text style={[styles.infoItem, { color: colors.textMuted }]}>
              📄 Documents containing phone numbers
            </Text>
            <Text style={[styles.infoItem, { color: colors.textMuted }]}>
              🖼️ Any image with visible phone numbers
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  container: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: 300,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  clearButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  imagePlaceholder: {
    height: 200,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#ccc',
  },
  placeholderText: {
    fontSize: 16,
    marginTop: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  processingHint: {
    fontSize: 14,
    marginTop: 8,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 12,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  buttonGroup: {
    marginVertical: 16,
    gap: 12,
  },
  numbersList: {
    maxHeight: 400,
  },
  previewHeader: {
    marginBottom: 20,
  },
  thumbnailImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    resizeMode: 'cover',
  },
  previewTitleSection: {
    paddingHorizontal: 16,
  },
  aiBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  aiBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  numberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  numberContent: {
    flex: 1,
  },
  numberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  index: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 24,
  },
  number: {
    fontSize: 16,
    fontWeight: '600',
  },
  confidenceContainer: {
    marginTop: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  confidenceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actions: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  actionGap: {
    height: 8,
  },
  infoSection: {
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 13,
    marginBottom: 6,
    lineHeight: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
  },
});
