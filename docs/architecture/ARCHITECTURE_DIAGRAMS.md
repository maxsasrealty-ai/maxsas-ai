# 🎯 AI Image Extraction - Visual Architecture & Flow Diagrams

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MAXSAS REALTY APP                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    USER INTERFACE LAYER                   │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ImportsScreen                                           │   │
│  │  ├─ Manual Entry          ──→ AddLeadScreen            │   │
│  │  ├─ Paste from Clipboard ──→ PasteLeadsScreen         │   │
│  │  ├─ CSV Upload           ──→ UploadLeadsScreen        │   │
│  │  ├─ PDF Upload           ──→ UploadLeadsScreen        │   │
│  │  └─ 🤖 AI Image          ──→ ImageImportScreen  ✨    │   │
│  │                                                          │   │
│  └────────────────┬─────────────────────────────────────────┘   │
│                   │                                               │
│  ┌────────────────▼─────────────────────────────────────────┐   │
│  │          IMAGE IMPORT SCREEN (NEW COMPONENT)            │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ✓ Image Picker                                          │   │
│  │  ✓ Base64 Conversion                                    │   │
│  │  ✓ Preview Display                                      │   │
│  │  ✓ Loading States                                       │   │
│  │  ✓ Error Handling                                       │   │
│  └────────────────┬─────────────────────────────────────────┘   │
│                   │                                               │
│  ┌────────────────▼─────────────────────────────────────────┐   │
│  │        SERVICE LAYER - GEMINI EXTRACTOR                │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  📦 GeminiPhoneExtractor Class                           │   │
│  │  ├─ Base64Image + MimeType                             │   │
│  │  ├─ API Request Construction                           │   │
│  │  ├─ HTTP Call to Gemini                                │   │
│  │  ├─ Response Parsing                                   │   │
│  │  ├─ Phone Validation                                   │   │
│  │  └─ Deduplication                                      │   │
│  └────────────────┬─────────────────────────────────────────┘   │
│                   │                                               │
│  ┌────────────────▼─────────────────────────────────────────┐   │
│  │          VALIDATION LAYER                                │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ✓ validatePhoneWithMessage()                            │   │
│  │  ✓ 10-digit validation                                   │   │
│  │  ✓ First digit check (6-9)                              │   │
│  │  ✓ Emergency number rejection                           │   │
│  │  ✓ Format validation                                    │   │
│  └────────────────┬─────────────────────────────────────────┘   │
│                   │                                               │
│  ┌────────────────▼─────────────────────────────────────────┐   │
│  │            FORMATTING LAYER                              │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ✓ formatPhoneForDisplay()  →  +91 98765 43210         │   │
│  │  ✓ Database format         →  9876543210               │   │
│  └────────────────┬─────────────────────────────────────────┘   │
│                   │                                               │
│  ┌────────────────▼─────────────────────────────────────────┐   │
│  │           PERSISTENCE LAYER                                │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │  ✓ addLead()  →  Firebase Realtime DB                  │   │
│  │  ✓ Metadata:  source: 'image', confidence, timestamp    │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Google Gemini Vision API                                       │
│  ├─ Input: Base64 Image + OCR Prompt                           │
│  ├─ Processing: Vision AI + Phone Number Extraction            │
│  └─ Output: JSON with extracted numbers + confidence           │
│                                                                   │
│  Firebase Realtime Database                                     │
│  ├─ Collection: /leads                                         │
│  ├─ Fields: phone, source, confidence, timestamp               │
│  └─ Rules: Validation + Security                               │
│                                                                   │
│  Expo Image Picker                                              │
│  ├─ Platform: Android, iOS, Web                                │
│  ├─ Output: Image URI + Base64                                 │
│  └─ Permissions: Photo Library Access                          │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

