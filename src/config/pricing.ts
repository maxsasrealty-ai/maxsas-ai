export type PricingConfig = {
  currencySymbol: string;
  connectedMinuteRate: number;
  qualifiedLeadRate: number;
};

export const DEFAULT_PRICING_CONFIG: PricingConfig = {
  currencySymbol: '₹',
  connectedMinuteRate: 6.4,
  qualifiedLeadRate: 129,
};

export const PRICING_VALUE_LINES = [
  'Pay only for real conversations',
  'Usage-based transparent pricing',
  'No charges for missed or retry calls',
  'You’re billed only when value is delivered',
];
