/**
 * Phone Number Extraction and Validation Utility
 * Handles regex-based extraction and Indian phone number normalization
 * 
 * All phone numbers are stored as clean 10-digit format: 9876543210
 * Display format: +91 98765 43210 (for UI only)
 */



// Emergency numbers to ignore
const EMERGENCY_NUMBERS = ['100', '101', '102', '112', '999', '1091', '1098', '108'];

export interface ExtractedLead {
  phone: string; // Always clean 10-digit format
  source: 'csv' | 'clipboard' | 'pdf' | 'excel';
  originalValue?: string; // Original format before normalization
}

export interface ExtractionResult {
  leads: ExtractedLead[];
  duplicateCount: number;
  invalidCount: number;
}

export interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
}

export interface FirebaseUploadOptions {
  collectionName?: string;
  additionalFields?: Record<string, any>;
  batchSize?: number;
}

/**
 * Normalize a single phone number to clean 10-digit format
 * Handles: +91 prefix, 91 prefix, spaces, dashes, dots
 * 
 * @param phone - Raw phone number in any format
 * @returns Clean 10-digit number or null if invalid
 * 
 * @example
 * normalizeNumber('+91 9876543210') => '9876543210'
 * normalizeNumber('9876543210') => '9876543210'
 * normalizeNumber('98765-43210') => '9876543210'
 * normalizeNumber('98765.43210') => '9876543210'
 * normalizeNumber('98765 43210') => '9876543210'
 * normalizeNumber('0876543210') => null (invalid: starts with 0)
 * normalizeNumber('123') => null (too short)
 */
export const normalizeNumber = (phone: string): string | null => {
  if (!phone || typeof phone !== 'string') return null;
  
  // Step 1: Trim whitespace
  let cleaned = phone.trim();
  
  // Step 2: Remove +91 prefix if present
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  }
  
  // Step 3: Remove leading 91 if we have more than 12 digits total
  if (cleaned.startsWith('91') && cleaned.length > 12) {
    cleaned = cleaned.substring(2);
  }
  
  // Step 4: Remove all non-digit characters (spaces, dashes, dots, parentheses, etc.)
  cleaned = cleaned.replace(/\D/g, '');
  
  // Step 5: If we have 11 digits and starts with 0, remove the leading 0
  if (cleaned.length === 11 && cleaned[0] === '0') {
    cleaned = cleaned.substring(1);
  }
  
  // Step 6: Ensure exactly 10 digits
  if (cleaned.length !== 10) return null;
  
  // Step 7: Check first digit is 6-9 (valid Indian mobile)
  const firstDigit = parseInt(cleaned[0], 10);
  if (firstDigit < 6 || firstDigit > 9) return null;
  
  // Step 8: Ignore emergency numbers
  if (EMERGENCY_NUMBERS.includes(cleaned)) return null;
  
  // Step 9: All checks passed - return clean number
  return cleaned;
};

/**
 * Validate and provide detailed error message for phone number
 * Use this for user input validation with helpful feedback
 * 
 * @param phone - Phone number to validate
 * @returns Validation result with normalized number or specific error message
 * 
 * @example
 * validatePhoneWithMessage('9876543210') 
 * // => { valid: true, normalized: '9876543210', error: '' }
 * 
 * validatePhoneWithMessage('5876543210')
 * // => { valid: false, normalized: null, error: 'Invalid! Must start with 6, 7, 8, or 9' }
 * 
 * validatePhoneWithMessage('123')
 * // => { valid: false, normalized: null, error: 'Must be exactly 10 digits' }
 */
