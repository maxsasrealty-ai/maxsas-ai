/**
 * Complete Example: Using Gemini Image Extraction in Your App
 * 
 * This file shows all ways to use the image extraction feature
 * Copy and modify for your use case
 */

// ============================================================================
// EXAMPLE 1: Basic Usage in a Component
// ============================================================================

import { formatPhoneForDisplay, validatePhoneWithMessage } from '@/src/lib/phoneExtractor';
import { createGeminiExtractorWithKey } from '@/src/services/geminiExtractor';

export const basicUsageExample = async (base64Image: string) => {
  try {
    // Initialize extractor
    const apiKey = 'AIzaSyC7zB8i08EsfZSt87Dsg32MiKzlHo_qU4A';
    const extractor = createGeminiExtractorWithKey(apiKey);

    // Extract phone numbers
    const result = await extractor.extractPhoneNumbers(base64Image, 'image/jpeg');

    // Check if extraction was successful
    if (result.success) {
      console.log(`✅ Found ${result.phones.length} phone numbers`);

      // Process each phone
      result.phones.forEach((phone) => {
        console.log(
          `📱 ${formatPhoneForDisplay(phone.phone)} (${Math.round(phone.confidence * 100)}%)`
        );
      });

      return result.phones;
    } else {
      console.error('❌ Extraction failed:', result.error);
      return [];
    }
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};

// ============================================================================
// EXAMPLE 2: Using in React Component with Loading State
// ============================================================================

import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, View } from 'react-native';

export function ImageExtractionExample() {
  const [extracting, setExtracting] = useState(false);
  const [extractedPhones, setExtractedPhones] = useState<string[]>([]);

  const handleImagePick = async () => {
    try {
      // Get permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Permission required');
        return;
      }

      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setExtracting(true);

        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
        const extractor = createGeminiExtractorWithKey(apiKey);

        const extractionResult = await extractor.extractPhoneNumbers(
          result.assets[0].base64,
          result.assets[0].mimeType || 'image/jpeg'
        );

        if (extractionResult.success) {
          const phones = extractionResult.phones.map((p) => p.phone);
          setExtractedPhones(phones);
          Alert.alert(`Found ${phones.length} phone numbers`);
        } else {
          Alert.alert('Error', extractionResult.error);
        }
      }
    } finally {
      setExtracting(false);
    }
  };

  return (
    <View>
      <Button title="Pick Image" onPress={handleImagePick} disabled={extracting} />
      {extracting && <ActivityIndicator />}
      {extractedPhones.map((phone: string) => (
        <Text key={phone}>{formatPhoneForDisplay(phone)}</Text>
      ))}
    </View>
  );
}

// ============================================================================
// EXAMPLE 3: Advanced - Custom Validation with Firebase Save
// ============================================================================
// ⚠️ DEPRECATED: This example uses the old addLead() function which is no longer supported.
// All leads must now be created through the batch system.
// See BatchContext and batchService for the correct approach.

import { addLead } from '@/src/lib/firebase';

/**
 * @deprecated This function demonstrates the old approach which is no longer supported.
 * Use BatchContext.createLocalBatch() and saveBatchToFirebase() instead.
 */
export const advancedExtractionWithSave = async (
  base64Image: string,
  userId: string
) => {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    const extractor = createGeminiExtractorWithKey(apiKey);

    // Extract numbers
    const result = await extractor.extractPhoneNumbers(base64Image, 'image/jpeg');

    if (!result.success || result.phones.length === 0) {
      return {
        success: false,
        error: result.error || 'No numbers found',
        savedCount: 0,
      };
    }

    // Validate each number with custom rules
    const validLeads = result.phones
      .filter((phone) => {
        // Only accept high confidence numbers
        if (phone.confidence < 0.7) {
          console.warn(`Low confidence: ${phone.phone} (${phone.confidence})`);
          return false;
        }

        // Validate format
        const validation = validatePhoneWithMessage(phone.phone);
        return validation.valid;
      })
      .map((phone) => ({
        phone: phone.phone,
        source: 'image',
        confidence: phone.confidence,
        uploadedBy: userId,
        uploadedAt: new Date().toISOString(),
      }));

    // Save to Firebase
    const savePromises = validLeads.map((lead) => addLead(lead));
    const results = await Promise.allSettled(savePromises);

    const successCount = results.filter((r) => r.status === 'fulfilled').length;
    const failedCount = results.filter((r) => r.status === 'rejected').length;

    return {
      success: successCount > 0,
      savedCount: successCount,
      failedCount,
      leads: validLeads,
    };
  } catch (error) {
    return {
      success: false,
      error: String(error),
      savedCount: 0,
    };
  }
};

// ============================================================================
// EXAMPLE 4: Error Handling & Retry Logic
// ============================================================================

export const extractWithRetry = async (
  base64Image: string,
  maxRetries: number = 3
) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}...`);

      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
      const extractor = createGeminiExtractorWithKey(apiKey);

      const result = await extractor.extractPhoneNumbers(base64Image, 'image/jpeg');

      if (result.success) {
        console.log(`✅ Success on attempt ${attempt}`);
        return result;
      }

      // If failed, log and retry
      console.warn(`Attempt ${attempt} failed: ${result.error}`);

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delayMs = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Attempt ${attempt} error:`, error);

      if (attempt === maxRetries) {
        throw error;
      }
    }
  }

  throw new Error(`Failed after ${maxRetries} attempts`);
};

// ============================================================================
// EXAMPLE 5: Batch Processing Multiple Images
// ============================================================================