```
USER INPUT
   │
   ├─→ Gallery Selection
   │      │
   │      ├─→ expo-image-picker
   │      │      │
   │      └─→ Image URI + Base64
   │
   ▼
IMAGE PROCESSING
   │
   ├─→ ImageImportScreen
   │      │
   │      ├─→ Display preview
   │      ├─→ Show loading state
   │      └─→ Call GeminiPhoneExtractor
   │
   ▼
AI EXTRACTION
   │
   ├─→ GeminiPhoneExtractor
   │      │
   │      ├─→ Construct API payload
   │      ├─→ POST to Gemini API
   │      │      │
   │      │      └─→ {
   │      │            "found": [
   │      │              {"number": "9876543210", "confidence": 0.95}
   │      │            ]
   │      │          }
   │      │
   │      ├─→ Parse JSON response
   │      └─→ Map to ExtractedPhoneFromImage[]
   │
   ▼
VALIDATION
   │
   ├─→ For each phone:
   │      │
   │      ├─→ Check length === 10
   │      ├─→ Check first digit in [6,7,8,9]
   │      ├─→ Check format (digits only)
   │      ├─→ Check not emergency number
   │      │
   │      ├─→ Valid:   Add to results
   │      └─→ Invalid: Skip with warning
   │
   ├─→ Deduplication
   │      │
   │      └─→ Remove duplicate phone numbers
   │
   ▼
PRESENTATION
   │
   ├─→ Map to UI format
   │      │
   │      └─→ {
   │            phone: "+91 98765 43210",
   │            phoneRaw: "9876543210",
   │            confidence: 0.95,
   │            source: "image"
   │          }
   │
   ├─→ Display in ImageImportScreen
   │      │
   │      ├─→ Show number list
   │      ├─→ Show confidence badges
   │      └─→ Allow delete/edit
   │
   ▼
USER ACTION
   │
   ├─→ Review numbers
   ├─→ Delete unwanted
   └─→ Tap "Save"
       │
       ▼
FIREBASE SAVE
   │
   ├─→ For each phone:
   │      │
   │      ├─→ Call addLead({
   │      │      phone: "9876543210",
   │      │      source: "image",
   │      │      confidence: 0.95,
   │      │      status: "new",
   │      │      createdAt: timestamp
   │      │    })
   │      │
   │      └─→ Firebase Realtime DB stores
   │
   ├─→ Show success message
   │
   └─→ Navigate back
```

---

## Component Relationship Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    IMPORT SCREEN FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│              ┌─────────────────────────────┐                 │
│              │    ImportsScreen (Hub)      │                 │
│              └────────┬────────────────────┘                 │
│                       │                                       │
│        ┌──────────────┼──────────────┬──────────────┐        │
│        │              │              │              │        │
│        ▼              ▼              ▼              ▼        │
│    Manual Entry   Clipboard      CSV/Excel       🤖 AI     │
│    AddLeadScreen  PasteLeads    UploadLeads  ImageImport   │
│                                                               │
│                                                               │
│              ┌──────────────────────────────┐               │
│              │ LeadReviewPanel (Universal)  │               │
│              │ Shows extracted leads        │               │
│              │ Allows delete/edit           │               │
│              │ Save/Cancel actions          │               │
│              └──────────────────────────────┘               │
│                       ▲                                       │
│                       │ (Common component)                   │
│                       │                                       │
│        ┌──────────────┼──────────────┬──────────────┐        │
│        │              │              │              │        │
│        ▼              ▼              ▼              ▼        │
│    Manual Entry   Clipboard      CSV/Excel       🤖 AI     │
│    AddLeadScreen  PasteLeads    UploadLeads  ImageImport   │
│                                                               │
│                                                               │
│              ┌──────────────────────────────┐               │
│              │    Firebase (addLead)        │               │
│              │    Saves all extracted leads │               │
│              └──────────────────────────────┘               │
│                       ▲                                       │
│                       │                                       │
│        ┌──────────────┼──────────────┬──────────────┐        │
│        │              │              │              │        │
└────────┼──────────────┼──────────────┼──────────────┘        │
         │              │              │              │        │
         ▼              ▼              ▼              ▼        │
    Manual Entry   Clipboard      CSV/Excel       🤖 AI     │
    AddLeadScreen  PasteLeads    UploadLeads  ImageImport   │
                                                               │
     Phone           Phone         Phone           Phone      │
    Validation    Validation     Validation      Validation  │
    normalizeNumber / validatePhoneWithMessage               │