export const validatePhoneWithMessage = (
  phone: string
): { valid: boolean; normalized: string | null; error: string } => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, normalized: null, error: 'Please enter a phone number' };
  }

  const trimmed = phone.trim();
  if (!trimmed) {
    return { valid: false, normalized: null, error: 'Please enter a phone number' };
  }

  // Try to normalize
  const normalized = normalizeNumber(trimmed);
  
  if (normalized) {
    return { valid: true, normalized, error: '' };
  }

  // Provide specific error messages
  let cleaned = trimmed;
  
  // Remove +91 prefix
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  }
  
  // Remove 91 prefix
  if (cleaned.startsWith('91')) {
    cleaned = cleaned.substring(2);
  }
  
  // Remove non-digits
  cleaned = cleaned.replace(/\D/g, '');
  
  // Check length
  if (!cleaned) {
    return { valid: false, normalized: null, error: 'Please enter a phone number' };
  }
  
  if (cleaned.length < 10) {
    return { 
      valid: false, 
      normalized: null, 
      error: `Too short! You entered ${cleaned.length} digits, need 10 digits` 
    };
  }
  
  if (cleaned.length > 10) {
    return { 
      valid: false, 
      normalized: null, 
      error: `Too long! You entered ${cleaned.length} digits, need exactly 10 digits` 
    };
  }
  
  // Check first digit (6-9 required for Indian mobile numbers)
  const firstDigit = cleaned[0];
  if (!['6', '7', '8', '9'].includes(firstDigit)) {
    return { 
      valid: false, 
      normalized: null, 
      error: `Invalid! Phone numbers in India must start with 6, 7, 8, or 9.\nYour number starts with "${firstDigit}" which is not valid.` 
    };
  }
  
  // Check emergency numbers
  if (EMERGENCY_NUMBERS.includes(cleaned)) {
    return { 
      valid: false, 
      normalized: null, 
      error: 'Emergency numbers cannot be used as lead numbers' 
    };
  }
  
  // Generic error (shouldn't reach here normally)
  return { 
    valid: false, 
    normalized: null, 
    error: 'Invalid phone number format' 
  };
};

/**
 * Validate Indian mobile phone number (10 digits)
 * @param phone - Phone number to validate (should already be normalized)
 * @returns true if valid Indian mobile number
 */
export const isValidIndianPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Should be exactly 10 digits
  if (phone.length !== 10) return false;
  
  // Should only contain digits
  if (!/^\d{10}$/.test(phone)) return false;
  
  // First digit should be 6-9
  const firstDigit = parseInt(phone[0], 10);
  if (firstDigit < 6 || firstDigit > 9) return false;
  
  // Not an emergency number
  if (EMERGENCY_NUMBERS.includes(phone)) return false;
  
  return true;
};

/**
 * Legacy function - use normalizeNumber() instead
 * @deprecated Use normalizeNumber() instead
 */
export const normalizePhone = (phone: string): string | null => {
  return normalizeNumber(phone);
};

type MobileExtractionStats = {
  numbers: string[];
  duplicateCount: number;
  invalidCount: number;
};

const isRepeatingDigits = (phone: string): boolean => {
  return /^(\d)\1{9}$/.test(phone);
};

const normalizeIndianMobileCandidate = (rawValue: string): string | null => {
  if (!rawValue || typeof rawValue !== 'string') return null;

  // Reject mixed alpha-numeric tokens early (e.g., IDs like AB1234567890)
  if (/[A-Za-z]/.test(rawValue)) return null;

  // Keep digits only for normalization; prefixes handled explicitly
  let digits = rawValue.replace(/\D/g, '');

  // Strip leading 0 for formats like 09876543210
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Strip country code for formats like +91 9876543210
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }

  // Edge case: 0 + 91 prefix present (e.g., 0919876543210)
  if (digits.length === 13 && digits.startsWith('091')) {
    digits = digits.slice(3);
  }

  // Must be exactly 10 digits for Indian mobile
  if (digits.length !== 10) return null;

  // Must start with 6/7/8/9 (Indian mobile range)
  if (!/^[6-9]/.test(digits)) return null;

  // Reject repeating digit patterns (e.g., 0000000000, 1111111111)
  if (isRepeatingDigits(digits)) return null;

  // Ignore emergency numbers
  if (EMERGENCY_NUMBERS.includes(digits)) return null;

  return digits;
};

