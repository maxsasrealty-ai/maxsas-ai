import { Lead } from './types';

export const leads: Lead[] = [
  {
    id: '1',
    name: 'John Doe',
    phone: '+1 234 567 890',
    email: 'john@example.com',
    propertyInterest: 'Downtown Penthouse',
    budget: '$1.2M',
    status: 'completed',
    aiDisposition: 'interested',
    callStatus: 'answered',
  },
  {
    id: '2',
    name: 'Alice Smith',
    phone: '+1 987 654 321',
    email: 'alice@example.com',
    propertyInterest: 'Suburban Family Home',
    budget: '$450k',
    status: 'queued',
  },
  {
    id: '3',
    name: 'Bob Wilson',
    phone: '+1 555 010 999',
    email: 'bob@example.com',
    propertyInterest: 'Luxury Villa',
    budget: '$5.0M',
    status: 'completed',
  },
];

export const walletBalance = 500;
