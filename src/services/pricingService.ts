import { doc, getDoc } from 'firebase/firestore';

import { DEFAULT_PRICING_CONFIG, PricingConfig } from '@/src/config/pricing';
import { db } from '@/src/lib/firebase';

let cachedPricingConfig: PricingConfig | null = null;

const sanitizeNumber = (value: unknown, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  return fallback;
};

export async function getPricingConfig(): Promise<PricingConfig> {
  if (cachedPricingConfig) {
    return cachedPricingConfig;
  }

  try {
    const runtimeRef = doc(db, 'system', 'runtime');
    const runtimeSnap = await getDoc(runtimeRef);

    if (!runtimeSnap.exists()) {
      cachedPricingConfig = DEFAULT_PRICING_CONFIG;
      return DEFAULT_PRICING_CONFIG;
    }

    const runtimeData = runtimeSnap.data();
    const pricingData = runtimeData?.pricing ?? runtimeData?.pricingConfig ?? {};

    const resolved: PricingConfig = {
      currencySymbol: typeof pricingData.currencySymbol === 'string' && pricingData.currencySymbol.trim()
        ? pricingData.currencySymbol
        : DEFAULT_PRICING_CONFIG.currencySymbol,
      connectedMinuteRate: sanitizeNumber(
        pricingData.connectedMinuteRate,
        DEFAULT_PRICING_CONFIG.connectedMinuteRate
      ),
      qualifiedLeadRate: sanitizeNumber(
        pricingData.qualifiedLeadRate,
        DEFAULT_PRICING_CONFIG.qualifiedLeadRate
      ),
    };

    cachedPricingConfig = resolved;
    return resolved;
  } catch (error) {
    console.warn('Pricing config fetch failed, falling back to default config:', error);
    cachedPricingConfig = DEFAULT_PRICING_CONFIG;
    return DEFAULT_PRICING_CONFIG;
  }
}
