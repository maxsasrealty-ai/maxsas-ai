// Plan-aware Firestore collection names
export function getBatchCollection(planType: 'nexus' | 'enterprise') {
  return planType === 'nexus' ? 'nexus_batches' : 'enterprise_batches';
}

export function getLeadCollection(planType: 'nexus' | 'enterprise') {
  return planType === 'nexus' ? 'nexus_leads' : 'enterprise_leads';
}
