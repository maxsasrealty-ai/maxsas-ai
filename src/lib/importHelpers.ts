/**
 * Lead Import Integration Helper
 * Utilities to integrate imported leads with existing app flows
 */

import type { ExtractedLead } from './phoneExtractor';

/**
 * Convert extracted leads to LeadReviewPanel format
 * @param leads - Extracted leads from import services
 * @returns Formatted leads for review panel
 */
export const convertToReviewFormat = (leads: ExtractedLead[]) => {
  return leads.map((lead) => ({
    id: `lead_${Date.now()}_${Math.random()}`,
    phone: lead.phone,
    source: lead.source,
  }));
};

/**
 * Merge imported leads with manual leads
 * @param importedLeads - Leads from import
 * @param manualLeads - Manually entered leads
 * @returns Combined leads array
 */
export const combineLeads = (
  importedLeads: ExtractedLead[],
  manualLeads: ExtractedLead[]
) => {
  const combined = [...importedLeads, ...manualLeads];
  const seen = new Set<string>();
  
  return combined.filter((lead) => {
    if (seen.has(lead.phone)) {
      return false;
    }
    seen.add(lead.phone);
    return true;
  });
};

/**
 * Prepare leads for database storage
 * @param leads - Leads to save
 * @param source - Source of import
 * @returns Formatted for Firebase
 */
export const prepareForDatabase = (
  leads: ExtractedLead[],
  source: 'csv' | 'clipboard' | 'pdf' | 'excel'
) => {
  return leads.map((lead) => ({
    phone: lead.phone,
    status: 'queued',
    source,
    intakeAction: 'save_only',
    intakeStatus: 'pending',
    scheduleAt: null,
  }));
};

/**
 * Format extracted leads for export/sharing
 * @param leads - Leads to format
 * @returns CSV string
 */
export const exportToCSV = (leads: ExtractedLead[]): string => {
  const headers = ['Phone', 'Source', 'Added At'];
  const rows = leads.map((lead) => [
    lead.phone,
    lead.source,
    new Date().toISOString(),
  ]);

  const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
  return csv;
};

/**
 * Get summary statistics for import
 * @param leads - Imported leads
 * @param totalProcessed - Total records processed
 * @returns Summary object
 */
export const getImportSummary = (
  leads: ExtractedLead[],
  totalProcessed: number
) => {
  return {
    totalProcessed,
    successfulLeads: leads.length,
    failedLeads: totalProcessed - leads.length,
    successRate: Math.round((leads.length / totalProcessed) * 100),
    bySource: leads.reduce(
      (acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    ),
  };
};

/**
 * Check if all leads are valid (all extracted successfully)
 * @param leads - Leads to check
 * @returns true if all valid
 */
export const allLeadsValid = (leads: ExtractedLead[]): boolean => {
  return leads.every(
    (lead) => lead.phone && lead.phone.length === 10 && /^\d{10}$/.test(lead.phone)
  );
};

/**
 * Filter leads by source
 * @param leads - All leads
 * @param source - Source to filter by
 * @returns Filtered leads
 */
export const filterBySource = (
  leads: ExtractedLead[],
  source: 'csv' | 'clipboard' | 'pdf' | 'excel'
): ExtractedLead[] => {
  return leads.filter((lead) => lead.source === source);
};

/**
 * Get unique phone numbers
 * @param leads - All leads
 * @returns Unique phone numbers
 */
export const getUniquePhones = (leads: ExtractedLead[]): string[] => {
  return Array.from(new Set(leads.map((lead) => lead.phone)));
};

/**
 * Sort leads by phone number
 * @param leads - Leads to sort
 * @returns Sorted leads
 */
export const sortLeadsByPhone = (leads: ExtractedLead[]): ExtractedLead[] => {
  return [...leads].sort((a, b) => a.phone.localeCompare(b.phone));
};

/**
 * Paginate leads for display
 * @param leads - All leads
 * @param pageSize - Items per page
 * @param pageNumber - Page number (0-indexed)
 * @returns Paginated leads
 */
export const paginateLeads = (
  leads: ExtractedLead[],
  pageSize: number = 20,
  pageNumber: number = 0
): ExtractedLead[] => {
  const start = pageNumber * pageSize;
  const end = start + pageSize;
  return leads.slice(start, end);
};

/**
 * Get import statistics
 * @param leads - Imported leads
 * @returns Statistics object
 */
export const getImportStats = (leads: ExtractedLead[]) => {
  const sources = new Set(leads.map((l) => l.source));
  const sourceMap = {} as Record<string, number>;

  for (const source of sources) {
    sourceMap[source] = leads.filter((l) => l.source === source).length;
  }

  return {
    totalLeads: leads.length,
    uniqueLeads: getUniquePhones(leads).length,
    bySource: sourceMap,
    timestamp: new Date().toISOString(),
  };
};

/**
 * Validate leads before database save
 * @param leads - Leads to validate
 * @returns Validation result with errors
 */
export const validateLeadsForSave = (
  leads: ExtractedLead[]
): {
  valid: boolean;
  errors: string[];
  validLeads: ExtractedLead[];
} => {
  const errors: string[] = [];
  const validLeads: ExtractedLead[] = [];

  if (!leads || leads.length === 0) {
    errors.push('No leads to save');
    return { valid: false, errors, validLeads };
  }

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    
    if (!lead.phone) {
      errors.push(`Lead ${i + 1}: Missing phone number`);
    } else if (!/^\d{10}$/.test(lead.phone)) {
      errors.push(
        `Lead ${i + 1}: Invalid phone format (${lead.phone})`
      );
    } else if (!lead.source) {
      errors.push(`Lead ${i + 1}: Missing source`);
    } else {
      validLeads.push(lead);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    validLeads,
  };
};

/**
 * Group leads by source for display
 * @param leads - All leads
 * @returns Grouped leads
 */
export const groupBySource = (
  leads: ExtractedLead[]
): Record<string, ExtractedLead[]> => {
  return leads.reduce(
    (acc, lead) => {
      if (!acc[lead.source]) {
        acc[lead.source] = [];
      }
      acc[lead.source].push(lead);
      return acc;
    },
    {} as Record<string, ExtractedLead[]>
  );
};

/**
 * Generate import report
 * @param leads - Imported leads
 * @param fileName - File name if from file
 * @returns Report object
 */
export const generateImportReport = (
  leads: ExtractedLead[],
  fileName?: string
) => {
  const stats = getImportStats(leads);
  const grouped = groupBySource(leads);

  return {
    fileName,
    timestamp: new Date().toISOString(),
    summary: stats,
    grouped,
    exportURL: null, // Can be set if exported to file
  };
};
