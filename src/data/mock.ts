export type LeadStatus =
  | 'queued'
  | 'calling'
  | 'completed';

export const leads = [
  {
    id: 'lead_001',
    name: 'John Doe',
    phone: '+1 234 567 890',
    email: 'john@example.com',
    interest: 'Downtown Penthouse',
    budget: '$1.2M',
    status: 'completed' as LeadStatus,
    aiDisposition: 'interested',
    callStatus: 'answered',
  },
  {
    id: 'lead_002',
    name: 'Alice Smith',
    phone: '+1 987 654 321',
    email: 'alice@example.com',
    interest: 'Suburban Family Home',
    budget: '$450k',
    status: 'queued' as LeadStatus,
  },
  {
    id: 'lead_003',
    name: 'Bob Wilson',
    phone: '+1 555 010 999',
    email: 'bob@example.com',
    interest: 'Luxury Villa',
    budget: '$5.0M',
    status: 'completed' as LeadStatus,
    aiDisposition: 'unknown',
    callStatus: 'answered',
  },
  {
    id: 'lead_004',
    name: 'Priya Kapoor',
    phone: '+91 98111 23456',
    email: 'priya@example.com',
    interest: 'Golf Course Estate',
    budget: '$2.3M',
    status: 'completed' as LeadStatus,
    aiDisposition: 'not_interested',
    callStatus: 'failed',
  },
];

export const notifications = [
  {
    id: 'note_1',
    title: 'Lead scored as high intent',
    body: 'MAXSAS AI flagged John Doe as likely to convert in 7 days.',
    time: '2h ago',
  },
  {
    id: 'note_2',
    title: 'Wallet balance updated',
    body: 'You added $250 credits to your AI calling wallet.',
    time: '1d ago',
  },
  {
    id: 'note_3',
    title: 'Weekly report ready',
    body: 'Your lead pipeline report is ready to review.',
    time: '3d ago',
  },
];

export const wallet = {
  balance: '$1,240',
  usage: '74% used',
  renewalDate: 'Feb 10, 2026',
};

export const paymentHistory = [
  { id: 'pay_1', title: 'AI Call Credits', amount: '$250', date: 'Jan 28, 2026' },
  { id: 'pay_2', title: 'SMS Top-up', amount: '$120', date: 'Jan 16, 2026' },
  { id: 'pay_3', title: 'Monthly Subscription', amount: '$499', date: 'Jan 01, 2026' },
];

export const weeklyReports = [
  { day: 'Mon', value: 30 },
  { day: 'Tue', value: 48 },
  { day: 'Wed', value: 36 },
  { day: 'Thu', value: 60 },
  { day: 'Fri', value: 52 },
  { day: 'Sat', value: 41 },
  { day: 'Sun', value: 55 },
];
