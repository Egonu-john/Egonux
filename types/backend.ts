export const EGONUX_ROLES = [
  'member',
  'vendor',
  'instructor',
  'agent',
  'support',
  'compliance',
  'admin',
  'founder',
] as const;

export type EgonuxRole = (typeof EGONUX_ROLES)[number];

export interface AuthenticatedPrincipal {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  roles: EgonuxRole[];
  sessionIssuedAt: number;
}

export type ConsentPurpose =
  | 'terms-of-service'
  | 'privacy-policy'
  | 'identity-verification'
  | 'marketing';

export interface ConsentRecord {
  purpose: ConsentPurpose;
  version: string;
  granted: boolean;
  occurredAt: string;
  source: 'web';
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  onboardingStatus: 'started' | 'profile-complete' | 'identity-pending' | 'verified';
}

export type AuditEventType =
  | 'auth.session.created'
  | 'auth.session.deleted'
  | 'profile.upserted'
  | 'consent.recorded';
