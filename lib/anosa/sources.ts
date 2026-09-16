export interface AnosaSource {
  id: string;
  label: string;
  category: 'governance' | 'product' | 'security' | 'delivery';
  location: string;
  summary: string;
  verifiedAt: string;
  owner: string;
  purpose: string;
  freshness: string;
  status: 'connected' | 'controlled';
  classification: 'internal' | 'confidential';
}

export const ANOSA_SOURCES: readonly AnosaSource[] = [
  {
    id: 'enterprise-mvp',
    label: 'EGONUX Enterprise MVP',
    category: 'product',
    location: '/docs/ENTERPRISE_MVP.md',
    summary: 'Defines the sandbox product boundary, identity, wallet, marketplace, learning, community, and intelligence modules.',
    verifiedAt: '2026-09-16',
    owner: 'EGONUX Product', purpose: 'Product scope and sequencing', freshness: 'Release controlled', status: 'connected', classification: 'internal',
  },
  {
    id: 'anosa-mobile-v1',
    label: 'ANOSA Mobile v1 specification',
    category: 'governance',
    location: '/docs/ANOSA_MOBILE_V1.md',
    summary: 'Defines the founder workflow as Read, Prepare, Approve, with execution kept outside the v1 authority boundary.',
    verifiedAt: '2026-09-16',
    owner: 'Founder Office', purpose: 'ANOSA authority policy', freshness: 'Release controlled', status: 'connected', classification: 'confidential',
  },
  {
    id: 'security-policy',
    label: 'EGONUX security policy',
    category: 'security',
    location: '/SECURITY.md',
    summary: 'Requires least privilege, protected secrets, auditable changes, secure sessions, and responsible vulnerability handling.',
    verifiedAt: '2026-09-16',
    owner: 'EGONUX Security', purpose: 'Security constraints', freshness: 'Release controlled', status: 'connected', classification: 'confidential',
  },
  {
    id: 'github-main',
    label: 'EGONUX GitHub main branch',
    category: 'delivery',
    location: 'https://github.com/Egonu-john/Egonux',
    summary: 'The controlled source-of-truth for reviewed application code and production deployment changes.',
    verifiedAt: '2026-09-16',
    owner: 'EGONUX Engineering', purpose: 'Reviewed delivery status', freshness: 'Per main merge', status: 'connected', classification: 'internal',
  },
  {
    id: 'deployment-health', label: 'Vercel production health', category: 'delivery', location: '/api/health',
    summary: 'Provides the current production service, environment, operating mode, health status, and published capabilities.',
    verifiedAt: '2026-09-16', owner: 'EGONUX Engineering', purpose: 'Production readiness', freshness: 'Per request', status: 'connected', classification: 'internal',
  },
  {
    id: 'decision-ledger', label: 'Founder decision ledger', category: 'governance', location: 'firestore://anosaDecisions',
    summary: 'Issues integrity-hashed founder decision records and promotes them to create-only Firestore storage when production credentials are available.',
    verifiedAt: '2026-09-16', owner: 'Founder Office', purpose: 'Decision traceability', freshness: 'Immediate', status: 'controlled', classification: 'confidential',
  },
  {
    id: 'phase2-architecture', label: 'ANOSA Phase 2 architecture', category: 'product', location: '/docs/ANOSA_PHASE_2.md',
    summary: 'Defines the migration path to Vertex AI, BigQuery, Cloud Run connectors, Cloud KMS signing, and centralized monitoring.',
    verifiedAt: '2026-09-16', owner: 'EGONUX Architecture', purpose: 'Platform evolution', freshness: 'Release controlled', status: 'connected', classification: 'internal',
  },
] as const;

export function sourceContext() {
  return ANOSA_SOURCES.map((source) => (
    `[${source.id}] ${source.label}: ${source.summary}`
  )).join('\n');
}