const extractIndianMobileNumbersWithStats = (text: string): MobileExtractionStats => {
  if (!text || typeof text !== 'string') {
    return { numbers: [], duplicateCount: 0, invalidCount: 0 };
  }

  // Broad capture for digit-heavy chunks; strict validation happens later.
  const candidateRegex = /[+\d][\d\s().-]{8,}\d/g;
  const strictCandidateRegex = /^\s*(?:\+?91[\s().-]?)?0?[6-9](?:[\s().-]?\d){9}\s*$/;

  const uniqueNumbers = new Map<string, string>();
  const allNormalized: string[] = [];
  let invalidCount = 0;

  const matches = text.match(candidateRegex) || [];
  const tooManyCandidates = matches.length > 100;

  const getLineContext = (startIndex: number, endIndex: number) => {
    const lineStart = text.lastIndexOf('\n', startIndex - 1);
    const lineEnd = text.indexOf('\n', endIndex);
    const safeStart = lineStart === -1 ? 0 : lineStart + 1;
    const safeEnd = lineEnd === -1 ? text.length : lineEnd;
    return text.slice(safeStart, safeEnd);
  };

  let match: RegExpExecArray | null;
  while ((match = candidateRegex.exec(text)) !== null) {
    const raw = match[0];
    const start = match.index;
    const end = start + raw.length;

    // Skip numbers embedded inside alpha or digit strings (IDs, invoice codes, long numeric blocks)
    const before = start > 0 ? text[start - 1] : '';
    const after = end < text.length ? text[end] : '';
    if (/[A-Za-z]/.test(before) || /[A-Za-z]/.test(after)) {
      invalidCount++;
      continue;
    }

    if (/\d/.test(before) || /\d/.test(after)) {
      // Avoid capturing partial sequences inside longer digit blocks
      invalidCount++;
      continue;
    }

    if (/[A-Za-z]/.test(raw)) {
      invalidCount++;
      continue;
    }

    const digitCount = raw.replace(/\D/g, '').length;
    if (digitCount < 10 || digitCount > 13) {
      // Filter out short IDs/dates or overly long numeric fragments
      invalidCount++;
      continue;
    }

    // When PDF text has too many numeric blocks, apply a stricter pattern gate.
    if (tooManyCandidates && !strictCandidateRegex.test(raw)) {
      invalidCount++;
      continue;
    }

    if (tooManyCandidates) {
      const lineContext = getLineContext(start, end);
      const hasAlphaInLine = /[A-Za-z]/.test(lineContext);
      const hasSeparators = /[\s().-]/.test(raw);
      const hasPrefix = /^\s*(?:\+?91|0)/.test(raw);

      // In noisy PDFs, require some context signal to avoid false positives.
      if (!hasAlphaInLine && !hasSeparators && !hasPrefix) {
        invalidCount++;
        continue;
      }
    }

    const normalized = normalizeIndianMobileCandidate(raw);
    if (!normalized) {
      invalidCount++;
      continue;
    }

    allNormalized.push(normalized);
    if (!uniqueNumbers.has(normalized)) {
      uniqueNumbers.set(normalized, raw);
    }
  }

  // Count duplicates from all normalized numbers found
  const counts: Record<string, number> = {};
  for (const num of allNormalized) {
    counts[num] = (counts[num] || 0) + 1;
  }

  let duplicateCount = 0;
  for (const num in counts) {
    if (counts[num] > 1) {
      duplicateCount += counts[num] - 1;
    }
  }

  return {
    numbers: Array.from(uniqueNumbers.keys()),
    duplicateCount,
    invalidCount,
  };
};

/**
 * Strict extraction for Indian mobile numbers from text (PDF-safe).
 * Applies strong normalization + validation to avoid false positives.
 */
export const extractIndianMobileNumbers = (text: string): string[] => {
  return extractIndianMobileNumbersWithStats(text).numbers;
};

/**
 * Build ExtractionResult for strict Indian mobile extraction.
 * Keeps CSV/Excel/clipboard logic unchanged while enabling PDF-specific filtering.
 */
