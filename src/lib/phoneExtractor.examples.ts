/**
 * Phone Number Normalization - Expected Output Examples
 * Use this to verify your extraction is working correctly
 */

// ============================================================================
// SCENARIO 1: Simple Clipboard Paste
// ============================================================================

export const SCENARIO_1 = {
  description: 'User pastes text with phone numbers',
  input: 'Call me at 9876543210 or +91 9876543211',
  
  extractFunction: 'extractPhoneNumbers(input, "clipboard")',
  
  expectedOutput: {
    leads: [
      {
        phone: '9876543210',           // ✓ Clean 10-digit for DATABASE
        source: 'clipboard',
        originalValue: '9876543210'
      },
      {
        phone: '9876543211',           // ✓ Clean 10-digit for DATABASE
        source: 'clipboard',
        originalValue: '+91 9876543211'
      }
    ],
    duplicateCount: 0,
    invalidCount: 0
  },
  
  databaseSave: [
    { phone: '9876543210', source: 'clipboard', createdAt: 'timestamp' },
    { phone: '9876543211', source: 'clipboard', createdAt: 'timestamp' }
  ],
  
  uiDisplay: [
    '+91 98765 43210',    // ✓ Formatted for UI using formatPhoneForDisplay()
    '+91 98765 43211'
  ]
};

// ============================================================================
// SCENARIO 2: Multiple Formats Mixed
// ============================================================================

export const SCENARIO_2 = {
  description: 'User pastes with various formats',
  input: `My leads:
    1. 9876543210 (plain)
    2. +91 9876543211 (with +91)
    3. 98765-43212 (with dashes)
    4. (987) 654-3213 (with parentheses)
    5. 9876543214 with spaces
  `,
  
  expectedOutput: {
    leads: [
      { phone: '9876543210', source: 'clipboard', originalValue: '9876543210' },
      { phone: '9876543211', source: 'clipboard', originalValue: '+91 9876543211' },
      { phone: '9876543212', source: 'clipboard', originalValue: '98765-43212' },
      { phone: '9876543213', source: 'clipboard', originalValue: '(987) 654-3213' },
      { phone: '9876543214', source: 'clipboard', originalValue: '9876543214' }
    ],
    duplicateCount: 0,
    invalidCount: 0
  },
  
  databaseSave: [
    { phone: '9876543210', source: 'clipboard' },
    { phone: '9876543211', source: 'clipboard' },
    { phone: '9876543212', source: 'clipboard' },
    { phone: '9876543213', source: 'clipboard' },
    { phone: '9876543214', source: 'clipboard' }
  ],
  
  uiDisplay: [
    '+91 98765 43210',
    '+91 98765 43211',
    '+91 98765 43212',
    '+91 98765 43213',
    '+91 98765 43214'
  ]
};

// ============================================================================
// SCENARIO 3: Duplicate Detection
// ============================================================================

export const SCENARIO_3 = {
  description: 'Same number in different formats (should deduplicate)',
  input: '9876543210, +91 9876543210, 98765-43210',
  
  expectedOutput: {
    leads: [
      {
        phone: '9876543210',
        source: 'clipboard',
        originalValue: '9876543210'  // First format kept
      }
    ],
    duplicateCount: 2,               // ✓ Two duplicates detected
    invalidCount: 0
  },
  
  explanation: 'All three are the same number - only first kept',
  
  databaseSave: [
    { phone: '9876543210', source: 'clipboard' }  // Only one entry
  ]
};

// ============================================================================
// SCENARIO 4: Invalid Entries Filtered
// ============================================================================

export const SCENARIO_4 = {
  description: 'Mix of valid and invalid numbers',
  input: 'Call 9876543210 or 0876543210 (invalid) or 100 (emergency) or 123 (too short)',
  
  expectedOutput: {
    leads: [
      {
        phone: '9876543210',
        source: 'clipboard',
        originalValue: '9876543210'
      }
    ],
    duplicateCount: 0,
    invalidCount: 3                  // ✓ Three invalid entries ignored
  },
  
  explanation: {
    ignored: [
      '0876543210 - starts with 0 (invalid)',
      '100 - emergency number',
      '123 - too short'
    ]
  },
  
  databaseSave: [
    { phone: '9876543210', source: 'clipboard' }  // Only valid number
  ]
};

