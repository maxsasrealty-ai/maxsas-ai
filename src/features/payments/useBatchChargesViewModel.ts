import { useEffect, useMemo, useState } from 'react';

import { BatchChargeSummary } from './batchChargesModels';
import { batchChargesRepository } from './batchChargesRepository';

type UseBatchChargesViewModelResult = {
  loading: boolean;
  error: string | null;
  batches: BatchChargeSummary[];
  totalBatchCharges: number;
};

export function useBatchChargesViewModel(userId?: string | null): UseBatchChargesViewModelResult {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [batches, setBatches] = useState<BatchChargeSummary[]>([]);

  useEffect(() => {
    if (!userId) {
      setBatches([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = batchChargesRepository.subscribeCompletedBatchesByUser(
      userId,
      (rows) => {
        setBatches(rows);
        setLoading(false);
      },
      (message) => {
        setError(message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  const totalBatchCharges = useMemo(
    () => batches.reduce((sum, batch) => sum + batch.batchTotalCost, 0),
    [batches]
  );

  return {
    loading,
    error,
    batches,
    totalBatchCharges,
  };
}