export const extractIndianMobileLeadsFromText = (
  text: string,
  source: 'pdf' = 'pdf'
): ExtractionResult => {
  const result = extractIndianMobileNumbersWithStats(text);
  const leads = result.numbers.map((phone) => ({
    phone,
    source,
    originalValue: phone,
  }));

  return {
    leads,
    duplicateCount: result.duplicateCount,
    invalidCount: result.invalidCount,
  };
};

/**
 * Extract phone numbers from text with comprehensive pattern matching
 * Handles multiple formats and normalizes all to 10-digit clean format
 * 
 * @param text - Input text containing phone numbers in any format
 * @param source - Source type for metadata tracking
 * @returns ExtractionResult with cleaned phone numbers (database-ready)
 * 
 * @example
 * const result = extractPhoneNumbers('Call 9876543210 or +91 9876543211');
 * // Returns: { 
 * //   leads: [
 * //     { phone: '9876543210', source: 'clipboard', originalValue: '9876543210' },
 * //     { phone: '9876543211', source: 'clipboard', originalValue: '+91 9876543211' }
 * //   ],
 * //   duplicateCount: 0,
 * //   invalidCount: 0
 * // }
 */
export const extractPhoneNumbers = (
  text: string,
  source: 'csv' | 'clipboard' | 'pdf' | 'excel' = 'clipboard'
): ExtractionResult => {
  if (!text || typeof text !== 'string') {
    return { leads: [], duplicateCount: 0, invalidCount: 0 };
  }

  // This regex is intentionally broad to capture anything that might be a phone number.
  // It finds sequences of digits, possibly including common separators like spaces, hyphens, and parentheses,
  // and optionally a `+` prefix. It helps in identifying invalid attempts as well.
  const POTENTIAL_PHONE_REGEX = /[\d\s\-().+]{3,}/g;
  const potentialMatches = text.match(POTENTIAL_PHONE_REGEX) || [];

  const leads = new Map<string, ExtractedLead>();
  const allNormalized: string[] = [];
  const invalidValues = new Set<string>();

  for (const match of potentialMatches) {
    // We only care about things that have at least one digit
    if (!/\d/.test(match)) {
      continue;
    }

    const normalized = normalizeNumber(match);
    if (normalized) {
      allNormalized.push(normalized);
      if (!leads.has(normalized)) {
        leads.set(normalized, {
          phone: normalized,
          source,
          originalValue: match,
        });
      }
    } else {
      invalidValues.add(match);
    }
  }

  // Count duplicates from the list of all normalized numbers found
  const counts: { [key: string]: number } = {};
  for (const num of allNormalized) {
    counts[num] = (counts[num] || 0) + 1;
  }

  let duplicateCount = 0;
  for (const num in counts) {
    if (counts[num] > 1) {
      duplicateCount += counts[num] - 1;
    }
  }

  return {
    leads: Array.from(leads.values()),
    duplicateCount,
    invalidCount: invalidValues.size,
  };
};

/**
 * Remove duplicate phone numbers from list
 * @param leads - Array of extracted leads
 * @returns Array with duplicates removed
 */
export const removeDuplicates = (leads: ExtractedLead[]): ExtractedLead[] => {
  const seen = new Set<string>();
  return leads.filter((lead) => {
    if (seen.has(lead.phone)) {
      return false;
    }
    seen.add(lead.phone);
    return true;
  });
};

/**
 * Merge multiple lead arrays and remove duplicates
 * @param leadArrays - Multiple arrays of leads to merge
 * @returns Merged array with duplicates removed
 */
export const mergeLeads = (...leadArrays: ExtractedLead[][]): ExtractedLead[] => {
  const merged = leadArrays.flat();
  return removeDuplicates(merged);
};

/**
 * Format clean 10-digit phone number for display UI
 * Database stores: 9876543210
 * Display shows: +91 98765 43210
 * 
 * @param phone - Clean 10-digit phone number
 * @returns Formatted phone number for UI display
 * 
 * @example
 * formatPhoneForDisplay('9876543210') => '+91 98765 43210'
 */
