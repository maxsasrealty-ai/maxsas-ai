import PolicyScreen from '@/src/features/legal/PolicyScreen';

export default function TermsAndConditionsPage() {
  return (
    <PolicyScreen
      title="Terms and Conditions"
      effectiveDate="09 March 2026"
      intro="These Terms govern the use of Maxsas Realty AI platform, including lead imports, automated calling workflows, analytics, and wallet-based recharge services. By using the platform, you agree to these terms."
      sections={[
        {
          title: 'Service Scope',
          points: [
            'Maxsas Realty AI provides software tools for lead management and AI-assisted communication workflows for real estate teams.',
            'You are responsible for how you use calls, scripts, and outreach features within applicable law and platform rules.',
          ],
        },
        {
          title: 'Account Responsibility',
          points: [
            'You must provide accurate account details and keep credentials secure.',
            'Any activity from your account is treated as authorized by your organization unless reported otherwise.',
          ],
        },
        {
          title: 'Wallet and Payments',
          points: [
            'Recharge amounts are credited to your in-app wallet and consumed based on actual platform usage.',
            'Payment processing may be handled by approved third-party gateways such as PhonePe.',
            'Failed transactions are not charged; if charged accidentally, reconciliation is processed as per refund policy.',
          ],
        },
        {
          title: 'Acceptable Use',
          points: [
            'You must not use the platform for fraud, spam, harassment, or unlawful telemarketing activities.',
            'You must obtain required user consent and follow Do Not Disturb and calling-time regulations wherever applicable.',
          ],
        },
        {
          title: 'Suspension and Termination',
          points: [
            'Access may be suspended for policy breaches, payment abuse, or security risks.',
            'On termination, active services stop and data retention follows privacy and legal requirements.',
          ],
        },
      ]}
    />
  );
}
