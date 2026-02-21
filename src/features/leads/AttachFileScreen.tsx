import { AppButton } from '@/src/components/ui/AppButton';
import { AppHeader } from '@/src/components/ui/AppHeader';
import { ScreenContainer } from '@/src/components/ui/ScreenContainer';
import * as DocumentPicker from 'expo-document-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

export default function AttachFileScreen() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const pickAndAttachFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile(file);
        Alert.alert(
          'File Selected',
          `${file.name} (${(file.size! / 1024).toFixed(2)} KB)\n\nNote: File attachments are not yet supported in the batch system.`,
          [
            { text: 'Go to Imports', onPress: () => router.push('/imports') },
            { text: 'OK' },
          ]
        );
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'An error occurred while picking the document.');
    }
  };

  return (
    <ScreenContainer>
      <AppHeader 
        title="Attach File" 
        subtitle="File attachments coming soon. Use other import methods for now." 
      />
      <View style={styles.container}>
        {selectedFile && (
          <View style={styles.fileInfo}>
            <Text style={styles.fileName}>📎 {selectedFile.name}</Text>
            <Text style={styles.fileSize}>
              Size: {(selectedFile.size / 1024).toFixed(2)} KB
            </Text>
          </View>
        )}
        
        <AppButton
          title={loading ? 'Processing...' : selectedFile ? 'Select Different File' : 'Select File'}
          onPress={pickAndAttachFile}
          disabled={loading}
        />
        
        {selectedFile && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              ⚠️ File attachments will be supported in a future update.
              For now, please use these import methods:
            </Text>
            <Text style={styles.noticeList}>
              • CSV Upload{'\n'}
              • Image Import (extract phone numbers){'\n'}
              • Paste from Clipboard{'\n'}
              • Manual Entry
            </Text>
            <AppButton
              title="Go to Import Options"
              onPress={() => router.push('/imports')}
              variant="secondary"
            />
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  fileInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#666',
  },
  notice: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  noticeText: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    fontWeight: '600',
  },
  noticeList: {
    fontSize: 13,
    color: '#856404',
    marginBottom: 16,
    lineHeight: 20,
  },
});
