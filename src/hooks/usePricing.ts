import { useEffect, useState } from 'react';

import { DEFAULT_PRICING_CONFIG, PricingConfig } from '@/src/config/pricing';
import { getPricingConfig } from '@/src/services/pricingService';

export function usePricing() {
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      const config = await getPricingConfig();
      if (mounted) {
        setPricing(config);
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { pricing, loading };
}
