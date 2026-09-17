import type { NextApiRequest, NextApiResponse } from 'next';
import { ANOSA_SOURCES } from '@/lib/anosa/sources';
import { requireAnosaFounder } from '@/lib/anosa/server';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { anosaLog } from '@/lib/anosa/telemetry';
import { publicExecutionStatus } from '@/lib/anosa/execution';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const startedAt = Date.now();
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    await requireAnosaFounder(request);
    anosaLog(request, '/api/anosa/context', 'loaded', startedAt, { sources: ANOSA_SOURCES.length });
    return response.status(200).json({
      sources: ANOSA_SOURCES,
      execution: 'locked',
      capabilities: ['read', 'prepare', 'approve', 'simulate'],
      control: publicExecutionStatus(),
    });
  } catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    throw error;
  }
}
