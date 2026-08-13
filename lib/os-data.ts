import type {
  Course,
  MarketplaceProduct,
  NavigationItem,
  Notification,
  WalletTransaction,
} from '@/types/egonux';

export const primaryNavigation: NavigationItem[] = [
  { id: 'home', label: 'Command Home', icon: 'home' },
  { id: 'identity', label: 'EGONUX Identity', icon: 'identity' },
  { id: 'wallet', label: 'Wallet', icon: 'wallet' },
  { id: 'marketplace', label: 'Marketplace', icon: 'marketplace' },
  { id: 'learn', label: 'Learn', icon: 'learn', badge: '3' },
  { id: 'community', label: 'Community', icon: 'community' },
  { id: 'affiliate', label: 'Affiliate', icon: 'affiliate' },
  { id: 'ai', label: 'EGONUX AI', icon: 'ai', badge: 'Beta' },
];

export const enterpriseNavigation: NavigationItem[] = [
  { id: 'security', label: 'Security Center', icon: 'security' },
  { id: 'developer', label: 'Developer Platform', icon: 'developer' },
  { id: 'admin', label: 'Founder Command', icon: 'admin' },
];

export const transactions: WalletTransaction[] = [
  {
    id: 'EGX-894021',
    merchant: 'EGONUX Academy',
    detail: 'AI for Digital Business · Course',
    amount: 'UGX 45,000',
    direction: 'out',
    status: 'Completed',
    date: 'Today, 09:42',
  },
  {
    id: 'EGX-893814',
    merchant: 'Affiliate reward',
    detail: 'August verified referral payout',
    amount: 'UGX 178,500',
    direction: 'in',
    status: 'Completed',
    date: 'Yesterday, 16:20',
  },
  {
    id: 'EGX-893302',
    merchant: 'Airtel Money',
    detail: 'Wallet top up · ending 1904',
    amount: 'UGX 250,000',
    direction: 'in',
    status: 'Completed',
    date: '11 Aug, 14:08',
  },
  {
    id: 'EGX-892917',
    merchant: 'Nile Creative Studio',
    detail: 'Marketplace service order',
    amount: 'UGX 85,000',
    direction: 'out',
    status: 'Review',
    date: '10 Aug, 11:31',
  },
];

export const products: MarketplaceProduct[] = [
  {
    id: 'market-01',
    title: 'Digital Business Launch Kit',
    vendor: 'EGONUX Studio',
    category: 'Business',
    price: 'UGX 79,000',
    rating: 4.9,
    accent: '#d7a53b',
    icon: 'DB',
    type: 'Digital',
  },
  {
    id: 'market-02',
    title: 'Premium Brand Identity Sprint',
    vendor: 'Nile Creative Studio',
    category: 'Services',
    price: 'UGX 450,000',
    rating: 4.8,
    accent: '#9678ff',
    icon: 'BI',
    type: 'Service',
  },
  {
    id: 'market-03',
    title: 'Creator Finance Planner',
    vendor: 'WealthCraft Africa',
    category: 'Finance',
    price: 'UGX 28,000',
    rating: 4.7,
    accent: '#4fbf9f',
    icon: 'CF',
    type: 'Digital',
  },
  {
    id: 'market-04',
    title: 'Executive Productivity Journal',
    vendor: 'Kampala Makers',
    category: 'Lifestyle',
    price: 'UGX 65,000',
    rating: 4.9,
    accent: '#e56868',
    icon: 'EP',
    type: 'Physical',
  },
];

export const courses: Course[] = [
  {
    id: 'course-01',
    title: 'Money Systems for Builders',
    track: 'Financial education',
    lessons: 12,
    duration: '3h 40m',
    progress: 68,
    level: 'Foundation',
    accent: '#d7a53b',
  },
  {
    id: 'course-02',
    title: 'AI for Digital Business',
    track: 'AI education',
    lessons: 18,
    duration: '5h 10m',
    progress: 34,
    level: 'Intermediate',
    accent: '#9678ff',
  },
  {
    id: 'course-03',
    title: 'Build Your First Online Store',
    track: 'Business education',
    lessons: 15,
    duration: '4h 25m',
    progress: 0,
    level: 'Foundation',
    accent: '#4fbf9f',
  },
];

