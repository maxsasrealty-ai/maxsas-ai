# 🤖 AI Image Extraction - Troubleshooting Guide

## ❌ Problem: "Lead from Screenshot" with NO phone numbers

### Root Cause
You're clicking on the **WRONG button**. There are TWO different image options:

## Button Comparison

| Feature | ❌ Gallery/Image | ✅ 🤖 AI Image Extraction |
|---------|------------------|--------------------------|
| **Icon** | Purple image icon | Red camera icon with 🤖 |
| **Color** | Purple | Red/Pink |
| **Description** | "Attach for reference only" | "Extract numbers from screenshots with AI" |
| **What it does** | Just saves filename as lead | Extracts phone numbers using AI |
| **Loading time** | Instant (no wait) | 2-6 seconds (shows spinner) |
| **Result** | "Lead from Screenshot.png" | "+91 XXXXX XXXXX" numbers |
| **Has phone field?** | ❌ NO | ✅ YES |
| **Save works?** | ❌ NO (Firebase permission error) | ✅ YES |

## How to Find the RIGHT Button

### Step-by-Step:
1. **Open app** → Go to **Leads** tab
2. Tap **Add** (green button)
3. You'll see multiple import options:
   - ✅ Manual Entry
   - ✅ Paste from Clipboard
   - ✅ CSV Upload
   - ✅ Excel Upload
   - ✅ PDF Upload
   - ❌ **Gallery/Image** ← DON'T use this
   - ✅ **🤖 AI Image Extraction** ← USE THIS ONE!

### Visual Indicator:
Look for the **RED/PINK card** with **camera icon** and **🤖 emoji**

## After Clicking the RIGHT Button

You should see:
1. **"📷 Select Image from Gallery"** button
2. Click it → Select image from phone
3. See **"🤖 Extracting phone numbers with AI..."** loading message
4. Wait 2-6 seconds
5. Numbers appear with **confidence scores**
6. Tap **"💾 Save"** to add to Firebase

## If it Still Doesn't Work

### Check:
1. Is there a loading spinner after selecting image?
   - YES → ✅ Correct button, might be API issue
   - NO → ❌ Wrong button, try again

2. Look at browser console (F12):
   - Should see: `"🚀 Starting phone extraction from image..."`
   - Then: `"📊 Extraction result: {success: true, phones: [...]}`

3. Does the image have visible phone numbers?
   - Clear contact lists work best
   - Screenshots with phone numbers in text format

## Quick Fix

**If you keep clicking Gallery/Image by mistake:**

The old button should ideally be hidden or renamed since AI extraction is better. Consider:
- Moving AI button to position 2 or 3
- Removing or hiding the old Gallery/Image option
- Making AI button more prominent

---

**Status:** ✅ Feature works fine  
**Issue:** User confusion between two similar buttons  
**Solution:** Use the RED/PINK **🤖 AI Image Extraction** button, not the purple Gallery button
