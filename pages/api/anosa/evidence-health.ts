import type { NextApiRequest, NextApiResponse } from 'next';
import { evidenceReadiness, runEvidenceCanary } from '@/lib/anosa/evidence';
import { requireAnosaFounder, requireAnosaStepUp, StepUpRequiredError } from '@/lib/anosa/server';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { withVercelOidcToken } from '@/lib/firebase/admin';

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method ?? '')) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const principal = request.method === 'POST' ? await requireAnosaStepUp(request) : await requireAnosaFounder(request);
    const readiness = evidenceReadiness(Boolean(request.headers['x-vercel-oidc-token'] ?? process.env.VERCEL_OIDC_TOKEN));
    if (request.method === 'GET') return response.status(200).json({ evidence: readiness });
    if (!readiness.canaryReady) {
      return response.status(412).json({
        error: 'Permanent cloud evidence is not activated. Complete workload identity and enable the ledger before running the canary.',
        code: 'EVIDENCE_GATE_CLOSED',
        evidence: readiness,
      });
    }
    const canary = await runEvidenceCanary(principal.uid);
    return response.status(201).json({ evidence: readiness, canary });
  } catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    if (error instanceof StepUpRequiredError) return response.status(428).json({ error: 'Please sign in again before testing permanent evidence.', code: 'STEP_UP_REQUIRED' });
    console.error('ANOSA evidence canary failed.', error);
    return response.status(503).json({ error: 'The permanent evidence canary failed. The cloud ledger was not promoted.', code: 'EVIDENCE_CANARY_FAILED' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