export const batchProcessImages = async (
  base64Images: string[]
): Promise<{
  totalImages: number;
  totalPhones: number;
  results: Array<{
    imageIndex: number;
    success: boolean;
    phonesFound: number;
    phones: string[];
    error?: string;
  }>;
}> => {
  const results = [];
  let totalPhones = 0;

  for (let i = 0; i < base64Images.length; i++) {
    try {
      console.log(`Processing image ${i + 1}/${base64Images.length}...`);

      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
      const extractor = createGeminiExtractorWithKey(apiKey);

      const result = await extractor.extractPhoneNumbers(base64Images[i], 'image/jpeg');

      if (result.success) {
        const phones = result.phones.map((p) => p.phone);
        totalPhones += phones.length;

        results.push({
          imageIndex: i,
          success: true,
          phonesFound: phones.length,
          phones,
        });
      } else {
        results.push({
          imageIndex: i,
          success: false,
          phonesFound: 0,
          phones: [],
          error: result.error,
        });
      }
    } catch (error) {
      results.push({
        imageIndex: i,
        success: false,
        phonesFound: 0,
        phones: [],
        error: String(error),
      });
    }

    // Rate limiting - wait between requests
    if (i < base64Images.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
    }
  }

  return {
    totalImages: base64Images.length,
    totalPhones,
    results,
  };
};

// ============================================================================
// EXAMPLE 6: Monitoring & Analytics
// ============================================================================

export interface ExtractionAnalytics {
  totalAttempts: number;
  successCount: number;
  failureCount: number;
  totalPhonesExtracted: number;
  averageConfidence: number;
  averageProcessTime: number;
  errorLog: Array<{ timestamp: string; error: string }>;
}

export class ExtractionAnalyticsTracker {
  private analytics: ExtractionAnalytics = {
    totalAttempts: 0,
    successCount: 0,
    failureCount: 0,
    totalPhonesExtracted: 0,
    averageConfidence: 0,
    averageProcessTime: 0,
    errorLog: [],
  };

  async trackExtraction(base64Image: string) {
    const startTime = Date.now();
    this.analytics.totalAttempts++;

    try {
      const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
      const extractor = createGeminiExtractorWithKey(apiKey);

      const result = await extractor.extractPhoneNumbers(base64Image, 'image/jpeg');

      const processTime = Date.now() - startTime;

      if (result.success) {
        this.analytics.successCount++;
        this.analytics.totalPhonesExtracted += result.phones.length;

        // Update average confidence
        const avgConfidence =
          result.phones.reduce((sum, p) => sum + p.confidence, 0) / result.phones.length;
        this.analytics.averageConfidence =
          (this.analytics.averageConfidence + avgConfidence) / 2;
      } else {
        this.analytics.failureCount++;
        this.analytics.errorLog.push({
          timestamp: new Date().toISOString(),
          error: result.error || 'Unknown error',
        });
      }

      // Update average process time
      this.analytics.averageProcessTime =
        (this.analytics.averageProcessTime + processTime) / 2;

      return result;
    } catch (error) {
      this.analytics.failureCount++;
      this.analytics.errorLog.push({
        timestamp: new Date().toISOString(),
        error: String(error),
      });
      throw error;
    }
  }

  getAnalytics(): ExtractionAnalytics {
    return { ...this.analytics };
  }

  getSuccessRate(): number {
    if (this.analytics.totalAttempts === 0) return 0;
    return (this.analytics.successCount / this.analytics.totalAttempts) * 100;
  }

  logAnalytics(): void {
    console.log('📊 Extraction Analytics:', {
      successRate: `${this.getSuccessRate().toFixed(2)}%`,
      totalPhones: this.analytics.totalPhonesExtracted,
      avgConfidence: `${(this.analytics.averageConfidence * 100).toFixed(2)}%`,
      avgTime: `${this.analytics.averageProcessTime.toFixed(0)}ms`,
    });
  }
}

// ============================================================================
// EXAMPLE 7: Type-Safe Usage with TypeScript
// ============================================================================

import type { ExtractedPhoneFromImage, GeminiExtractionResult } from '@/src/services/geminiExtractor';

export async function typeSafeExtraction(
  base64Image: string,
  onSuccess: (phones: ExtractedPhoneFromImage[]) => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    const extractor = createGeminiExtractorWithKey(apiKey);

    const result: GeminiExtractionResult = await extractor.extractPhoneNumbers(
      base64Image,
      'image/jpeg'
    );

    if (result.success && result.phones.length > 0) {
      // TypeScript knows phones is ExtractedPhoneFromImage[]
      onSuccess(result.phones);
    } else {
      onError(result.error || 'No phones extracted');
    }
  } catch (error) {
    onError(error instanceof Error ? error.message : 'Unknown error');
  }
}

// ============================================================================
// USAGE: Copy any example and adapt for your needs!
// ============================================================================

/*
Quick Copy-Paste Examples:

1. Simple extraction:
   const phones = await basicUsageExample(base64Data);

2. In React component:
   <ImageExtractionExample />

3. Advanced with save:
   const result = await advancedExtractionWithSave(base64Data, userId);

4. With retry:
   const result = await extractWithRetry(base64Data, 3);

5. Batch process:
   const batchResults = await batchProcessImages([img1, img2, img3]);

6. With analytics:
   const tracker = new ExtractionAnalyticsTracker();
   await tracker.trackExtraction(base64Data);
   tracker.logAnalytics();

7. Type-safe:
   await typeSafeExtraction(base64Data,
     (phones) => console.log('Success:', phones),
     (error) => console.log('Error:', error)
   );
*/
