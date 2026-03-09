<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# ðŸ¤– AI Image Extraction Feature - Complete Documentation

## Overview

This feature allows users to upload images (screenshots, business cards, documents) and automatically extract Indian phone numbers using **Google Gemini Vision API**.

The extracted numbers are:
- âœ… Validated (10 digits, starting with 6-9)
- âœ… Deduplicated automatically
- âœ… Shown with confidence scores
- âœ… Ready to save to Firebase

---

## ðŸ“ File Structure

```
src/
â”œâ”€â”€ services/
â”‚   â””â”€â”€ geminiExtractor.ts          # Gemini API integration
â”œâ”€â”€ features/leads/
â”‚   â””â”€â”€ ImageImportScreen.tsx       # UI for image selection & extraction
â””â”€â”€ app/
    â””â”€â”€ image-import.tsx            # Route configuration
    
.env.local                          # Environment variables (API key)
```

---

## ðŸ”§ Setup & Configuration

### 1. Get Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Create a new API key
4. Copy the key

### 2. Configure Environment Variable

Create `.env.local` file in project root:

```bash
EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

**Important Security Notes:**
- âœ… Never commit `.env.local` to git
- âœ… Add to `.gitignore`:
  ```
  .env*
  !.env.example
  ```
- âœ… Use `.env.example` for documentation:
  ```
  EXPO_PUBLIC_GEMINI_API_KEY=your_api_key_here_replace_me
  ```

### 3. Install Dependencies (if needed)

```bash
npx expo install expo-image-picker
# Already installed in your project
```

---

## ðŸŽ¯ How It Works

### User Flow

```
User taps "ðŸ¤– AI Image Extraction"
        â†“
Select image from gallery
        â†“
Image converted to base64
        â†“
Sent to Gemini Vision API with OCR prompt
        â†“
Gemini extracts phone numbers from image
        â†“
Validated & deduplicated (6-9 start only)
        â†“
Show preview with confidence scores
        â†“
User can delete/modify numbers
        â†“
Save to Firebase
```

### Data Flow Diagram

```
Gallery
   â†“
ImagePicker
   â†“ (base64)
ImageImportScreen
   â†“
GeminiPhoneExtractor
   â†“ (API call)
Gemini Vision API
   â†“ (JSON response)
validatePhoneNumbers()
   â†“
deduplicatePhonesFromImage()
   â†“
Lead List (with confidence)
   â†“
FirebaseaddLead()
   â†“
Firebase Realtime Database
```

---

## ðŸ’» API Integration Details

### Gemini Request

```typescript
POST /v1beta/models/gemini-1.5-flash:generateContent?key=YOUR_KEY

{
  "contents": [{
    "parts": [
      { "text": "Extract Indian phone numbers..." },
      { 
        "inlineData": {
          "mimeType": "image/jpeg",
          "data": "base64_image_data"
        }
      }
    ]
  }],
  "generationConfig": {
    "temperature": 0.2,
    "maxOutputTokens": 1024
  }
}
```

### Gemini Response

```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "{\"found\": [{\"number\": \"9876543210\", \"confidence\": 0.95}], \"totalScanned\": 5}"
      }]
    }
  }]
}
```

### Phone Validation

Extracted numbers must meet:
- âœ… Exactly 10 digits
- âœ… First digit: 6, 7, 8, or 9 (Indian mobile standard)
- âœ… No special characters or formatting
- âœ… Not an emergency number

---

## ðŸš€ Usage Examples

### Basic Usage - In Component

```typescript
import { createGeminiExtractorWithKey } from '@/src/services/geminiExtractor';
import { formatPhoneForDisplay } from '@/src/lib/phoneExtractor';

// Initialize extractor
const extractor = createGeminiExtractorWithKey('YOUR_API_KEY');

// Extract from base64 image
const result = await extractor.extractPhoneNumbers(base64Data, 'image/jpeg');

if (result.success) {
  console.log(`Found ${result.phones.length} valid numbers`);
  
  result.phones.forEach(phone => {
    console.log(`${formatPhoneForDisplay(phone.phone)} (${Math.round(phone.confidence * 100)}%)`);
  });
} else {
  console.error('Extraction failed:', result.error);
}
```

### Using ImageImportScreen

```typescript
// Navigate to image extraction
router.push({ pathname: '/image-import' });

// User selects image â†’ AI extraction â†’ Save to Firebase
// Fully handled in ImageImportScreen component
```

---

## ðŸ§ª Testing

### Test Cases

#### âœ… Valid Scenarios

1. **Screenshot with phone numbers**
   - Image: Screenshot of contact list
   - Expected: All valid numbers extracted with high confidence

2. **Business card**
   - Image: Business card photo
   - Expected: Phone numbers identified, formatted correctly

3. **Mixed content**
   - Image: Document with text and numbers
   - Expected: Only phone numbers extracted, other numbers ignored

4. **Blurry image**
   - Image: Low quality photo
   - Expected: Numbers extracted with lower confidence score

#### âŒ Error Scenarios

1. **No numbers in image**
   - Input: Random photo
   - Expected: Error message "No phone numbers found"

2. **Invalid image format**
   - Input: Corrupted file
   - Expected: Error message "Could not read image"

3. **API key missing**
   - Setup: No EXPO_PUBLIC_GEMINI_API_KEY
   - Expected: Error message "API key not configured"

4. **Network failure**
   - Setup: Offline mode
   - Expected: Error message with retry option

### Manual Test Commands

```bash
# Build and run on Android
eas build --platform android --profile preview

# Run on web
npm run web

