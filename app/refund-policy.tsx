import PolicyScreen from '@/src/features/legal/PolicyScreen';

export default function RefundPolicyPage() {
  return (
    <PolicyScreen
      title="Refund Policy"
      effectiveDate="09 March 2026"
      intro="This policy explains refund handling for wallet recharge and payment transactions on Maxsas Realty AI."
      sections={[
        {
          title: 'Recharge Credits',
          points: [
            'Wallet recharges are intended for consumption of AI calling and related platform services.',
            'After successful credit to wallet, recharge amounts are generally non-refundable.',
          ],
        },
        {
          title: 'Failed or Duplicate Transactions',
          points: [
            'If a payment fails but amount is debited from your bank/card/UPI, we initiate verification with the payment gateway.',
            'Verified failed or duplicate debits are refunded back to original payment source as per gateway/bank timelines.',
          ],
        },
        {
          title: 'Incorrect Debit Resolution',
          points: [
            'If you see an unexpected wallet deduction, report it with transaction reference and timestamp.',
            'After validation, adjustment is made either as wallet credit reversal or source refund, depending on case type.',
          ],
        },
        {
          title: 'Processing Timelines',
          points: [
            'Initial acknowledgement is usually within 2 business days.',
            'Approved reversals typically reflect within 5-10 business days, subject to bank and gateway SLA.',
          ],
        },
      ]}
    />
  );
}
