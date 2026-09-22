import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { firestoreLedgerEnabled } from '@/lib/anosa/execution';
import { listIntegrityIncidents, recordIntegrityIncident } from '@/lib/anosa/integrity-monitor';
import { requireAnosaFounder, requireAnosaStepUp, StepUpRequiredError } from '@/lib/anosa/server';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { withVercelOidcToken } from '@/lib/firebase/admin';
import { readReviewIntegrity } from '@/lib/anosa/review-integrity';

const monitorSchema = z.object({ operation: z.literal('run_integrity_check') });

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method ?? '')) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const principal = request.method === 'POST' ? await requireAnosaStepUp(request) : await requireAnosaFounder(request);
    if (!firestoreLedgerEnabled()) return response.status(200).json({ incidents: [], status: 'unavailable', persistence: 'device', externalExecution: 'disabled' });
    if (request.method === 'GET') {
      const incidents = await listIntegrityIncidents(principal.uid);
      return response.status(200).json({ incidents, persistence: 'firestore', externalExecution: 'disabled' });
    }
    monitorSchema.parse(request.body);
    const integrity = await readReviewIntegrity(principal.uid);
    const result = await recordIntegrityIncident(principal.uid, integrity);
    return response.status(result.status === 'created' ? 201 : 200).json({ ...result, integrity, externalExecution: 'disabled' });
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid integrity monitoring request.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    if (error instanceof StepUpRequiredError) return response.status(428).json({ error: 'Please sign in again before running an integrity check.', code: 'STEP_UP_REQUIRED' });
    console.error('ANOSA integrity incident check failed.', error);
    return response.status(503).json({ error: 'Integrity monitoring is temporarily unavailable. No incident was changed.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
