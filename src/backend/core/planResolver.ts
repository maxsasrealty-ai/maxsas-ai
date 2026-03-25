// Plan Resolver: Returns correct processor based on user planType
import { EnterpriseProcessor } from '../plans/enterprise/enterpriseProcessor';
import { NexusProcessor } from '../plans/nexus/nexusProcessor';

export function getPlanProcessor(planType: 'nexus' | 'enterprise') {
  if (planType === 'nexus') return new NexusProcessor();
  if (planType === 'enterprise') return new EnterpriseProcessor();
  throw new Error('Unknown planType');
}
