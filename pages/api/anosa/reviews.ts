import { randomUUID } from 'node:crypto';
import { Timestamp } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createControlledReviewEvidence, EvidenceReplayConflictError, EvidenceReviewTargetError, EvidenceReviewTransitionError, persistEvidenceReview } from '@/lib/anosa/evidence';
import { firestoreLedgerEnabled, integrityHash } from '@/lib/anosa/execution';
import { requireAnosaFounder, requireAnosaStepUp, StepUpRequiredError } from '@/lib/anosa/server';
import type { AnosaEvidenceReview } from '@/lib/anosa/types';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { getAdminFirestore, withVercelOidcToken } from '@/lib/firebase/admin';

const reviewSchema = z.object({
  operation: z.literal('review'),
  evidenceKind: z.enum(['decision', 'execution_intent', 'controlled_test']),
  evidenceId: z.string().min(3).max(160),
  state: z.enum(['approved', 'rejected', 'escalated']),
  reason: z.string().trim().min(12).max(2_000),
  requestId: z.string().min(8).max(160),
});

const controlledTestSchema = z.object({ operation: z.literal('create_controlled_test') });

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
        const evidenceKind = data.evidenceKind === 'review' && data.targetEvidenceKind ? data.targetEvidenceKind : data.evidenceKind;
        const evidenceId = data.evidenceKind === 'review' && data.targetEvidenceId ? data.targetEvidenceId : data.evidenceId;
        return { id: document.id, ...data, evidenceKind, evidenceId, reviewedAt: isoDate(data.reviewedAt) } as AnosaEvidenceReview;
      });
      return response.status(200).json({ reviews, persistence: 'firestore' });
    }
    const operation = z.discriminatedUnion('operation', [reviewSchema, controlledTestSchema]).parse(request.body);
    if (operation.operation === 'create_controlled_test') {
      if (!firestoreLedgerEnabled()) {
        const id = randomUUID(); const occurredAt = new Date().toISOString();
        return response.status(201).json({ event: { id: `controlled-review:${id}`, evidenceKind: 'controlled_test', evidenceId: id, type: 'anosa.controlled_review.test', occurredAt, contentHash: integrityHash({ id, occurredAt, reviewerUid: principal.uid }), schemaVersion: 2, signatureVerified: false, verified: false }, persistence: 'device', externalExecution: 'disabled' });
      }
      const event = await createControlledReviewEvidence(principal.uid);
      return response.status(201).json({ event, persistence: 'firestore', externalExecution: 'disabled' });
    }
    const input = operation;
    const reviewedAt = new Date().toISOString();
    const reviewInput = { evidenceKind: input.evidenceKind, evidenceId: input.evidenceId, state: input.state, reason: input.reason, requestId: input.requestId };
    const basis = { ...reviewInput, reviewedAt, reviewerUid: principal.uid, externalExecution: 'disabled' as const };
    const review: AnosaEvidenceReview = { id: integrityHash({ reviewerUid: principal.uid, requestId: input.requestId }), ...basis, contentHash: integrityHash(basis), persistence: firestoreLedgerEnabled() ? 'firestore' : 'device' };
    const result = firestoreLedgerEnabled() ? await persistEvidenceReview(review) : { status: 'created' as const, review };
    return response.status(result.status === 'replayed' ? 200 : 201).json({ review: result.review, replayed: result.status === 'replayed', externalExecution: 'disabled' });
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid evidence review.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    if (error instanceof StepUpRequiredError) return response.status(428).json({ error: 'Please sign in again before reviewing evidence.', code: 'STEP_UP_REQUIRED' });
    if (error instanceof EvidenceReviewTargetError) return response.status(404).json({ error: error.message, code: 'REVIEW_TARGET_NOT_FOUND' });
    if (error instanceof EvidenceReviewTransitionError) return response.status(409).json({ error: error.message, code: 'REVIEW_TRANSITION_DENIED' });
    if (error instanceof EvidenceReplayConflictError) return response.status(409).json({ error: error.message, code: 'REVIEW_REPLAY_CONFLICT' });
    console.error('ANOSA evidence review failed.', error);
    return response.status(503).json({ error: 'Evidence review is temporarily unavailable. No review was recorded.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
