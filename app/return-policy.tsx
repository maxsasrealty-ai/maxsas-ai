import PolicyScreen from '@/src/features/legal/PolicyScreen';

export default function ReturnPolicyPage() {
  return (
    <PolicyScreen
      title="Return Policy"
      effectiveDate="09 March 2026"
      intro="Maxsas Realty AI is a software and digital-services platform. We do not sell or ship physical goods."
      sections={[
        {
          title: 'No Physical Returns',
          points: [
            'My Business does not support returns.',
            'No product pickup, replacement shipment, or physical return workflow is applicable.',
          ],
        },
        {
          title: 'Digital Service Clarification',
          points: [
            'Platform usage is delivered as digital access and wallet-based service consumption.',
            'Any payment issue is handled under the Refund Policy, not return processing.',
          ],
        },
      ]}
    />
  );
}