# Run on iOS (Mac only)
eas build --platform ios --profile preview
```

---

## ðŸ›¡ï¸ Security Best Practices

### âœ… Do's

- âœ… Store API key in `.env.local`
- âœ… Use environment variables only
- âœ… Never hardcode keys in components
- âœ… Validate all user inputs
- âœ… Log errors for debugging
- âœ… Add `.env*` to `.gitignore`

### âŒ Don'ts

- âŒ Never commit `.env.local` to git
- âŒ Never expose API key in client code
- âŒ Don't skip phone number validation
- âŒ Don't log sensitive data
- âŒ Don't trust API responses blindly

---

## ðŸ“Š Performance Considerations

### Image Size Limits

| Size | Processing Time | Quality |
|------|-----------------|---------|
| < 1 MB | ~2-4s | âœ… Optimal |
| 1-5 MB | ~4-6s | âš ï¸ Good |
| > 5 MB | ~6-10s | âš ï¸ Slow |

### Optimization Tips

```typescript
// Compress image before sending
const quality = 0.8; // 80% quality
const base64Data = await ImagePicker.launchImageLibraryAsync({
  quality, // This setting compresses the image
  base64: true,
});

// Use low temperature for consistent results
const generationConfig = {
  temperature: 0.2, // Lower = more consistent
  maxOutputTokens: 1024,
};
```

### Rate Limiting

- Google Gemini API: 60 requests/minute (free tier)
- Implement retry logic for failed requests
- Add exponential backoff for rate limiting

---

## ðŸ› Troubleshooting

### Problem: "API key not configured"

**Solution:**
```bash
# Check .env.local exists
cat .env.local

# Verify key is set
echo $EXPO_PUBLIC_GEMINI_API_KEY

# Reload Expo
npx expo start -c  # Clear cache and restart
```

### Problem: "No numbers found in valid images"

**Possible Causes:**
1. Image quality too low
2. Numbers not clearly visible
3. Non-Indian phone format

**Solution:**
```typescript
// Check debug info
if (result.debugInfo) {
  console.log('Raw response:', result.debugInfo.geminiResponse);
}

// Try different image
// Ensure numbers start with 6-9
```

### Problem: "Permission denied" on image selection

**Solution:**
```typescript
// Already handled in ImageImportScreen
// But ensure permissions are granted:
// Settings â†’ Permissions â†’ Photos/Media
```

### Problem: Slow extraction (>10 seconds)

**Solution:**
1. Check image size < 1 MB
2. Check internet connection
3. Reduce image quality in picker
4. Wait for API response (normal on slow networks)

---

## ðŸ“ˆ Monitoring & Analytics

### Suggested Metrics to Track

```typescript
// Track extraction success
console.log(`Success rate: ${successCount}/${totalAttempts}`);

// Track average processing time
console.log(`Avg time: ${totalTime / count}ms`);

// Track number of extracted leads
console.log(`Total extracted: ${leads.length}`);

// Track validation stats
console.log(`Valid: ${validCount}, Invalid: ${invalidCount}`);
```

### Example Analytics Implementation

```typescript
const trackExtraction = (result: GeminiExtractionResult) => {
  firebase.analytics().logEvent('image_extraction', {
    success: result.success,
    found: result.totalFound,
    valid: result.validNumbers,
    invalid: result.invalidNumbers,
    process_time: result.debugInfo?.processTime,
  });
};
```

---

## ðŸ”„ Updating & Maintenance

### Check for API Updates

```bash
# Check Gemini API docs
https://ai.google.dev/docs/quickstart

# Monitor for deprecations
# Subscribe to Google AI updates
```

### Version Compatibility

| Component | Min Version | Tested |
|-----------|-------------|--------|
| React Native | 0.71 | âœ… 0.73 |
| Expo | 50.0 | âœ… 50.0+ |
| Gemini API | v1beta | âœ… v1beta |

---

## ðŸ“š References

- [Google Gemini API Docs](https://ai.google.dev/)
- [Vision Capabilities](https://ai.google.dev/tutorials/vision_quickstart)
- [Expo Image Picker](https://docs.expo.dev/build-reference/infrastructure/)
- [Firebase Realtime DB](https://firebase.google.com/docs/database)

---

## ðŸŽ“ Next Steps

1. âœ… Complete setup with `.env.local`
2. âœ… Test with sample images
3. âœ… Monitor extraction quality
4. âœ… Collect user feedback
5. âœ… Optimize confidence thresholds
6. âœ… Implement analytics tracking

---

## ðŸ“ž Support & Debugging

### Enable Debug Logs

```typescript
// In geminiExtractor.ts, logs are already included:
console.log('ðŸ¤– Sending image to Gemini API...');
console.log('ðŸ“Š Extraction Result:', result);

// Check browser console (Web)
// Check logcat (Android)
// Check Console app (iOS)
```

### Report Issues

Include:
- ðŸ“± Device/Platform (Android/iOS/Web)
- ðŸ–¼ï¸ Image used (if possible)
- ðŸ“‹ Console logs
- â±ï¸ Processing time
- ðŸ”‘ API key validity (not the key itself!)

---

## âœ¨ Feature Requests

Potential enhancements:
- [ ] Batch image processing
- [ ] Custom confidence threshold
- [ ] OCR language selection
- [ ] Export extracted data as CSV
- [ ] Add notes to extracted numbers
- [ ] Integration with Google Contacts API
- [ ] Offline extraction (using MLKit)

---

**Last Updated:** February 3, 2026  
**Status:** âœ… Production Ready  
**Tested On:** Android, iOS, Web (Expo)