export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';
  
  // Remove any non-digits
  const clean = phone.replace(/\D/g, '');
  
  // Format: +91 XXXXX XXXXX (or just +91 if not 10 digits)
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  
  // Fallback: return with country code
  return `+91 ${clean}`;
};

/**
 * Get database-safe format (plain 10 digits)
 * Use this when storing to Firebase/Database
 * @param phone - Phone in any format
 * @returns Clean 10-digit format or null
 */
export const getDatabaseFormat = (phone: string): string | null => {
  return normalizeNumber(phone);
};

/**
 * Extract column data from 2D array
 * @param data - 2D array (like CSV parsed data)
 * @param columnIndex - Index of column to extract
 * @returns Array of values from that column
 */
export const extractColumnData = (
  data: any[][],
  columnIndex: number
): string[] => {
  return data
    .slice(1) // Skip header row
    .map((row) => row[columnIndex])
    .filter((value) => value !== undefined && value !== null)
    .map((value) => String(value).trim());
};

/**
 * Auto-detect phone number column in CSV/Excel data
 * Checks headers first, then inspects data rows for phone-like patterns
 * 
 * @param data - 2D array (CSV/Excel parsed data with headers in first row)
 * @param maxRowsToCheck - Maximum rows to check for pattern matching (default: 5)
 * @returns Column index (0-based) or -1 if not found
 */
export const findPhoneColumn = (
  data: any[][],
  maxRowsToCheck: number = 5
): number => {
  if (!data || data.length === 0) return -1;

  const headerRow = data[0];
  const commonPhoneHeaders = [
    'phone',
    'phone number',
    'mobile',
    'mobile number',
    'contact',
    'contact number',
    'tel',
    'telephone',
    'cell',
    'cellphone',
    'phn',
    'no',
    'number',
  ];

  // Strategy 1: Check headers first
  for (let i = 0; i < headerRow.length; i++) {
    const header = String(headerRow[i]).toLowerCase().trim();
    if (commonPhoneHeaders.some((h) => header.includes(h))) {
      return i;
    }
  }

  // Strategy 2: Check data rows for valid phone patterns
  for (let colIdx = 0; colIdx < headerRow.length; colIdx++) {
    let validPhoneCount = 0;
    
    for (
      let rowIdx = 1;
      rowIdx < Math.min(data.length, maxRowsToCheck + 1);
      rowIdx++
    ) {
      const value = String(data[rowIdx]?.[colIdx] || '').trim();
      if (value && normalizeNumber(value)) {
        validPhoneCount++;
      }
    }

    // If more than 50% of checked rows have valid phones, this is likely the phone column
    if (validPhoneCount >= Math.ceil(maxRowsToCheck * 0.5)) {
      return colIdx;
    }
  }

  return -1;
};

/**
 * Extract phones from CSV/Excel data (2D array)
 * Scans ALL cells in the entire sheet to find valid 10-digit phone numbers
 * 
 * @param data - 2D array from parsed CSV/Excel
 * @param source - Source type (csv or excel)
 * @param phoneColumnIndex - Optional specific column index (if provided, only scans that column)
 * @returns ExtractionResult with cleaned phone numbers
 */
