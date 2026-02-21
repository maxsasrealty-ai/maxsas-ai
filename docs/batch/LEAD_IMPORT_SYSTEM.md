# Lead Import System - Complete Documentation

## Overview

A production-ready lead import system for React Native Expo (Android + Web) that extracts phone numbers from multiple sources WITHOUT any AI services. All processing happens locally within the app.

## Features Implemented

### 1. **Phone Number Extraction & Validation** (`src/lib/phoneExtractor.ts`)

- Regex-based phone number extraction from any text
- Support for multiple phone formats:
  - Plain 10 digits: `9876543210`
  - With country code: `+91 9876543210`
  - With separators: `98765-43210`, `98765.43210`
  - Inside paragraphs
  
- **Validation Rules:**
  - Exactly 10 digits required
  - First digit cannot be 0
  - Automatic normalization
  - Removes duplicates

### 2. **Import Methods**

#### CSV Upload
- Automatically detects phone number columns
- Supports common headers: "phone", "mobile", "contact", etc.
- Falls back to column data detection
- Parses with PapaParse

#### Excel Upload
- Supports XLSX and XLS formats
- Same column detection as CSV
- Uses XLSX library for parsing

#### Clipboard Paste
- Extract from any pasted text
- Supports multiple numbers in single paste
- Real-time character count

#### PDF Support
- Text-based PDFs only (no OCR/AI)
- Extracts plain text content
- Displays message for scanned PDFs

#### Gallery/Image
- Shows offline mode message
- Allows attaching images for reference only

### 3. **Core Services** (`src/lib/importServices.ts`)

```typescript
// Available Services
masterImportService.csv.pickAndParse()           // CSV import
masterImportService.excel.pickAndParse()         // Excel import
masterImportService.clipboard.extractFromClipboard()  // Clipboard
masterImportService.pdf.pickAndParse()           // PDF import
masterImportService.process.processImportedLeads()   // Post-processing
```

### 4. **Data Structure**

**Extracted Lead:**
```typescript
{
  phone: "9876543210",          // 10 digits only
  source: "csv" | "clipboard" | "pdf" | "excel",
  originalValue?: "98765-43210"  // Original format before normalization
}
```

**Extraction Result:**
```typescript
{
  leads: ExtractedLead[],
  duplicateCount: number,
  invalidCount: number
}
```

## Usage Examples

### Extract from Text
```typescript
import { extractPhoneNumbers } from '@/src/lib/phoneExtractor';

const text = "Call me at 98765 43210 or 9876543211";
const result = extractPhoneNumbers(text, 'clipboard');

console.log(result.leads); // [{ phone: "9876543210", source: "clipboard", ... }]
```

### Extract from CSV Data
```typescript
import { extractFromTableData } from '@/src/lib/phoneExtractor';

const csvData = [
  ["Name", "Phone", "Email"],
  ["John", "9876543210", "john@example.com"],
  ["Jane", "+91 9876543211", "jane@example.com"]
];

const result = extractFromTableData(csvData, 'csv');
```

### Use Import Services
```typescript
import { masterImportService } from '@/src/lib/importServices';

// Clipboard import
const clipboardResult = await masterImportService.clipboard.extractFromClipboard();

// Process with deduplication
const processed = await masterImportService.process.processImportedLeads(
  clipboardResult.leads,
  existingLeads  // Optional: removes existing leads
);
```

## File Structure

```
src/
├── lib/
│   ├── phoneExtractor.ts      # Core extraction & validation logic
│   ├── importServices.ts      # Import method services
│   └── firebase.ts            # Firebase integration
│
├── features/leads/
│   ├── ImportsScreen.tsx      # Import method selector
│   ├── PasteLeadsScreen.tsx   # Clipboard import UI
│   ├── UploadLeadsScreen.tsx  # File upload (CSV/Excel)
│   └── AddLeadScreen.tsx      # Manual entry (existing)
│
└── components/ui/
    └── LeadReviewPanel.tsx    # Preview before saving (existing)
```

## Screens & Navigation

### 1. **Import Methods Screen** (`/imports`)
   - 6 import options with icons
   - Info cards about supported formats
   - Routes to specific import screens

