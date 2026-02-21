/**
 * Gemini Vision API Integration Service
 * Handles image-based phone number extraction using Google Gemini API
 * 
 * Security: API key should be stored in environment variables
 * Never commit API keys to git
 */

export interface ExtractedPhoneFromImage {
  phone: string; // Clean 10-digit number
  source: 'image';
  confidence: number; // 0-1 confidence score
  originalText?: string; // Original text before normalization
}

export interface GeminiExtractionResult {
  success: boolean;
  phones: ExtractedPhoneFromImage[];
  totalFound: number;
  validNumbers: number;
  invalidNumbers: number;
  error?: string;
  debugInfo?: {
    imageSize: number;
    processTime: number;
    geminiResponse: string;
  };
}

/**
 * Gemini Vision API client for phone number extraction from images
 */
export class GeminiPhoneExtractor {
  private apiKey: string;
  private apiEndpoint = 'https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent';

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error('Gemini API key is required');
    }
    this.apiKey = apiKey;
  }

  /**
   * Extract phone numbers from an image using Gemini Vision
   * @param base64Image - Base64 encoded image data (without data:image/jpeg;base64, prefix)
   * @param mimeType - Image MIME type (e.g., 'image/jpeg', 'image/png')
   * @returns ExtractionResult with found phone numbers
   */
  async extractPhoneNumbers(
    base64Image: string,
    mimeType: string = 'image/jpeg'
  ): Promise<GeminiExtractionResult> {
    const startTime = Date.now();

    try {
      if (!base64Image || base64Image.trim().length === 0) {
        return {
          success: false,
          phones: [],
          totalFound: 0,
          validNumbers: 0,
          invalidNumbers: 0,
          error: 'Image data is empty',
        };
      }

      console.log('🤖 Sending image to Gemini API for phone number extraction...');

      const prompt = `Find Indian phone numbers in this image.
RETURN ONLY THIS EXACT JSON FORMAT. NO OTHER TEXT:
{"found":[{"number":"9876543210","confidence":0.95}],"note":""}
RULES: 10 digits, starts 6-7-8-9, remove ALL formatting (hyphens spaces commas).
If ZERO numbers found, return: {"found":[],"note":"none"}
Format: number as string, confidence 0-1.0. COMPLETE THIS JSON. NO MARKDOWN.`;

      const payload = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
              {
                inlineData: {
                  mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2, // Low temperature for consistent results
          maxOutputTokens: 1024,
        },
      };

      console.log('📤 Request payload prepared, calling Gemini API...');

      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Gemini API Error:', errorData);

        let errorMessage = 'Gemini API request failed';
        if (errorData.error?.message) {
          errorMessage = errorData.error.message;
        }

        return {
          success: false,
          phones: [],
          totalFound: 0,
          validNumbers: 0,
          invalidNumbers: 0,
          error: errorMessage,
        };
      }

      const responseData = await response.json();
      console.log('📥 Gemini API Response received');

      // Extract text from response
      const geminiText =
        responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!geminiText) {
        return {
          success: false,
          phones: [],
          totalFound: 0,
          validNumbers: 0,
          invalidNumbers: 0,
          error: 'No response from Gemini API',
        };
      }

      console.log('🔍 Parsing Gemini response...');
      console.log('Response length:', geminiText.length);
      console.log('Raw response (first 500 chars):', geminiText.substring(0, 500));

      // Clean the response from markdown
      let cleanedText = geminiText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      console.log('Cleaned text length:', cleanedText.length);
      console.log('Cleaned text (first 300 chars):', cleanedText.substring(0, 300));

      // Find the first { bracket
      const firstBracket = cleanedText.indexOf('{');
      if (firstBracket === -1) {
        console.error('⚠️ Could not find opening { in response');
        return {
          success: false,
          phones: [],
          totalFound: 0,
          validNumbers: 0,
          invalidNumbers: 0,
          error: 'Invalid response format from AI. Could not find JSON.',
          debugInfo: {
            imageSize: base64Image.length,
            processTime: Date.now() - startTime,
            geminiResponse: geminiText.substring(0, 200),
          },
        };
      }

      // Start from the first bracket and find matching closing bracket
      let braceCount = 0;
      let lastBracket = -1;
      for (let i = firstBracket; i < cleanedText.length; i++) {
        if (cleanedText[i] === '{') braceCount++;
        if (cleanedText[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            lastBracket = i;
            break;
          }
        }
      }

      if (lastBracket === -1) {
        console.error('⚠️ Could not find matching closing } for JSON');
        console.error('First bracket at:', firstBracket, 'Unmatched braces');
        return {
          success: false,
          phones: [],
          totalFound: 0,
          validNumbers: 0,
          invalidNumbers: 0,
          error: 'Invalid response format from AI. Could not find JSON.',
          debugInfo: {
            imageSize: base64Image.length,
            processTime: Date.now() - startTime,
            geminiResponse: geminiText.substring(0, 200),
          },
        };
      }

      // Extract only the valid JSON portion
      const jsonString = cleanedText.substring(firstBracket, lastBracket + 1);
      console.log('Extracted JSON string length:', jsonString.length);
      console.log('JSON string (first 400 chars):', jsonString.substring(0, 400));
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonString);
      } catch (e) {
        // Try to fix broken JSON by intelligently closing unclosed structures
        console.warn('⚠️ JSON parsing failed, attempting to fix broken JSON...', e);
        
        let fixedJson = jsonString.trim();
        
        // Strategy: Use a stack to track opening brackets/braces and close them in reverse order
        const stack = [];
        for (let i = 0; i < fixedJson.length; i++) {
          const char = fixedJson[i];
          if (char === '{' || char === '[') {
            stack.push(char);
          } else if (char === '}') {
            if (stack.length > 0 && stack[stack.length - 1] === '{') {
              stack.pop();
            }
          } else if (char === ']') {
            if (stack.length > 0 && stack[stack.length - 1] === '[') {
              stack.pop();
            }
          }
        }
        
        // Close remaining unclosed structures in reverse order (LIFO)
        while (stack.length > 0) {
          const openChar = stack.pop();
          fixedJson += openChar === '{' ? '}' : ']';
        }
        
        console.log('Fixed JSON:', fixedJson.substring(0, 300));
        
        try {
          parsedResponse = JSON.parse(fixedJson);
          console.log('✅ Successfully fixed and parsed broken JSON');
        } catch (e2) {
          console.error('❌ Failed to parse JSON even after fixing', e2);
          console.error('JSON string that failed:', jsonString.substring(0, 300));
          console.error('Attempted fix:', fixedJson.substring(0, 300));
          return {
            success: false,
            phones: [],
            totalFound: 0,
            validNumbers: 0,
            invalidNumbers: 0,
            error: 'Invalid response format from AI. Failed to parse JSON.',
            debugInfo: {
              imageSize: base64Image.length,
              processTime: Date.now() - startTime,
              geminiResponse: geminiText.substring(0, 200),
            },
          };
        }
      }
      console.log('✅ Parsed response:', parsedResponse);

      // Process and validate phone numbers
      const phones: ExtractedPhoneFromImage[] = [];
      const foundNumbers = parsedResponse.found || [];

      for (const item of foundNumbers) {
        const phoneNumber = item.number?.toString().trim();
        if (!phoneNumber) continue;

        // Validate 10 digits
        if (phoneNumber.length !== 10) {
          console.warn(`⚠️ Skipping invalid length: ${phoneNumber}`);
          continue;
        }

        // Validate first digit (6-9)
        const firstDigit = parseInt(phoneNumber[0], 10);
        if (firstDigit < 6 || firstDigit > 9) {
          console.warn(
            `⚠️ Skipping invalid start digit: ${phoneNumber} (starts with ${firstDigit})`
          );
          continue;
        }

        // Validate all digits
        if (!/^\d{10}$/.test(phoneNumber)) {
          console.warn(`⚠️ Skipping non-numeric: ${phoneNumber}`);
          continue;
        }

        phones.push({
          phone: phoneNumber,
          source: 'image',
          confidence: item.confidence || 0.95,
          originalText: item.originalText,
        });

        console.log(`✅ Valid number extracted: ${phoneNumber}`);
      }

      // Remove duplicates
      const uniquePhones = Array.from(
        new Map(phones.map((p) => [p.phone, p])).values()
      );

      const result: GeminiExtractionResult = {
        success: uniquePhones.length > 0,
        phones: uniquePhones,
        totalFound: foundNumbers.length,
        validNumbers: uniquePhones.length,
        invalidNumbers: foundNumbers.length - uniquePhones.length,
        debugInfo: {
          imageSize: base64Image.length,
          processTime: Date.now() - startTime,
          geminiResponse: geminiText.substring(0, 500),
        },
      };

      console.log('📊 Extraction Result:', result);
      return result;
    } catch (error) {
      console.error('❌ Error during Gemini extraction:', error);

      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        success: false,
        phones: [],
        totalFound: 0,
        validNumbers: 0,
        invalidNumbers: 0,
        error: errorMessage,
        debugInfo: {
          imageSize: base64Image.length,
          processTime: Date.now() - startTime,
          geminiResponse: String(error),
        },
      };
    }
  }

  /**
   * Validate if a phone number is a valid Indian mobile number
   * @param phone - 10-digit phone number
   * @returns true if valid
   */
  private isValidIndianPhone(phone: string): boolean {
    if (!phone || phone.length !== 10) return false;
    if (!/^\d{10}$/.test(phone)) return false;

    const firstDigit = parseInt(phone[0], 10);
    return firstDigit >= 6 && firstDigit <= 9;
  }
}

/**
 * Create and configure Gemini extractor with API key from environment
 */
export const createGeminiExtractor = (): GeminiPhoneExtractor => {
  // Get API key from environment variables
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  if (!apiKey) {
    throw new Error(
      'Gemini API key not found in environment variables (EXPO_PUBLIC_GEMINI_API_KEY)'
    );
  }

  return new GeminiPhoneExtractor(apiKey);
};

/**
 * Helper function to create extractor with custom API key (for direct usage)
 */
export const createGeminiExtractorWithKey = (apiKey: string): GeminiPhoneExtractor => {
  return new GeminiPhoneExtractor(apiKey);
};