```

---

## API Call Sequence Diagram

```
ImageImportScreen          GeminiExtractor         Gemini API
       │                        │                       │
       │  extractPhoneNumbers() │                       │
       │─────────────────────→  │                       │
       │                        │                       │
       │                        │  POST /v1beta/...     │
       │                        │──────────────────────→│
       │                        │                       │
       │                        │    🤖 Processing     │
       │                        │    (2-4 seconds)     │
       │                        │                       │
       │                        │  JSON Response       │
       │                        │←──────────────────────│
       │                        │                       │
       │                        │ Parse & Validate     │
       │                        │ ├─ Extract phones    │
       │                        │ ├─ Validate format   │
       │                        │ ├─ Deduplicate       │
       │                        │ └─ Add confidence    │
       │                        │                       │
       │  GeminiExtractionResult│                       │
       │←─────────────────────  │                       │
       │                        │                       │
       ├─ Display numbers                               │
       ├─ Show confidence                               │
       └─ Save to Firebase                             │
```

---

## State Machine - ImageImportScreen

```
                    ┌──────────────┐
                    │  INITIAL     │
                    │ (No Image)   │
                    └──────┬───────┘
                           │
                    User selects image
                           │
                           ▼
                    ┌──────────────┐
                    │   PREVIEW    │
                    │  (Image       │
                    │   Loaded)    │
                    └──────┬───────┘
                           │
                  User taps "Extract"
                           │
                           ▼
                    ┌──────────────┐
                    │ EXTRACTING   │
                    │ (Loading)    │
                    └──────┬───────┘
                           │
                    ┌──────┴──────┐
                    │             │
           Success  │             │  Error
                    ▼             ▼
            ┌──────────────┐  ┌──────────────┐
            │   PREVIEW    │  │     ERROR    │
            │  RESULTS     │  │  (Show msg)  │
            │ (Numbers,    │  └──────┬───────┘
            │  Confidence) │         │
            └──────┬───────┘    Retry/Back
                   │                 │
        User actions:          User selects image
        ├─ Delete             └──────────┘
        ├─ Save                    │
        └─ Back                    ▼
           │               (Back to INITIAL)
           └──→ Save to Firebase
               └──→ INITIAL (New cycle)
