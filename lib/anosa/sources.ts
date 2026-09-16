export interface AnosaSource {
  id: string;
  label: string;
  category: 'governance' | 'product' | 'security' | 'delivery';
  location: string;
  summary: string;
  verifiedAt: string;
}

export const ANOSA_SOURCES: readonly AnosaSource[] = [
  {
    id: 'enterprise-mvp',
    label: 'EGONUX Enterprise MVP',
    category: 'product',
    location: '/docs/ENTERPRISE_MVP.md',
    summary: 'Defines the sandbox product boundary, identity, wallet, marketplace, learning, community, and intelligence modules.',
    verifiedAt: '2026-09-16',
  },
  {
    id: 'anosa-mobile-v1',
    label: 'ANOSA Mobile v1 specification',
    category: 'governance',
    location: '/docs/ANOSA_MOBILE_V1.md',
    summary: 'Defines the founder workflow as Read, Prepare, Approve, with execution kept outside the v1 authority boundary.',
    verifiedAt: '2026-09-16',
  },
  {
    id: 'security-policy',
    label: 'EGONUX security policy',
    category: 'security',
    location: '/SECURITY.md',
    summary: 'Requires least privilege, protected secrets, auditable changes, secure sessions, and responsible vulnerability handling.',
    verifiedAt: '2026-09-16',
  },
  {
    id: 'github-main',
    label: 'EGONUX GitHub main branch',
    category: 'delivery',
    location: 'https://github.com/Egonu-john/Egonux',
    summary: 'The controlled source-of-truth for reviewed application code and production deployment changes.',
    verifiedAt: '2026-09-16',
  },
] as const;

export function sourceContext() {
  return ANOSA_SOURCES.map((source) => (
    `[${source.id}] ${source.label}: ${source.summary}`
  )).join('\n');
}
