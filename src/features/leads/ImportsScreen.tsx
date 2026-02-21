/**
 * Enhanced Leads Import Screen
 * Shows all import methods available
 */

import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { router } from 'expo-router';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native';

import { AppCard } from '@/src/components/ui/AppCard';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import { useAppTheme } from '@/src/theme/use-app-theme';

// Helper function to add opacity to hex colors
const hexToRgbA = (hex: string, alpha: number = 0.1): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

interface ImportOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: Href;
  requiresFile: boolean;
}

const IMPORT_OPTIONS: ImportOption[] = [
  {
    id: 'manual',
    title: 'Manual Entry',
    description: 'Add phone numbers one by one',
    icon: 'create',
    color: '#007AFF',
    route: { pathname: '/add-lead' },
    requiresFile: false,
  },
  {
    id: 'clipboard',
    title: 'Paste from Clipboard',
    description: 'Paste multiple numbers at once',
    icon: 'clipboard',
    color: '#34C759',
    route: { pathname: '/paste-leads' },
    requiresFile: false,
  },
  {
    id: 'csv',
    title: 'CSV Upload',
    description: 'Import from CSV file',
    icon: 'document-text',
    color: '#FF9500',
    route: { pathname: '/upload-leads', params: { type: 'csv' } },
    requiresFile: true,
  },
  {
    id: 'excel',
    title: 'Excel Upload',
    description: 'Import from Excel file',
    icon: 'grid',
    color: '#30B0C0',
    route: { pathname: '/upload-leads', params: { type: 'excel' } },
    requiresFile: true,
  },
  {
    id: 'pdf',
    title: 'PDF Upload',
    description: 'Extract from text-based PDF',
    icon: 'document',
    color: '#FF3B30',
    route: { pathname: '/upload-leads', params: { type: 'pdf' } },
    requiresFile: true,
  },
  {
    id: 'image',
    title: '🤖 AI Image Extraction',
    description: 'Extract numbers using AI',
    icon: 'image',
    color: '#FF2D55',
    route: { pathname: '/image-import' },
    requiresFile: true,
  },
];

export default function LeadsImportScreen() {
  const { colors } = useAppTheme();

  const handleSelectOption = (option: ImportOption) => {
    if (option.id === 'image') {
      // Navigate to AI-powered image extraction
      router.push({ pathname: '/image-import' });
    } else {
      // Navigate to the appropriate screen
      router.push(option.route);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <AppHeader
          title="Import Leads"
          subtitle="Choose how you want to add leads"
        />

        <View style={styles.container}>
          <View style={styles.optionsGrid}>
            {IMPORT_OPTIONS.map((option) => (
              <Pressable
                key={option.id}
                onPress={() => handleSelectOption(option)}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: option.color + '20' },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={28}
                    color={option.color}
                  />
                </View>
                <Text
                  style={[styles.optionTitle, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {option.title}
                </Text>
                <Text
                  style={[styles.optionDescription, { color: colors.textMuted }]}
                  numberOfLines={2}
                >
                  {option.description}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.infoSection}>
            <AppCard
              style={[
                styles.infoCard,
                { backgroundColor: hexToRgbA(colors.warning, 0.1) },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={20}
                color={colors.warning}
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Supported Formats
                </Text>
                <Text
                  style={[styles.infoText, { color: colors.textMuted }]}
                >
                  • CSV files with phone columns
                  {'\n'}• Excel (XLSX, XLS)
                  {'\n'}• Plain text with phone numbers
                  {'\n'}• Text-based PDF files
                </Text>
              </View>
            </AppCard>

            <AppCard
              style={[
                styles.infoCard,
                { backgroundColor: hexToRgbA(colors.success, 0.1) },
              ]}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={colors.success}
                style={styles.infoIcon}
              />
              <View style={styles.infoContent}>
                <Text style={[styles.infoTitle, { color: colors.text }]}>
                  Auto-Processing
                </Text>
                <Text
                  style={[styles.infoText, { color: colors.textMuted }]}
                >
                  • Detects phone numbers automatically
                  {'\n'}• Removes duplicates
                  {'\n'}• Validates format (10 digits)
                  {'\n'}• Shows preview before saving
                </Text>
              </View>
            </AppCard>
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
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  optionCard: {
    width: '48%',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  optionDescription: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  infoSection: {
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
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
