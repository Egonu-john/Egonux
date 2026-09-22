import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { firestoreLedgerEnabled } from '@/lib/anosa/execution';
import { readReviewIntegrity } from '@/lib/anosa/review-integrity';
import { listReleaseSimulations, readLatestRecoveryDrill, readReleaseManifest, runReleaseSimulation } from '@/lib/anosa/release-command';
import { requireAnosaFounder, requireAnosaStepUp, StepUpRequiredError } from '@/lib/anosa/server';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { withVercelOidcToken } from '@/lib/firebase/admin';

const simulationSchema = z.object({
  operation: z.literal('run_release_readiness_simulation'),
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
    const manifest = readReleaseManifest();
    if (!firestoreLedgerEnabled()) return response.status(200).json({ manifest, simulations: [], status: 'unavailable', persistence: 'device', externalExecution: 'disabled' });
    if (request.method === 'GET') {
      return response.status(200).json({ manifest, simulations: await listReleaseSimulations(principal.uid), persistence: 'firestore', externalExecution: 'disabled' });
    }
    const input = simulationSchema.parse(request.body);
    const [integrity, recovery] = await Promise.all([readReviewIntegrity(principal.uid), readLatestRecoveryDrill(principal.uid)]);
    const result = await runReleaseSimulation(principal.uid, input.requestId, integrity, recovery);
    if (result.status === 'blocked') return response.status(409).json({ error: 'Release simulation blocked until review integrity and recovery evidence are verified.', code: 'RELEASE_GATE_CLOSED', integrity, recovery, externalExecution: 'disabled' });
    return response.status(result.status === 'created' ? 201 : 200).json({ ...result, manifest, integrity, recovery, externalExecution: 'disabled' });
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid release simulation request.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    if (error instanceof StepUpRequiredError) return response.status(428).json({ error: 'Please sign in again before running a release simulation.', code: 'STEP_UP_REQUIRED' });
    console.error('ANOSA release command failed.', error);
    return response.status(503).json({ error: 'Release command is temporarily unavailable. No release state was changed.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