export const extractFromTableData = (
  data: any[][],
  source: 'csv' | 'excel',
  phoneColumnIndex?: number
): ExtractionResult => {
  if (!data || data.length < 1) {
    return { leads: [], duplicateCount: 0, invalidCount: 0 };
  }

  const extractedMap = new Map<string, ExtractedLead>();
  let invalidCount = 0;
  let duplicateCount = 0;

  // If specific column index is provided, only scan that column
  if (phoneColumnIndex !== undefined && phoneColumnIndex >= 0) {
    const columnData = extractColumnData(data, phoneColumnIndex);
    
    for (const value of columnData) {
      const normalized = normalizeNumber(String(value));
      if (normalized) {
        if (extractedMap.has(normalized)) {
          duplicateCount++;
        } else {
          extractedMap.set(normalized, {
            phone: normalized,
            source,
            originalValue: String(value),
          });
        }
      } else if (value && String(value).trim()) {
        invalidCount++;
      }
    }
  } else {
    // Scan ALL cells in the entire sheet for phone numbers
    console.log(`📊 Scanning entire sheet: ${data.length} rows × ${data[0]?.length || 0} columns`);
    
    for (let rowIdx = 0; rowIdx < data.length; rowIdx++) {
      const row = data[rowIdx];
      if (!row || !Array.isArray(row)) continue;
      
      for (let colIdx = 0; colIdx < row.length; colIdx++) {
        const cellValue = row[colIdx];
        if (!cellValue) continue;
        
        // Convert to string and try to normalize
        const valueStr = String(cellValue).trim();
        if (!valueStr) continue;
        
        const normalized = normalizeNumber(valueStr);
        if (normalized) {
          if (extractedMap.has(normalized)) {
            duplicateCount++;
            console.log(`🔄 Duplicate found: ${normalized} at Row ${rowIdx + 1}, Col ${colIdx + 1}`);
          } else {
            extractedMap.set(normalized, {
              phone: normalized,
              source,
              originalValue: valueStr,
            });
            console.log(`✅ Valid number found: ${normalized} at Row ${rowIdx + 1}, Col ${colIdx + 1}`);
          }
        } else if (/\d/.test(valueStr)) {
          // Only count as invalid if it contains digits but isn't valid
          invalidCount++;
          console.log(`❌ Invalid number: ${valueStr} at Row ${rowIdx + 1}, Col ${colIdx + 1}`);
        }
      }
    }
    
    console.log(`📈 Scan complete: ${extractedMap.size} unique valid numbers found`);
  }

  return {
    leads: Array.from(extractedMap.values()),
    duplicateCount,
    invalidCount,
  };
};

/**
 * Process CSV data for Firebase upload
 * Scans ENTIRE sheet for valid 10-digit phone numbers (any row, any column)
 * 
 * @param csvData - 2D array from parsed CSV (with or without headers)
 * @returns ExtractionResult ready for Firebase upload
 */
export const processCsvForUpload = (
  csvData: any[][]
): ExtractionResult => {
  console.log('📊 CSV Data received:', csvData.length, 'rows');
  
  // Scan entire sheet - no column detection, just find all valid 10-digit numbers
  const result = extractFromTableData(csvData, 'csv');
  
  console.log('✅ Extraction Result:', {
    totalLeads: result.leads.length,
    duplicates: result.duplicateCount,
    invalid: result.invalidCount
  });
  
  return result;
};

/**
 * Upload leads to Firebase with proper data structure
 * Supports batch uploads for better performance
 * 
 * @param leads - Array of extracted leads
 * @param firebaseRef - Firebase collection reference
 * @param options - Upload configuration options
 * @returns UploadResult with success/failure counts
 */