export const notifications: Notification[] = [
  {
    id: 'notification-01',
    title: 'New device verified',
    body: 'Chrome on Android was approved for this account.',
    time: '8 min ago',
    unread: true,
    kind: 'security',
  },
  {
    id: 'notification-02',
    title: 'Reward credited',
    body: 'UGX 178,500 was added to your sandbox wallet.',
    time: '1 day ago',
    unread: true,
    kind: 'wallet',
  },
  {
    id: 'notification-03',
    title: 'Course milestone',
    body: 'You completed Module 8 of Money Systems for Builders.',
    time: '2 days ago',
    unread: false,
    kind: 'learn',
  },
];

export const communityChannels = [
  { id: 'channel-01', name: 'Wealth Builders Uganda', members: '8.4K', topic: 'Money & enterprise', joined: true },
  { id: 'channel-02', name: 'AI Builders Lab', members: '3.1K', topic: 'AI & technology', joined: true },
  { id: 'channel-03', name: 'Creator Commerce', members: '5.7K', topic: 'Marketplace growth', joined: false },
];

export const coreModules = [
  { id: 'identity', label: 'Identity', detail: 'Verified passport', state: 'Operational' },
  { id: 'wallet', label: 'Wallet', detail: 'Shared financial core', state: 'Sandbox' },
  { id: 'marketplace', label: 'Marketplace', detail: 'Digital commerce', state: 'Operational' },
  { id: 'learn', label: 'Learn', detail: 'Skills & credentials', state: 'Operational' },
  { id: 'community', label: 'Community', detail: 'Groups & channels', state: 'Operational' },
  { id: 'affiliate', label: 'Affiliate', detail: 'Compliant growth', state: 'Pilot' },
  { id: 'ai', label: 'EGONUX AI', detail: 'Platform intelligence', state: 'Beta' },
  { id: 'admin', label: 'Command Center', detail: 'Enterprise control', state: 'Operational' },
] as const;

export const founderMetrics = [
  { label: 'Total users', value: '1,284', delta: '+12.4%', tone: 'positive' },
  { label: 'Verified users', value: '846', delta: '65.9%', tone: 'neutral' },
  { label: 'Wallet volume', value: 'UGX 482.6M', delta: '+18.2%', tone: 'positive' },
  { label: 'MRR', value: 'UGX 24.8M', delta: '+8.7%', tone: 'positive' },
  { label: 'Open alerts', value: '3', delta: '1 critical', tone: 'warning' },
  { label: 'System health', value: '99.98%', delta: 'All regions', tone: 'positive' },
] as const;

export const securityControls = [
  { name: 'Multi-factor authentication', detail: 'Passkey + authenticator enforced', state: 'Protected' },
  { name: 'Device trust', detail: '3 approved devices · risk-aware access', state: 'Protected' },
  { name: 'Transaction approvals', detail: 'Step-up verification above policy limits', state: 'Active' },
  { name: 'Encryption', detail: 'In transit and at rest · managed key rotation', state: 'Active' },
  { name: 'Audit trail', detail: 'Immutable administrative event stream', state: 'Monitoring' },
];

export const platformServices = [
  { name: 'Identity API', uptime: '99.99%', latency: '82 ms', status: 'Healthy' },
  { name: 'Wallet ledger', uptime: '99.98%', latency: '104 ms', status: 'Healthy' },
  { name: 'Marketplace API', uptime: '99.97%', latency: '118 ms', status: 'Healthy' },
  { name: 'Learning service', uptime: '100%', latency: '73 ms', status: 'Healthy' },
  { name: 'Notification bus', uptime: '99.96%', latency: '91 ms', status: 'Healthy' },
];
