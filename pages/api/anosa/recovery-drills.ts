import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { firestoreLedgerEnabled } from '@/lib/anosa/execution';
import { listRecoveryDrills, runRecoveryDrill } from '@/lib/anosa/recovery-drill';
import { readReviewIntegrity } from '@/lib/anosa/review-integrity';
import { requireAnosaFounder, requireAnosaStepUp, StepUpRequiredError } from '@/lib/anosa/server';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { withVercelOidcToken } from '@/lib/firebase/admin';

const drillSchema = z.object({
  operation: z.literal('run_containment_recovery_drill'),
  requestId: z.string().min(8).max(200),
});

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method ?? '')) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const principal = request.method === 'POST' ? await requireAnosaStepUp(request) : await requireAnosaFounder(request);
    if (!firestoreLedgerEnabled()) return response.status(200).json({ drills: [], status: 'unavailable', persistence: 'device', externalExecution: 'disabled' });
    if (request.method === 'GET') {
      return response.status(200).json({ drills: await listRecoveryDrills(principal.uid), persistence: 'firestore', externalExecution: 'disabled' });
    }
    const input = drillSchema.parse(request.body);
    const integrity = await readReviewIntegrity(principal.uid);
    const result = await runRecoveryDrill(principal.uid, input.requestId, integrity);
    if (result.status === 'blocked') return response.status(409).json({ error: 'Recovery drill blocked because review integrity is not verified.', code: 'INTEGRITY_GATE_CLOSED', integrity, externalExecution: 'disabled' });
    return response.status(result.status === 'created' ? 201 : 200).json({ ...result, integrity, externalExecution: 'disabled' });
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid recovery drill request.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    if (error instanceof StepUpRequiredError) return response.status(428).json({ error: 'Please sign in again before running a recovery drill.', code: 'STEP_UP_REQUIRED' });
    console.error('ANOSA recovery drill failed.', error);
    return response.status(503).json({ error: 'Recovery drill is temporarily unavailable. No containment state was changed.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
