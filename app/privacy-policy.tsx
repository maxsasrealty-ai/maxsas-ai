import PolicyScreen from '@/src/features/legal/PolicyScreen';

export default function PrivacyPolicyPage() {
  return (
    <PolicyScreen
      title="Privacy Policy"
      effectiveDate="09 March 2026"
      intro="Maxsas Realty AI respects your privacy and processes business and lead data only for service delivery, security, and legal compliance."
      sections={[
        {
          title: 'Information We Collect',
          points: [
            'Account details such as name, phone number, and email for authentication and support.',
            'Business workflow data such as imported leads, call outcomes, follow-ups, and wallet transactions.',
            'Technical metadata such as device/browser logs for security, diagnostics, and performance monitoring.',
          ],
        },
        {
          title: 'How We Use Data',
          points: [
            'To run platform features including lead workflows, calling automation, scheduling, and dashboards.',
            'To process payments and maintain transaction records through integrated payment partners.',
            'To improve reliability, detect misuse, and comply with legal obligations.',
          ],
        },
        {
          title: 'Data Sharing',
          points: [
            'We do not sell personal data.',
            'Data may be shared with trusted infrastructure or payment service providers only to deliver the requested service.',
            'Data may be disclosed when required by law, court order, or regulatory authority.',
          ],
        },
        {
          title: 'Retention and Security',
          points: [
            'Data is retained only as long as needed for active services, audit, or legal obligations.',
            'Reasonable technical and organizational controls are used to protect your data from unauthorized access.',
          ],
        },
        {
          title: 'Your Rights',
          points: [
            'You may request correction of inaccurate profile information.',
            'You may request account deletion, subject to settlement, audit, and legal retention requirements.',
          ],
        },
      ]}
    />
  );
}