// ============================================================================
// SCENARIO 5: CSV Import with Column Detection
// ============================================================================

export const SCENARIO_5 = {
  description: 'CSV file import with auto column detection',
  input: {
    csvData: [
      ['Name', 'Phone', 'Email'],
      ['John', '9876543210', 'john@example.com'],
      ['Jane', '+91 9876543211', 'jane@example.com'],
      ['Mike', '98765-43212', 'mike@example.com'],
      ['Sarah', 'invalid', 'sarah@example.com']
    ]
  },
  
  expectedOutput: {
    leads: [
      {
        phone: '9876543210',
        source: 'csv',
        originalValue: '9876543210'
      },
      {
        phone: '9876543211',
        source: 'csv',
        originalValue: '+91 9876543211'
      },
      {
        phone: '9876543212',
        source: 'csv',
        originalValue: '98765-43212'
      }
    ],
    duplicateCount: 0,
    invalidCount: 1                  // 'invalid' entry
  },
  
  columnDetection: 'Phone column automatically detected as column index 1',
  
  databaseSave: [
    { phone: '9876543210', source: 'csv' },
    { phone: '9876543211', source: 'csv' },
    { phone: '9876543212', source: 'csv' }
  ]
};

// ============================================================================
// SCENARIO 6: Form Input Normalization
// ============================================================================

export const SCENARIO_6 = {
  description: 'User typing phone number in form field',
  
  inputs: [
    '+91 98765 43210',
    '9876543210',
    '98765-43210',
    '(987) 654-3210',
    '0876543210',
    '123',
    ''
  ],
  
  expectedNormalizations: {
    '+91 98765 43210': '9876543210',  // ✓ Valid
    '9876543210': '9876543210',       // ✓ Valid
    '98765-43210': '9876543210',      // ✓ Valid
    '(987) 654-3210': '9876543210',   // ✓ Valid
    '0876543210': null,               // ✗ Invalid: starts with 0
    '123': null,                      // ✗ Invalid: too short
    '': null                          // ✗ Invalid: empty
  },
  
  uiValidationMessages: {
    '9876543210': 'Valid number ✓',
    '0876543210': 'Invalid: mobile numbers cannot start with 0',
    '123': 'Too short - must be 10 digits',
    '': 'Phone number required'
  }
};

// ============================================================================
// SCENARIO 7: Display Formatting in UI
// ============================================================================

export const SCENARIO_7 = {
  description: 'Database to UI Display Transformation',
  
  databaseRecords: [
    { phone: '9876543210', name: 'Lead 1' },
    { phone: '9123456789', name: 'Lead 2' },
    { phone: '7654321098', name: 'Lead 3' }
  ],
  
  displayTransformation: {
    rule: 'Use formatPhoneForDisplay() when showing in UI',
    
    results: [
      {
        database: '9876543210',
        display: '+91 98765 43210',
        context: 'Shown in lead list, call button, contact info'
      },
      {
        database: '9123456789',
        display: '+91 91234 56789',
        context: 'Same transformation'
      },
      {
        database: '7654321098',
        display: '+91 76543 21098',
        context: 'Same transformation'
      }
    ]
  },
  
  codeExample: `
    // In React component
    import { formatPhoneForDisplay } from '@/src/lib/phoneExtractor';
    
    <Text>{formatPhoneForDisplay(lead.phone)}</Text>
    // Displays: +91 98765 43210
  `
};

// ============================================================================
// SCENARIO 8: Emergency Numbers Filtered
// ============================================================================

export const SCENARIO_8 = {
  description: 'Emergency numbers are automatically ignored',
  
  input: 'Important numbers: 100 (police), 101 (fire), 102 (ambulance), 112 (emergency), 999, 9876543210 (customer)',
  
  emergencyNumbers: [100, 101, 102, 112, 999, 1091, 1098, 108],
  
  expectedOutput: {
    leads: [
      {
        phone: '9876543210',
        source: 'clipboard',
        originalValue: '9876543210'
      }
    ],
    duplicateCount: 0,
    invalidCount: 5                  // All emergency numbers filtered
  },
  
  explanation: 'Emergency numbers are never extracted or saved'
};

