<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# Quick Reference: Phone Number Handling

## One-Line Summary
**Database**: Clean 10-digit (9876543210) | **Display**: Formatted (+91 98765 43210)

---

## Quick API Cheat Sheet

```typescript
import {
  normalizeNumber,           // Input â†’ 10-digit clean
  extractPhoneNumbers,       // Text â†’ extract all numbers
  formatPhoneForDisplay,     // 10-digit â†’ UI format (+91 98765 43210)
  isValidIndianPhone,        // Validation check
} from '@/src/lib/phoneExtractor';

// NORMALIZE (for database/validation)
normalizeNumber('+91 9876543210')  // '9876543210'

// EXTRACT (bulk import)
extractPhoneNumbers('Call 9876543210 or +91 9876543211')
// { leads: [{phone: '9876543210', ...}, {phone: '9876543211', ...}], duplicateCount: 0, invalidCount: 0 }

// FORMAT (for UI display)
formatPhoneForDisplay('9876543210')  // '+91 98765 43210'

// VALIDATE
isValidIndianPhone('9876543210')  // true
```

---

## Common Scenarios

### Scenario 1: User Pastes Text
```typescript
const userText = 'Call 9876543210 or +91 9876543211';
const { leads, invalidCount } = extractPhoneNumbers(userText, 'clipboard');

// leads = [
//   { phone: '9876543210', source: 'clipboard', originalValue: '9876543210' },
//   { phone: '9876543211', source: 'clipboard', originalValue: '+91 9876543211' }
// ]

// For Database: use lead.phone (clean 10-digit)
// For Display: use formatPhoneForDisplay(lead.phone)
```

### Scenario 2: User Uploads CSV
```typescript
const { leads, invalidCount, duplicateCount } = await extractFromTableData(
  csvParsedData,
  'csv'
);

// Same structure - clean, deduplicated, validated numbers ready for DB
```

### Scenario 3: Form Input Validation
```typescript
const userInput = '+91 9876543210';
const clean = normalizeNumber(userInput);

if (clean) {
  await saveToFirebase({ phone: clean });  // Store clean format
} else {
  Alert.alert('Invalid number');
}
```

---

## Input â†’ Output Examples

| Input | `normalizeNumber()` | `formatPhoneForDisplay()` |
|-------|-------------------|------------------------|
| `9876543210` | `'9876543210'` | `'+91 98765 43210'` |
| `+91 9876543210` | `'9876543210'` | `'+91 98765 43210'` |
| `98765-43210` | `'9876543210'` | `'+91 98765 43210'` |
| `(987) 654-3210` | `'9876543210'` | `'+91 98765 43210'` |
| `0876543210` | `null` | N/A |
| `100` | `null` | N/A |

---

## Database vs UI

```
ALWAYS:
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ User Input (any format)             â”‚
â”‚ "Call +91 9876543210 or 98765-43210"â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
             â”‚
             â”œâ”€â†’ normalizeNumber() â†’ '9876543210' â”€â”€â†’ SAVE TO DATABASE
             â”‚                                          (clean 10-digit)
             â”‚
             â””â”€â†’ formatPhoneForDisplay() â†’ '+91 98765 43210' â”€â”€â†’ SHOW IN UI
                                                (formatted version)
```

---

## Rules

âœ“ **Valid numbers start with**: 6, 7, 8, 9  
âœ“ **Must be exactly**: 10 digits  
âœ— **Cannot be**: Emergency numbers (100, 101, 112, etc.)  
âœ— **Cannot start with**: 0, 1, 2, 3, 4, 5  

---

## Functions at a Glance

| Function | Input | Output | Use For |
|----------|-------|--------|---------|
| `normalizeNumber()` | Any format | `'9876543210'` or `null` | Database, validation |
| `extractPhoneNumbers()` | Text | `ExtractionResult` | Bulk text import |
| `formatPhoneForDisplay()` | `'9876543210'` | `'+91 98765 43210'` | UI display |
| `isValidIndianPhone()` | `'9876543210'` | `true/false` | Extra validation |
| `extractFromTableData()` | CSV/Excel 2D array | `ExtractionResult` | File imports |

---

## Integration Points

### In LeadReviewPanel
```typescript
// Display uses formatting
<Text>{formatPhoneForDisplay(lead.phone)}</Text>

// Save uses clean format
await firestore.collection('leads').add({
  phone: lead.phone  // Already clean from extraction
});
```

### In PasteLeadsScreen
```typescript
const { leads } = extractPhoneNumbers(pastedText, 'clipboard');

// Preview shows formatted
{leads.map(lead => (
  <Text>{formatPhoneForDisplay(lead.phone)}</Text>
))}

// Save to Firebase uses clean format
```

### In importServices.ts
```typescript
// All extraction services return normalized leads
return {
  leads: [...],  // Each lead.phone is already clean 10-digit
  duplicateCount,
  invalidCount
};
```

---

## Testing

```typescript
// Quick test in console
import { normalizeNumber, extractPhoneNumbers } from '@/src/lib/phoneExtractor';

normalizeNumber('+91 9876543210');  // '9876543210'
extractPhoneNumbers('Call 9876543210');  // Shows extraction result
```

---

## Gotchas

âŒ **DON'T store formatted numbers**:
```typescript
// WRONG
firestore.add({ phone: '+91 98765 43210' })
```

âœ… **DO store clean numbers**:
```typescript
// CORRECT
firestore.add({ phone: '9876543210' })
```

---

## All Supported Input Formats

âœ“ `9876543210`  
âœ“ `+91 9876543210`  
âœ“ `+919876543210`  
âœ“ `91 9876543210`  
âœ“ `91 98765 43210`  
âœ“ `98765-43210`  
âœ“ `98765.43210`  
âœ“ `(987) 654-3210`  
âœ“ `Call 9876543210` (inside text)  
âœ“ `Multiple: 9876543210, +91 9876543211` (multiple in one text)  

---

**Status**: âœ… Production Ready  
**Database Format**: 10-digit clean (9876543210)  
**Display Format**: +91 98765 43210  
**Zero AI/ML**: Pure regex-based local processing