export const uploadLeadsToFirebase = async (
  leads: ExtractedLead[],
  firebaseRef: any, // Firestore collection reference
  options: FirebaseUploadOptions = {}
): Promise<UploadResult> => {
  const {
    additionalFields = {},
    batchSize = 25
  } = options;
  
  let successCount = 0;
  let failedCount = 0;
  const errors: string[] = [];
  
  console.log(`🚀 Starting upload of ${leads.length} leads to Firebase...`);
  
  try {
    // Process in batches
    for (let i = 0; i < leads.length; i += batchSize) {
      const batch = leads.slice(i, i + batchSize);
      
      for (const lead of batch) {
        try {
          // Prepare Firebase document
          const firebaseDoc = {
            phone_number: lead.phone, // Clean 10-digit: 9876543210
            phone_display: formatPhoneForDisplay(lead.phone), // Display: +91 98765 43210
            source: lead.source,
            original_value: lead.originalValue || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'active',
            upload_date: new Date().toLocaleDateString('en-IN'),
            upload_time: new Date().toLocaleTimeString('en-IN'),
            ...additionalFields
          };
          
          // Upload to Firebase - supports both Firestore and Realtime DB
          if (firebaseRef.add) {
            // Firestore: collection.add()
            await firebaseRef.add(firebaseDoc);
          } else if (firebaseRef.child) {
            // Realtime DB: ref.child().set()
            await firebaseRef.child(lead.phone).set(firebaseDoc);
          } else if (firebaseRef.push) {
            // Realtime DB alternative: ref.push()
            await firebaseRef.push(firebaseDoc);
          } else {
            throw new Error('Invalid Firebase reference');
          }
          
          successCount++;
          console.log(`✅ Lead uploaded: ${lead.phone}`);
          
        } catch (error: any) {
          failedCount++;
          const errorMsg = `Phone ${lead.phone}: ${error.message}`;
          errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }
      
      // Progress update every batch
      console.log(`📈 Progress: ${Math.min(i + batchSize, leads.length)}/${leads.length} processed`);
    }
    
  } catch (error: any) {
    console.error('❌ Batch upload error:', error);
    throw error;
  }
  
  console.log(`✅ Upload Complete: ${successCount} success, ${failedCount} failed`);
  
  return { success: successCount, failed: failedCount, errors };
};

/**
 * Complete workflow: CSV → Parse → Extract → Firebase
 * One-shot function for full CSV upload process
 * 
 * @param csvData - 2D array from parsed CSV
 * @param firebaseRef - Firebase collection reference
 * @param onProgress - Callback for progress updates
 * @returns Final upload result with detailed metrics
 */
export const handleCsvUpload = async (
  csvData: any[][],
  firebaseRef: any,
  onProgress?: (status: string, count: number) => void
): Promise<{
  success: boolean;
  message: string;
  details: {
    total_leads_found: number;
    successful_uploads: number;
    failed_uploads: number;
    duplicates_detected: number;
    invalid_entries: number;
    errors: string[];
  };
}> => {
  try {
    // Step 1: Process CSV
    onProgress?.('Processing CSV...', 0);
    const extractionResult = processCsvForUpload(csvData);
    
    if (extractionResult.leads.length === 0) {
      return {
        success: false,
        message: 'No valid phone numbers found in CSV',
        details: {
          total_leads_found: 0,
          successful_uploads: 0,
          failed_uploads: 0,
          duplicates_detected: extractionResult.duplicateCount,
          invalid_entries: extractionResult.invalidCount,
          errors: []
        }
      };
    }
    
    // Step 2: Upload to Firebase
    onProgress?.('Uploading to Firebase...', extractionResult.leads.length);
    const uploadResult = await uploadLeadsToFirebase(
      extractionResult.leads,
      firebaseRef,
      {
        additionalFields: {
          upload_batch_id: `batch_${Date.now()}`,
          batch_size: extractionResult.leads.length
        }
      }
    );
    
    // Step 3: Return final result
    const finalResult = {
      success: uploadResult.failed === 0,
      message: `Upload completed: ${uploadResult.success} leads added successfully`,
      details: {
        total_leads_found: extractionResult.leads.length,
        successful_uploads: uploadResult.success,
        failed_uploads: uploadResult.failed,
        duplicates_detected: extractionResult.duplicateCount,
        invalid_entries: extractionResult.invalidCount,
        errors: uploadResult.errors
      }
    };
    
    onProgress?.('Completed!', uploadResult.success);
    console.log('📊 Final Upload Report:', finalResult);
    
    return finalResult;
    
  } catch (error: any) {
    console.error('❌ CSV Upload error:', error);
    return {
      success: false,
      message: 'CSV upload failed',
      details: {
        total_leads_found: 0,
        successful_uploads: 0,
        failed_uploads: 0,
        duplicates_detected: 0,
        invalid_entries: 0,
        errors: [error.message]
      }
    };
  }
};
