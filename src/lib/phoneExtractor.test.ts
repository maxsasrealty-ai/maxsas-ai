/**
 * Phone Number Extraction Tests
 */

import { extractPhoneNumbers, formatPhoneForDisplay, normalizeNumber } from './phoneExtractor';

describe('phoneExtractor', () => {
  describe('normalizeNumber', () => {
    const testCases = [
      { input: '9876543210', expected: '9876543210', description: 'Plain 10 digits' },
      { input: '+91 9876543210', expected: '9876543210', description: '+91 with space' },
      { input: '+919876543210', expected: '9876543210', description: '+91 no space' },
      { input: '91 9876543210', expected: '9876543210', description: '91 with space' },
      { input: '98765-43210', expected: '9876543210', description: 'With dashes' },
      { input: '98765.43210', expected: '9876543210', description: 'With dots' },
      { input: '98765 43210', expected: '9876543210', description: 'With spaces' },
      { input: '(987) 654-3210', expected: '9876543210', description: 'With parentheses' },
      { input: '  9876543210  ', expected: '9876543210', description: 'With leading/trailing spaces' },
      { input: '0876543210', expected: null, description: 'Starts with 0' },
      { input: '123', expected: null, description: 'Too short' },
      { input: '9876543210123', expected: null, description: 'Too long' },
      { input: '100', expected: null, description: 'Emergency number' },
      { input: '112', expected: null, description: 'Emergency number' },
      { input: 'abc', expected: null, description: 'Non-numeric' },
      { input: '', expected: null, description: 'Empty string' },
    ];

    test.each(testCases)('$description', ({ input, expected }) => {
      expect(normalizeNumber(input)).toBe(expected);
    });
  });

  describe('extractPhoneNumbers', () => {
    it('extracts and normalizes multiple formats', () => {
      const result = extractPhoneNumbers('Call 9876543210 or +91 9876543211', 'clipboard');
      const phones = result.leads.map((lead) => lead.phone).sort();
      expect(phones).toEqual(['9876543210', '9876543211']);
      expect(result.invalidCount).toBe(0);
    });

    it('deduplicates numbers and counts duplicates', () => {
      const result = extractPhoneNumbers('9876543210, 9876543210, 9876543211', 'clipboard');
      expect(result.leads.length).toBe(2);
      expect(result.duplicateCount).toBe(1);
    });

    it('ignores invalid numbers', () => {
      const result = extractPhoneNumbers('Invalids: 123, 100, 9876543210', 'clipboard');
      expect(result.leads.length).toBe(1);
      expect(result.invalidCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('formatPhoneForDisplay', () => {
    it('formats clean 10-digit numbers for display', () => {
      expect(formatPhoneForDisplay('9876543210')).toBe('+91 98765 43210');
    });

    it('handles empty input', () => {
      expect(formatPhoneForDisplay('')).toBe('');
    });
  });
});
