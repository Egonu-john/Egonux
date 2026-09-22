import type { NextApiRequest, NextApiResponse } from 'next';
import { firestoreLedgerEnabled } from '@/lib/anosa/execution';
import { listIntegrityIncidents } from '@/lib/anosa/integrity-monitor';
import { readReviewIntegrity } from '@/lib/anosa/review-integrity';
import { requireAnosaFounder } from '@/lib/anosa/server';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { withVercelOidcToken } from '@/lib/firebase/admin';

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const principal = await requireAnosaFounder(request);
    if (!firestoreLedgerEnabled()) return response.status(412).json({ error: 'Cloud evidence is required before exporting an integrity report.', code: 'EVIDENCE_GATE_CLOSED' });
    const generatedAt = new Date().toISOString();
    const [integrity, incidents] = await Promise.all([
      readReviewIntegrity(principal.uid, generatedAt), listIntegrityIncidents(principal.uid),
    ]);
    const report = {
      report: 'ANOSA Phase 3.8 Evidence Integrity Report', generatedAt,
      scope: 'Founder review ledger and integrity incidents', integrity, incidents,
      externalExecution: 'disabled',
    };
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="anosa-integrity-${generatedAt.slice(0, 10)}.json"`);
    return response.status(200).send(JSON.stringify(report, null, 2));
  } catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    console.error('ANOSA integrity report export failed.', error);
    return response.status(503).json({ error: 'Integrity report export is temporarily unavailable. No records were changed.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
