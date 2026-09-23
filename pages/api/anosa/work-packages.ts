import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { firestoreLedgerEnabled } from '@/lib/anosa/execution';
import { listRegistrySnapshots, readLatestReleaseSimulation, readWorkPackageRegistry, recordWorkPackageRegistry } from '@/lib/anosa/work-package-registry';
import { requireAnosaFounder, requireAnosaStepUp, StepUpRequiredError } from '@/lib/anosa/server';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { withVercelOidcToken } from '@/lib/firebase/admin';

const registrySchema = z.object({ operation: z.literal('record_work_package_registry'), requestId: z.string().min(8).max(200) });

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method ?? '')) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const principal = request.method === 'POST' ? await requireAnosaStepUp(request) : await requireAnosaFounder(request);
    const registry = readWorkPackageRegistry();
    if (!firestoreLedgerEnabled()) return response.status(200).json({ registry, snapshots: [], status: 'unavailable', persistence: 'device', externalExecution: 'disabled' });
    if (request.method === 'GET') return response.status(200).json({ registry, snapshots: await listRegistrySnapshots(principal.uid), persistence: 'firestore', externalExecution: 'disabled' });
    const input = registrySchema.parse(request.body);
    const releaseSimulation = await readLatestReleaseSimulation(principal.uid);
    const result = await recordWorkPackageRegistry(principal.uid, input.requestId, releaseSimulation);
    if (result.status === 'blocked') return response.status(409).json({ error: 'Work-package registry blocked until a verified release simulation exists.', code: 'REGISTRY_GATE_CLOSED', releaseSimulation, externalExecution: 'disabled' });
    return response.status(result.status === 'created' ? 201 : 200).json({ ...result, registry, releaseSimulation, externalExecution: 'disabled' });
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid work-package registry request.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    if (error instanceof StepUpRequiredError) return response.status(428).json({ error: 'Please sign in again before recording the work-package registry.', code: 'STEP_UP_REQUIRED' });
    console.error('ANOSA work-package registry failed.', error);
    return response.status(503).json({ error: 'Work-package registry is temporarily unavailable. No registry state was changed.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
