import { useEffect, useMemo, useState } from 'react';

import { BatchChargeSummary, BatchLeadBillingRow } from './batchChargesModels';
import { batchChargesRepository } from './batchChargesRepository';

type UseBatchBillingDetailViewModelResult = {
  loading: boolean;
  error: string | null;
  batch: BatchChargeSummary | null;
  leads: BatchLeadBillingRow[];
  connectedLeads: number;
  failedLeads: number;
  computedLeadTotal: number;
};

export function useBatchBillingDetailViewModel(
  batchId?: string | null
): UseBatchBillingDetailViewModelResult {
  const [batch, setBatch] = useState<BatchChargeSummary | null>(null);
  const [leads, setLeads] = useState<BatchLeadBillingRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [batchLoaded, setBatchLoaded] = useState(false);
  const [leadsLoaded, setLeadsLoaded] = useState(false);

  useEffect(() => {
    if (!batchId) {
      setBatch(null);
      setLeads([]);
      setError(null);
      setBatchLoaded(true);
      setLeadsLoaded(true);
      return;
    }

    setError(null);
    setBatchLoaded(false);
    setLeadsLoaded(false);

    const unsubscribeBatch = batchChargesRepository.subscribeBatchById(
      batchId,
      (row) => {
        setBatch(row);
        setBatchLoaded(true);
      },
      (message) => {
        setError((currentError) => currentError ?? message);
        setBatchLoaded(true);
      }
    );

    const unsubscribeLeads = batchChargesRepository.subscribeLeadsByBatchId(
      batchId,
      (rows) => {
        setLeads(rows);
        setLeadsLoaded(true);
      },
      (message) => {
        setError((currentError) => currentError ?? message);
        setLeadsLoaded(true);
      }
    );

    return () => {
      unsubscribeBatch();
      unsubscribeLeads();
    };
  }, [batchId]);

  const connectedLeads = useMemo(
    () => leads.filter((lead) => lead.displayStatus === 'Connected').length,
    [leads]
  );

  const failedLeads = useMemo(
    () => leads.filter((lead) => lead.displayStatus === 'Failed').length,
    [leads]
  );

  const computedLeadTotal = useMemo(
    () => leads.reduce((sum, lead) => sum + lead.uiTotalCost, 0),
    [leads]
  );

  return {
    loading: !batchLoaded || !leadsLoaded,
    error,
    batch,
    leads,
    connectedLeads,
    failedLeads,
    computedLeadTotal,
  };
}