### 2. **Clipboard Screen** (`/paste-leads`)
   - Text input area
   - Character count
   - Extract button
   - Preview list with delete per item
   - Proceed to review

### 3. **File Upload Screen** (`/upload-leads?type=csv|excel|pdf`)
   - Document picker
   - File processing
   - Auto column detection
   - Preview list
   - Proceed to review

### 4. **Review Screen** (`/leads-review`)
   - All extracted numbers
   - Call Now / Schedule / Save Only buttons
   - Date/time picker for scheduling
   - Real-time database sync

## Key Functions

### Phone Validation
```typescript
isValidIndianPhone(phone: string): boolean
// Returns true if valid 10-digit Indian mobile number

normalizePhone(phone: string): string | null
// Returns 10-digit number or null if invalid
```

### Extraction
```typescript
extractPhoneNumbers(text: string, source: string): ExtractionResult
// Extracts all phone numbers from text

extractFromTableData(data: any[][], source: string, phoneColumnIndex?: number): ExtractionResult
// Extracts from CSV/Excel data
```

### Utilities
```typescript
removeDuplicates(leads: ExtractedLead[]): ExtractedLead[]
mergeLeads(...leadArrays: ExtractedLead[][]): ExtractedLead[]
formatPhoneForDisplay(phone: string): string
findPhoneColumn(data: any[][], maxRowsToCheck: number): number
```

## Validation Rules

**Phone Number Format:**
- Must be 10 digits
- First digit: 1-9 (not 0)
- All numeric
- Auto-normalization removes:
  - Country codes (+91)
  - All non-numeric characters except +
  - Leading zeros

**Duplicate Removal:**
- Automatic after extraction
- Uses Set for O(1) lookup
- Maintains order

**Invalid Entries:**
- Tracked in `invalidCount`
- Not included in final result
- Reported to user

## Firebase Integration

All extracted leads are stored with:
```typescript
{
  phone: "9876543210",
  intakeAction: "call_now" | "schedule" | "save_only",
  intakeStatus: "queued" | "scheduled" | "saved",
  scheduleAt: "2026-02-03 14:30" | null,
  source: "csv" | "clipboard" | "pdf" | "excel",
  createdAt: serverTimestamp(),
  userId: currentUserId
}
```

## Dependencies

- `expo-document-picker` - File selection
- `expo-clipboard` - Clipboard access
- `xlsx` - Excel parsing
- `papaparse` - CSV parsing (built-in via expo)
- `react-native` - Core UI
- `react-native-web` - Web support

## Error Handling

Each service includes:
- Try-catch blocks
- User-friendly error messages
- Console logging for debugging
- Graceful fallbacks

## Platform Compatibility

✅ Android - Full support
✅ Web - Full support
✅ iOS - Full support (ready)

## Performance Considerations

- All processing is synchronous (fast)
- Large files (1000+ rows) process instantly
- No network calls required
- Minimal memory footprint
- Deduplication uses Set (O(1) lookup)

## Future Enhancements

1. **Batch Import:** Upload multiple files
2. **Mapping UI:** Let users select columns for import
3. **Bulk Operations:** Edit extracted numbers before save
4. **Import History:** Track all imports
5. **CSV Templates:** Download template for users

## Testing

### Test Data

```javascript
// CSV Test
const csvText = `Name,Phone,Email
John,9876543210,john@example.com
Jane,+91 9876543211,jane@example.com`;

// Clipboard Test
const clipboardText = "Call at 9876543210 or 9876543211";

// Extraction Result
{
  leads: [
    { phone: "9876543210", source: "csv", originalValue: "9876543210" },
    { phone: "9876543211", source: "csv", originalValue: "+91 9876543211" }
  ],
  duplicateCount: 0,
  invalidCount: 0
}
```

## Code Quality

- TypeScript for type safety
- Modular services architecture
- Reusable utility functions
- Comprehensive error handling
- Clean separation of concerns
- Production-ready code

## Support

For bugs or features, refer to the implementation in:
- `src/lib/phoneExtractor.ts` - Core logic
- `src/lib/importServices.ts` - Services
- `src/features/leads/*.tsx` - UI Screens