// ============================================================================
// VERIFICATION CHECKLIST
// ============================================================================

export const VERIFICATION_CHECKLIST = {
  testClipboardPaste: {
    test: 'Paste: "Call 9876543210 or +91 9876543211"',
    expectedDatabase: ['9876543210', '9876543211'],
    expectedDisplay: ['+91 98765 43210', '+91 98765 43211'],
    expectedDuplicates: 0,
    expectedInvalid: 0
  },
  
  testDuplicates: {
    test: 'Paste same number 3 times in different formats',
    expectedLeads: 1,
    expectedDuplicates: 2,
    expectedInvalid: 0,
    explanation: 'Only unique phone stored'
  },
  
  testInvalid: {
    test: 'Paste: "100, 0876543210, 123, 9876543210"',
    expectedLeads: 1,
    expectedDuplicates: 0,
    expectedInvalid: 3,
    explanation: 'Emergency, starts with 0, too short - all ignored'
  },
  
  testCSVImport: {
    test: 'Import CSV with phone column',
    expectedBehavior: [
      '✓ Columns auto-detected',
      '✓ All formats normalized',
      '✓ Duplicates removed',
      '✓ Invalid entries filtered'
    ]
  },
  
  testDatabaseSave: {
    test: 'Save extracted leads to Firebase',
    expectedInDatabase: [
      'phone: "9876543210" (clean 10-digit)',
      'source: "clipboard" or "csv" etc',
      'createdAt: timestamp',
      'userId: user_id'
    ],
    notExpectedInDatabase: [
      'phone: "+91 98765 43210" (formatted)',
      'phone_formatted: "..." (redundant)',
      'phone_display: "..." (redundant)'
    ]
  },
  
  testUIDisplay: {
    test: 'Show in UI components',
    expectedDisplay: [
      'Lead lists: +91 98765 43210',
      'Call buttons: +91 98765 43210',
      'Contact cards: +91 98765 43210',
      'Always use formatPhoneForDisplay()'
    ]
  }
};

// ============================================================================
// COMMON ERRORS (WHAT NOT TO DO)
// ============================================================================

export const COMMON_ERRORS = {
  error1: {
    wrong: 'Storing formatted numbers in database',
    wrongCode: `firestore.add({ phone: '+91 98765 43210' })`,
    correct: 'Store clean 10-digit format',
    correctCode: `firestore.add({ phone: '9876543210' })`
  },
  
  error2: {
    wrong: 'Storing both clean and formatted versions',
    wrongCode: `firestore.add({ 
      phone: '9876543210',
      phone_formatted: '+91 98765 43210'
    })`,
    correct: 'Store only clean version, format in UI as needed',
    correctCode: `firestore.add({ phone: '9876543210' })
    // In UI: formatPhoneForDisplay(phone) when displaying`
  },
  
  error3: {
    wrong: 'Using raw user input without normalization',
    wrongCode: `firestore.add({ phone: userInput })  // Could be "+91 98765-43210"`,
    correct: 'Always normalize before saving',
    correctCode: `const clean = normalizeNumber(userInput);
    if (clean) {
      firestore.add({ phone: clean })
    }`
  },
  
  error4: {
    wrong: 'Extracting without deduplication',
    wrongCode: `extractPhoneNumbers() // Could return duplicates if not using built-in dedup`,
    correct: 'Use extractPhoneNumbers() which auto-deduplicates',
    correctCode: `const result = extractPhoneNumbers(text);
    result.leads  // Already deduplicated
    result.duplicateCount // How many were removed`
  }
};

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export const allScenarios = {
  SCENARIO_1,
  SCENARIO_2,
  SCENARIO_3,
  SCENARIO_4,
  SCENARIO_5,
  SCENARIO_6,
  SCENARIO_7,
  SCENARIO_8,
  VERIFICATION_CHECKLIST,
  COMMON_ERRORS
};

/**
 * Use this in console for quick verification:
 * 
 * import { allScenarios } from '@/src/lib/phoneExtractor.examples';
 * 
 * console.log('Scenario 1:', allScenarios.SCENARIO_1);
 * console.log('Verification Checklist:', allScenarios.VERIFICATION_CHECKLIST);
 */
