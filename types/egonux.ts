export type ModuleId =
  | 'home'
  | 'identity'
  | 'wallet'
  | 'marketplace'
  | 'learn'
  | 'community'
  | 'affiliate'
  | 'ai'
  | 'security'
  | 'developer'
  | 'admin';

export type IconName =
  | 'home'
  | 'identity'
  | 'wallet'
  | 'marketplace'
  | 'learn'
  | 'community'
  | 'affiliate'
  | 'ai'
  | 'security'
  | 'developer'
  | 'admin'
  | 'bell'
  | 'search'
  | 'arrow-up'
  | 'arrow-down'
  | 'send'
  | 'plus'
  | 'qr'
  | 'chevron-right'
  | 'check'
  | 'close'
  | 'menu'
  | 'sparkles'
  | 'cart'
  | 'play'
  | 'copy'
  | 'external'
  | 'activity'
  | 'lock'
  | 'globe'
  | 'logout';

export interface NavigationItem {
  id: ModuleId;
  label: string;
  icon: IconName;
  badge?: string;
}

export interface WalletTransaction {
  id: string;
  merchant: string;
  detail: string;
  amount: string;
  direction: 'in' | 'out';
  status: 'Completed' | 'Pending' | 'Review';
  date: string;
}

export interface MarketplaceProduct {
  id: string;
  title: string;
  vendor: string;
  category: string;
  price: string;
  rating: number;
  accent: string;
  icon: string;
  type: 'Digital' | 'Service' | 'Physical';
}

export interface Course {
  id: string;
  title: string;
  track: string;
  lessons: number;
  duration: string;
  progress: number;
  level: string;
  accent: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  kind: 'security' | 'wallet' | 'learn' | 'system';
}

export interface ActionRequest {
  type: 'Deposit' | 'Transfer' | 'Withdraw';
  amount: string;
  recipient?: string;
}
