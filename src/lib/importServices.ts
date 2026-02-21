/**
 * Lead Import Services
 * Handles different import methods: CSV, Excel, Clipboard, PDF
 */

import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import { Platform } from 'react-native';
import * as XLSX from 'xlsx';
import {
    ExtractedLead,
    extractFromTableData,
    extractIndianMobileLeadsFromText,
    ExtractionResult,
    extractPhoneNumbers,
    removeDuplicates
} from './phoneExtractor';

const PDF_WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const extractPdfTextFromUri = async (fileUri: string): Promise<string> => {
  // Use pdfjs on web to avoid binary-garbage text extraction from PDFs.
  if (Platform.OS !== 'web') {
    throw new Error('PDF text extraction is supported on web only. Please use image import on mobile.');
  }

  const response = await fetch(fileUri);
  const arrayBuffer = await response.arrayBuffer();

  // eslint-disable-next-line import/no-unresolved
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.js');
  const pdfjs = pdfjsLib as any;

  // Use CDN worker to avoid bundler issues in Expo web builds.
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
  }

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  let fullText = '';
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => (item?.str ? String(item.str) : ''))
      .join(' ');
    fullText += pageText + '\n';
  }

  return fullText;
};

/**
 * Service: CSV File Import
 */
export const csvImportService = {
  async pickAndParse(): Promise<ExtractionResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
      });

      if (result.canceled) {
        return { leads: [], duplicateCount: 0, invalidCount: 0 };
      }

      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const csvText = await response.text();

      // Parse CSV manually (simple approach)
      const lines = csvText.split('\n');
      const data = lines.map((line) =>
        line
          .split(',')
          .map((cell) => cell.trim())
          .map((cell) => cell.replace(/^["']|["']$/g, '')) // Remove quotes
      );

      return extractFromTableData(data, 'csv');
    } catch (error) {
      console.error('CSV import error:', error);
      throw new Error('Failed to import CSV file');
    }
  },
};

/**
 * Service: Excel File Import
 */
export const excelImportService = {
  async pickAndParse(): Promise<ExtractionResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
      });

      if (result.canceled) {
        return { leads: [], duplicateCount: 0, invalidCount: 0 };
      }

      const fileUri = result.assets[0].uri;
      const response = await fetch(fileUri);
      const blob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          try {
            const data = e.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            const result = extractFromTableData(jsonData as any[][], 'excel');
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read Excel file'));
        reader.readAsBinaryString(blob);
      });
    } catch (error) {
      console.error('Excel import error:', error);
      throw new Error('Failed to import Excel file');
    }
  },
};

/**
 * Service: Clipboard Paste
 */
export const clipboardImportService = {
  async extractFromClipboard(): Promise<ExtractionResult> {
    try {
      const clipboardText = await Clipboard.getStringAsync();

      if (!clipboardText) {
        return { leads: [], duplicateCount: 0, invalidCount: 0 };
      }

      const result = extractPhoneNumbers(clipboardText, 'clipboard');
      return result;
    } catch (error) {
      console.error('Clipboard import error:', error);
      throw new Error('Failed to read clipboard');
    }
  },
};

/**
 * Service: PDF Text Extraction (for text-based PDFs only)
 */
export const pdfImportService = {
  async pickAndParse(): Promise<ExtractionResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
      });

      if (result.canceled) {
        return { leads: [], duplicateCount: 0, invalidCount: 0 };
      }

      const fileUri = result.assets[0].uri;

      // Extract text with pdfjs for reliable parsing on web.
      const rawText = await extractPdfTextFromUri(fileUri);

      const normalizedText = rawText.replace(/\s+/g, ' ').trim();

      // Guard: only proceed for text-based PDFs to avoid OCR/scan garbage
      const printableChars = normalizedText.match(/[\x20-\x7E]/g)?.length ?? 0;
      const printableRatio = normalizedText.length > 0
        ? printableChars / normalizedText.length
        : 0;

      if (!normalizedText || printableRatio < 0.5) {
        throw new Error('This PDF appears to be scanned or not text-based. Please use image import instead.');
      }

      // Strict extraction for Indian mobiles only (prevents IDs, dates, page numbers, etc.)
      return extractIndianMobileLeadsFromText(normalizedText, 'pdf');
    } catch (error) {
      console.error('PDF import error:', error);
      throw error;
    }
  },
};

/**
 * Service: Generic File Upload
 * Detects file type and routes to appropriate parser
 */
export const fileImportService = {
  async pickAndParse(): Promise<{
    leads: ExtractedLead[];
    fileName: string;
    fileType: 'csv' | 'excel' | 'pdf' | 'unknown';
  }> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'text/csv',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'application/pdf',
        ],
      });

      if (result.canceled) {
        return { leads: [], fileName: '', fileType: 'unknown' };
      }

      const file = result.assets[0];
      const fileName = file.name || 'unknown';
      const mimeType = file.mimeType || '';

      let fileType: 'csv' | 'excel' | 'pdf' | 'unknown' = 'unknown';
      let extractionResult: ExtractionResult = {
        leads: [],
        duplicateCount: 0,
        invalidCount: 0,
      };

      if (fileName.endsWith('.csv') || mimeType.includes('csv')) {
        fileType = 'csv';
        extractionResult = await csvImportService.pickAndParse();
      } else if (
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls') ||
        mimeType.includes('spreadsheet')
      ) {
        fileType = 'excel';
        extractionResult = await excelImportService.pickAndParse();
      } else if (fileName.endsWith('.pdf') || mimeType.includes('pdf')) {
        fileType = 'pdf';
        extractionResult = await pdfImportService.pickAndParse();
      }

      return {
        leads: extractionResult.leads,
        fileName,
        fileType,
      };
    } catch (error) {
      console.error('File import error:', error);
      throw error;
    }
  },
};

/**
 * Service: Process imported leads
 * Removes duplicates, validates, and prepares for database storage
 */
export const leadProcessingService = {
  async processImportedLeads(
    leads: ExtractedLead[],
    existingLeads?: ExtractedLead[]
  ): Promise<ExtractedLead[]> {
    // Remove duplicates
    let processed = removeDuplicates(leads);

    // Remove existing leads if provided
    if (existingLeads && existingLeads.length > 0) {
      const existingPhones = new Set(existingLeads.map((l) => l.phone));
      processed = processed.filter((l) => !existingPhones.has(l.phone));
    }

    // Sort by phone number for consistency
    processed.sort((a, b) => a.phone.localeCompare(b.phone));

    return processed;
  },
};

/**
 * Master Import Service
 * Main entry point for all import operations
 */
export const masterImportService = {
  csv: csvImportService,
  excel: excelImportService,
  clipboard: clipboardImportService,
  pdf: pdfImportService,
  file: fileImportService,
  process: leadProcessingService,
};

export type ImportService = typeof masterImportService;
