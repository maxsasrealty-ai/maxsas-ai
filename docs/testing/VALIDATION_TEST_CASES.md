# Phone Number Validation - Test Cases

## ✅ Valid Numbers (Will be accepted)

| Input | Normalized Output | Notes |
|-------|------------------|-------|
| `9876543210` | `9876543210` | ✅ Perfect format |
| `8882453059` | `8882453059` | ✅ Starts with 8 |
| `7654321098` | `7654321098` | ✅ Starts with 7 |
| `6543210987` | `6543210987` | ✅ Starts with 6 |
| `+91 9876543210` | `9876543210` | ✅ With country code |
| `+919876543210` | `9876543210` | ✅ No space |
| `91 9876543210` | `9876543210` | ✅ Without + |
| `919876543210` | `9876543210` | ✅ No space or + |
| `98765 43210` | `9876543210` | ✅ With space |
| `98765-43210` | `9876543210` | ✅ With dash |
| `98765.43210` | `9876543210` | ✅ With dot |
| `(98765) 43210` | `9876543210` | ✅ With parentheses |

---

## ❌ Invalid Numbers (Will be rejected)

### 1️⃣ **Wrong Starting Digit (5, 4, 3, 2, 1, 0)**

| Input | Error Message |
|-------|--------------|
| `5876543210` | ❌ Invalid! Must start with 6, 7, 8, or 9. Your number starts with "5" |
| `4876543210` | ❌ Invalid! Must start with 6, 7, 8, or 9. Your number starts with "4" |
| `3876543210` | ❌ Invalid! Must start with 6, 7, 8, or 9. Your number starts with "3" |
| `2876543210` | ❌ Invalid! Must start with 6, 7, 8, or 9. Your number starts with "2" |
| `1876543210` | ❌ Invalid! Must start with 6, 7, 8, or 9. Your number starts with "1" |
| `0876543210` | ❌ Invalid! Must start with 6, 7, 8, or 9. Your number starts with "0" |
| `1234567890` | ❌ Invalid! Must start with 6, 7, 8, or 9. Your number starts with "1" |

### 2️⃣ **Wrong Length**

| Input | Error Message |
|-------|--------------|
| `98765` | ❌ Too short! You entered 5 digits, need 10 digits |
| `987654321` | ❌ Too short! You entered 9 digits, need 10 digits |
| `98765432109` | ❌ Too long! You entered 11 digits, need exactly 10 digits |
| `987654321098` | ❌ Too long! You entered 12 digits, need exactly 10 digits |
| `88888` | ❌ Too short! You entered 5 digits, need 10 digits |
| `77777` | ❌ Too short! You entered 5 digits, need 10 digits |

### 3️⃣ **Emergency Numbers**

| Input | Error Message |
|-------|--------------|
| `100` | ❌ Emergency numbers cannot be used |
| `101` | ❌ Emergency numbers cannot be used |
| `102` | ❌ Emergency numbers cannot be used |
| `112` | ❌ Emergency numbers cannot be used |
| `108` | ❌ Emergency numbers cannot be used |

### 4️⃣ **Empty or Invalid Format**

| Input | Error Message |
|-------|--------------|
| `` (empty) | ❌ Please enter a phone number |
| `   ` (spaces) | ❌ Please enter a phone number |
| `abcdefghij` | ❌ Please enter a phone number |
| `+91` | ❌ Please enter a phone number |

---

## 🎯 Real-World Test Examples

### From CSV File:
```csv
phone_number, name, email
9876543210,  John,  john@example.com     ✅ Valid
8882453059,  Jane,  jane@example.com     ✅ Valid
5876543210,  Bob,   bob@example.com      ❌ Invalid (starts with 5)
1234567890,  Alice, alice@example.com    ❌ Invalid (starts with 1)
88888,       Test,  test@example.com     ❌ Invalid (too short)
```

### From Manual Entry:
```
User types: "5987654321"
System shows: ❌ Invalid! Must start with 6, 7, 8, or 9. Your number starts with "5"

User types: "9876543210"
System shows: ✅ Lead added successfully!
```

### From Paste/Clipboard:
```
User pastes: "Call me at 9876543210 or 5432109876"
System extracts: 
  ✅ 9876543210 (valid)
  ❌ 5432109876 (rejected - starts with 5)
Result: 1 valid lead found
```

---

## 📊 Validation Summary

### ✅ **Accepted Digits (First Digit)**
- **6** - Valid Indian mobile
- **7** - Valid Indian mobile  
- **8** - Valid Indian mobile
- **9** - Valid Indian mobile

### ❌ **Rejected Digits (First Digit)**
- **0** - Landline/Invalid
- **1** - Landline/Invalid
- **2** - Landline/Invalid  
- **3** - Landline/Invalid
- **4** - Landline/Invalid
- **5** - Landline/Invalid

### 📏 **Length Requirements**
- Exactly **10 digits** required
- Country code **+91** is optional (auto-removed)
- Prefix **91** is optional (auto-removed)

---

## 🔧 How It Works Across All Methods

### 1. **CSV Upload** (`UploadLeadsScreen.tsx`)
```typescript
// Scans entire CSV file
// Extracts only valid 10-digit numbers starting with 6-9
// Shows: "3 valid leads found" (rejects invalid ones)
```

### 2. **Manual Entry** (`AddLeadScreen.tsx`)
```typescript
// User types phone number
// Validates on "Add Lead" button click
// Shows specific error if invalid
```

### 3. **Paste from Clipboard** (`PasteLeadsScreen.tsx`)
```typescript
// User pastes text with multiple numbers
// Automatically filters valid numbers
// Shows count: "Found 5 valid numbers (2 rejected)"
```

### 4. **All Methods → Firebase**
```typescript
// Only normalized 10-digit numbers saved
// Format: 9876543210 (no +91, no spaces)
// Display: +91 98765 43210 (formatted in UI)
```

---

## 🧪 Quick Test Commands

To test in your app:

### Test Manual Entry:
1. Go to "Add Lead" screen
2. Try typing: `5876543210`
3. Expected: Error message about invalid starting digit

### Test CSV Upload:
1. Create CSV with numbers starting with 1-5
2. Upload the CSV
3. Expected: Only numbers starting with 6-9 are extracted

### Test Paste:
1. Copy text: "Call 9876543210, 5432109876, 8765432109"
2. Paste in "Paste Leads" screen
3. Expected: Only 9876543210 and 8765432109 extracted

---

## ✅ Validation is Now Active Everywhere!

Every input method now enforces the same rules:
- ✅ Must be exactly 10 digits
- ✅ Must start with 6, 7, 8, or 9
- ✅ Emergency numbers rejected
- ✅ Invalid formats rejected with helpful error messages