```

---

## File Structure Visualization

```
Maxsas-AI (Project Root)
│
├── app/
│   ├── image-import.tsx                    ✨ NEW
│   ├── (tabs)/
│   │   └── add-lead.tsx
│   └── ...
│
├── src/
│   ├── services/
│   │   └── geminiExtractor.ts              ✨ NEW (400 lines)
│   │
│   ├── features/leads/
│   │   ├── ImageImportScreen.tsx           ✨ NEW (500 lines)
│   │   ├── ImportsScreen.tsx               ✏️ MODIFIED (added option)
│   │   ├── AddLeadScreen.tsx               ✏️ MODIFIED (validation updated)
│   │   ├── PasteLeadsScreen.tsx
│   │   ├── UploadLeadsScreen.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── phoneExtractor.ts               ✅ Used (validation)
│   │   ├── firebase.ts                     ✅ Used (save)
│   │   └── ...
│   │
│   ├── components/ui/
│   │   ├── AppButton.tsx                   ✅ Used
│   │   ├── AppHeader.tsx                   ✅ Used
│   │   └── ...
│   │
│   ├── examples/                           ✨ NEW
│   │   └── geminiExtractionExamples.ts    (7 examples)
│   │
│   └── theme/
│       └── use-app-theme.ts                ✅ Used
│
├── Documentation/
│   ├── IMAGE_EXTRACTION_GUIDE.md           ✨ NEW (60 pages)
│   ├── QUICK_START_IMAGE_EXTRACTION.md     ✨ NEW (setup)
│   ├── IMPLEMENTATION_SUMMARY.md           ✨ NEW (overview)
│   ├── IMPLEMENTATION_CHECKLIST.md         ✨ NEW (checklist)
│   └── This file                           ✨ NEW (diagrams)
│
├── .env.local                              ✨ NEW (API key)
├── .gitignore                              (should include .env*)
├── package.json
└── tsconfig.json
```

---

## Technology Stack Diagram

```
┌────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                      │
├────────────────────────────────────────────────────────────┤
│  React Native (Expo)                                        │
│  ├─ Components: ImageImportScreen                           │
│  ├─ State: useState, loading, extractedPhones              │
│  ├─ Navigation: router (expo-router)                        │
│  └─ Theme: useAppTheme (custom)                            │
└────────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│   IMAGE HANDLING     │   │   UI COMPONENTS      │
├──────────────────────┤   ├──────────────────────┤
│ expo-image-picker    │   │ AppButton            │
│ ├─ Gallery access    │   │ AppHeader            │
│ ├─ Permissions       │   │ AppCard              │
│ └─ Base64 encoding   │   │ ScreenContainer      │
│                      │   │ Ionicons             │
│ React Native Image   │   └──────────────────────┘
│ ├─ Image preview     │
│ └─ Display          │
└──────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
├────────────────────────────────────────────────────────────┤
│  GeminiPhoneExtractor                                       │
│  ├─ API client class                                        │
│  ├─ Image-to-JSON conversion                               │
│  ├─ Phone validation logic                                 │
│  └─ Error handling                                         │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                 EXTERNAL API LAYER                          │
├────────────────────────────────────────────────────────────┤
│  Google Gemini Vision API (v1beta)                          │
│  ├─ Model: gemini-1.5-flash                                │
│  ├─ Input: Base64 Image + OCR Prompt                        │
│  ├─ Output: JSON with extracted numbers                    │
│  └─ Authentication: API Key (env var)                      │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│                 VALIDATION LAYER                            │
├────────────────────────────────────────────────────────────┤
│  Phone Validation (phoneExtractor.ts)                       │
│  ├─ normalizeNumber()                                       │
│  ├─ validatePhoneWithMessage()                              │
│  ├─ formatPhoneForDisplay()                                 │
│  └─ isValidIndianPhone()                                    │
└────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────┐
│              PERSISTENCE LAYER (FIREBASE)                   │
├────────────────────────────────────────────────────────────┤
│  Firebase Realtime Database                                │
│  ├─ addLead(leadData)  → /leads/[leadId]                  │
│  ├─ Fields: phone, source, confidence, timestamp            │
│  └─ Rules: Validation + Authentication                      │
└────────────────────────────────────────────────────────────┘
```

---

## Integration Points Diagram

```
ImageImportScreen
│
├─→ Uses: expo-image-picker
│   └─→ Returns: Image URI + Base64
│
├─→ Calls: GeminiPhoneExtractor.extractPhoneNumbers()
│   └─→ Returns: GeminiExtractionResult
│
├─→ Uses: validatePhoneWithMessage()
│   └─→ Returns: { valid, normalized, error }
│
├─→ Uses: formatPhoneForDisplay()
│   └─→ Returns: "+91 XXXXX XXXXX"
│
├─→ Uses: addLead()
│   └─→ Saves to Firebase
│
├─→ Uses: useAppTheme()
│   └─→ Returns: Theme colors
│
├─→ Uses: router (expo-router)
│   └─→ Handles: Navigation
│
└─→ Renders: UI Components
    ├─ AppButton
    ├─ AppHeader
    ├─ ScreenContainer
    ├─ Image
    ├─ View
    ├─ Text
    ├─ ActivityIndicator
    └─ ScrollView
```

---

## Error Handling Flow

```
ImageImportScreen
│
├─→ Pick Image
│   ├─ Permission denied  →  Alert "Permission Required"
│   └─ Cancel/Error      →  Silently handle
│
├─→ Convert to Base64
│   ├─ No base64         →  Alert "Could not read image"
│   └─ Success          →  Continue
│
├─→ Call Gemini API
│   ├─ Network error     →  Alert with error message
│   ├─ API error (401)   →  Check API key
│   ├─ API error (429)   →  Rate limited - retry later
│   ├─ API error (500)   →  Server error - retry
│   └─ Success          →  Continue
│
├─→ Parse Response
│   ├─ Invalid JSON      →  Alert "Invalid response"
│   └─ Valid JSON        →  Continue
│
├─→ Validate Phones
│   ├─ No numbers       →  Alert "No numbers found"
│   ├─ All invalid      →  Alert with details
│   └─ Some valid       →  Show valid, skip invalid
│
└─→ Save to Firebase
    ├─ Auth error       →  Alert "Not authenticated"
    ├─ Network error    →  Alert "Connection failed"
    └─ Success         →  Show success & navigate back
```

---

**These diagrams provide a complete visual understanding of:**
- System architecture
- Data flow
- Component relationships
- API interactions
- State management
- Technology stack
- Error handling
- File organization
- Integration points

Refer back to these when:
- Extending the feature
- Debugging issues
- Understanding the flow
- Training team members
- Documenting changes
