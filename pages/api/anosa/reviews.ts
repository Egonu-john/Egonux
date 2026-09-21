import { randomUUID } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { persistEvidenceReview } from '@/lib/anosa/evidence';
import { firestoreLedgerEnabled, integrityHash } from '@/lib/anosa/execution';
import { requireAnosaFounder, requireAnosaStepUp, StepUpRequiredError } from '@/lib/anosa/server';
import type { AnosaEvidenceReview } from '@/lib/anosa/types';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { getAdminFirestore, withVercelOidcToken } from '@/lib/firebase/admin';

const reviewSchema = z.object({
  evidenceKind: z.enum(['decision', 'execution_intent']),
  evidenceId: z.string().min(3).max(160),
  state: z.enum(['approved', 'rejected', 'escalated']),
  reason: z.string().trim().min(12).max(2_000),
});

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : String(value ?? '');
}

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method ?? '')) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const principal = request.method === 'POST' ? await requireAnosaStepUp(request) : await requireAnosaFounder(request);
    if (request.method === 'GET') {
      if (!firestoreLedgerEnabled()) return response.status(200).json({ reviews: [], persistence: 'device' });
      const snapshot = await getAdminFirestore().collection('anosaEvidenceReviews')
        .where('reviewerUid', '==', principal.uid).orderBy('reviewedAt', 'desc').limit(50).get();
      const reviews = snapshot.docs.map((document) => {
        const data = document.data();
        return { id: document.id, ...data, reviewedAt: isoDate(data.reviewedAt) } as AnosaEvidenceReview;
      });
      return response.status(200).json({ reviews, persistence: 'firestore' });
    }
    const input = reviewSchema.parse(request.body);
    const reviewedAt = new Date().toISOString();
    const basis = { ...input, reviewedAt, reviewerUid: principal.uid, externalExecution: 'disabled' as const };
    const review: AnosaEvidenceReview = { id: randomUUID(), ...basis, contentHash: integrityHash(basis), persistence: firestoreLedgerEnabled() ? 'firestore' : 'device' };
    if (firestoreLedgerEnabled()) await persistEvidenceReview(review);
    return response.status(201).json({ review, externalExecution: 'disabled' });
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid evidence review.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    if (error instanceof StepUpRequiredError) return response.status(428).json({ error: 'Please sign in again before reviewing evidence.', code: 'STEP_UP_REQUIRED' });
    console.error('ANOSA evidence review failed.', error);
    return response.status(503).json({ error: 'Evidence review is temporarily unavailable. No review was recorded.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
