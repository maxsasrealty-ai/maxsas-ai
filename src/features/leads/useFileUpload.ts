import { extractFromTableData, formatPhoneForDisplay } from '@/src/lib/phoneExtractor';
import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import { Alert } from 'react-native';
import * as XLSX from 'xlsx';

export function useFileUpload() {
  const [loading, setLoading] = useState(false);

  const pickAndParseFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return null;
      }

      setLoading(true);
      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const blob = await response.blob();

      return new Promise<any[] | null>((resolve) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            if (e.target && e.target.result) {
              const data = e.target.result;
              const workbook = XLSX.read(data, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              
              const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
              
              const fileName = result.assets[0].name || '';
              const fileType = fileName.endsWith('.csv') ? 'csv' : 'excel';
              
              const extractionResult = extractFromTableData(rawData as any[][], fileType);
              
              if (extractionResult.leads.length > 0) {
                const leads = extractionResult.leads.map((lead) => ({
                  id: `lead_${Date.now()}_${Math.random()}`,
                  phone: formatPhoneForDisplay(lead.phone),
                  phoneRaw: lead.phone,
                  name: '',
                  email: '',
                  interest: '',
                  budget: '',
                  status: 'queued',
                  source: fileType,
                }));
                resolve(leads);
              } else {
                const errorMsg = extractionResult.invalidCount > 0 
                  ? `No valid phone numbers found. ${extractionResult.invalidCount} invalid entries detected.`
                  : 'The selected file is empty or contains no phone numbers.';
                Alert.alert('Info', errorMsg);
                resolve(null);
              }
            } else {
              Alert.alert('Error', 'Failed to read file content.');
              resolve(null);
            }
          } catch (error) {
            console.error('Error processing file:', error);
            Alert.alert('Error', 'Failed to process the file.');
            resolve(null);
          } finally {
            setLoading(false);
          }
        };

        reader.readAsBinaryString(blob);
      });
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'An error occurred while picking the document.');
      return null;
    }
  };

  return { loading, pickAndParseFile };
}
