import { createHash, randomUUID } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { requireAnosaFounder } from '@/lib/anosa/server';
import type { AnosaDecisionRecord } from '@/lib/anosa/types';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { getAdminFirestore } from '@/lib/firebase/admin';

const decisionSchema = z.object({
  proposalId: z.string().min(3).max(160),
  title: z.string().min(3).max(160),
  state: z.enum(['approved', 'rejected', 'changes_requested']),
});

function contentHash(input: { proposalId: string; title: string; state: string; recordedAt: string; actorUid: string }) {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method ?? '')) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const principal = await requireAnosaFounder(request);

    if (request.method === 'GET') {
      if (process.env.EGONUX_AUTH_REQUIRED !== 'true') return response.status(200).json({ decisions: [] });
      const snapshot = await getAdminFirestore()
        .collection('anosaDecisions')
        .where('actorUid', '==', principal.uid)
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
    };

    if (process.env.EGONUX_AUTH_REQUIRED === 'true') {
      const database = getAdminFirestore();
      const batch = database.batch();
      batch.create(database.collection('anosaDecisions').doc(record.id), {
        ...record,
        serverReceivedAt: FieldValue.serverTimestamp(),
        immutable: true,
      });
      batch.create(database.collection('auditEvents').doc(), {
        actorUid: principal.uid,
        type: 'anosa.decision.recorded',
        occurredAt: FieldValue.serverTimestamp(),
        metadata: {
          proposalId: record.proposalId,
          state: record.state,
          contentHash: record.contentHash,
          execution: 'locked',
        },
        request: {
          forwardedFor: request.headers['x-forwarded-for'] ?? null,
          userAgent: request.headers['user-agent'] ?? null,
        },
      });
      await batch.commit();
    }

    return response.status(201).json({ decision: record, execution: 'locked' });
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid decision record.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    console.error('ANOSA decision ledger failed.', error);
    return response.status(503).json({ error: 'The secure decision ledger is temporarily unavailable. No decision was recorded.' });
  }
}
