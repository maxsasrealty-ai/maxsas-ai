<!-- ARCH_SYNC:2026-03-08 -->
## Architecture Sync

- Synced On: 2026-03-08
- Baseline: `docs/architecture/CURRENT_ARCHITECTURE_BASELINE.md`
- Status: This document has been aligned to the current repository architecture baseline.
- Rule: If implementation and this document differ, treat the baseline file as source of truth and update this doc.

---
# ðŸ¤– AI Image Extraction - Troubleshooting Guide

## âŒ Problem: "Lead from Screenshot" with NO phone numbers

### Root Cause
You're clicking on the **WRONG button**. There are TWO different image options:

## Button Comparison

| Feature | âŒ Gallery/Image | âœ… ðŸ¤– AI Image Extraction |
|---------|------------------|--------------------------|
| **Icon** | Purple image icon | Red camera icon with ðŸ¤– |
| **Color** | Purple | Red/Pink |
| **Description** | "Attach for reference only" | "Extract numbers from screenshots with AI" |
| **What it does** | Just saves filename as lead | Extracts phone numbers using AI |
| **Loading time** | Instant (no wait) | 2-6 seconds (shows spinner) |
| **Result** | "Lead from Screenshot.png" | "+91 XXXXX XXXXX" numbers |
| **Has phone field?** | âŒ NO | âœ… YES |
| **Save works?** | âŒ NO (Firebase permission error) | âœ… YES |

## How to Find the RIGHT Button

### Step-by-Step:
1. **Open app** â†’ Go to **Leads** tab
2. Tap **Add** (green button)
3. You'll see multiple import options:
   - âœ… Manual Entry
   - âœ… Paste from Clipboard
   - âœ… CSV Upload
   - âœ… Excel Upload
   - âœ… PDF Upload
   - âŒ **Gallery/Image** â† DON'T use this
   - âœ… **ðŸ¤– AI Image Extraction** â† USE THIS ONE!

### Visual Indicator:
Look for the **RED/PINK card** with **camera icon** and **ðŸ¤– emoji**

## After Clicking the RIGHT Button

You should see:
1. **"ðŸ“· Select Image from Gallery"** button
2. Click it â†’ Select image from phone
3. See **"ðŸ¤– Extracting phone numbers with AI..."** loading message
4. Wait 2-6 seconds
5. Numbers appear with **confidence scores**
6. Tap **"ðŸ’¾ Save"** to add to Firebase

## If it Still Doesn't Work

### Check:
1. Is there a loading spinner after selecting image?
   - YES â†’ âœ… Correct button, might be API issue
   - NO â†’ âŒ Wrong button, try again

2. Look at browser console (F12):
   - Should see: `"ðŸš€ Starting phone extraction from image..."`
   - Then: `"ðŸ“Š Extraction result: {success: true, phones: [...]}`

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

**Status:** âœ… Feature works fine  
**Issue:** User confusion between two similar buttons  
**Solution:** Use the RED/PINK **ðŸ¤– AI Image Extraction** button, not the purple Gallery button


