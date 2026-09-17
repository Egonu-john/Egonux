import { createHash, randomUUID } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { requireAnosaFounder, requireAnosaStepUp, StepUpRequiredError } from '@/lib/anosa/server';
import type { AnosaDecisionRecord } from '@/lib/anosa/types';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { getAdminFirestore, withVercelOidcToken } from '@/lib/firebase/admin';
import { anosaLog } from '@/lib/anosa/telemetry';
import { firestoreLedgerEnabled } from '@/lib/anosa/execution';
import { persistDecisionEvidence } from '@/lib/anosa/evidence';

const decisionSchema = z.object({
  proposalId: z.string().min(3).max(160),
  title: z.string().min(3).max(160),
  state: z.enum(['approved', 'rejected', 'changes_requested']),
});

function contentHash(input: { proposalId: string; title: string; state: string; recordedAt: string; actorUid: string }) {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
  const startedAt = Date.now();
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method ?? '')) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const principal = request.method === 'POST'
      ? await requireAnosaStepUp(request)
      : await requireAnosaFounder(request);

    if (request.method === 'GET') {
      if (!firestoreLedgerEnabled()) return response.status(200).json({ decisions: [], persistence: 'device' });
      const snapshot = await getAdminFirestore()
        .collection('anosaDecisions')
        .where('actorUid', '==', principal.uid)
        .orderBy('recordedAt', 'desc')
        .limit(50)
        .get();
      const decisions = snapshot.docs.map((document) => {
        const data = document.data();
        const recordedAt = data.recordedAt instanceof Timestamp
          ? data.recordedAt.toDate().toISOString()
          : String(data.recordedAt);
        return { id: document.id, ...data, recordedAt } as AnosaDecisionRecord;
      }).sort((left, right) => right.recordedAt.localeCompare(left.recordedAt));
      return response.status(200).json({ decisions });
    }

    const input = decisionSchema.parse(request.body);
    const recordedAt = new Date().toISOString();
    const basis = { ...input, recordedAt, actorUid: principal.uid };
    const record: AnosaDecisionRecord = {
      id: randomUUID(),
      ...basis,
      contentHash: contentHash(basis),
      persistence: firestoreLedgerEnabled() ? 'firestore' : 'device',
    };

    if (firestoreLedgerEnabled()) {
      try {
        await persistDecisionEvidence(record, {
          forwardedFor: request.headers['x-forwarded-for'],
          userAgent: request.headers['user-agent'],
        });
      } catch (error) {
        record.persistence = 'device';
        console.warn('ANOSA Firestore ledger unavailable; returning an integrity-hashed device receipt.', {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    anosaLog(request, '/api/anosa/decisions', 'recorded', startedAt, { state: record.state, execution: 'locked' });

    return response.status(201).json({ decision: record, execution: 'locked', persistence: record.persistence });
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid decision record.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    if (error instanceof StepUpRequiredError) return response.status(428).json({ error: 'Please sign in again before recording a founder decision.', code: 'STEP_UP_REQUIRED' });
    console.error('ANOSA decision ledger failed.', error);
    return response.status(503).json({ error: 'The secure decision ledger is temporarily unavailable. No decision was recorded.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
