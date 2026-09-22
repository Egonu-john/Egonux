import type { NextApiRequest, NextApiResponse } from 'next';
import { firestoreLedgerEnabled } from '@/lib/anosa/execution';
import { verifyReviewIntegrity } from '@/lib/anosa/review-integrity';
import { requireAnosaFounder } from '@/lib/anosa/server';
import type { AnosaReviewIntegrity } from '@/lib/anosa/types';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { getAdminFirestore, withVercelOidcToken } from '@/lib/firebase/admin';

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).json({ error: 'Method not allowed.' });
  }
  try {
    const principal = await requireAnosaFounder(request);
    const checkedAt = new Date().toISOString();
    if (!firestoreLedgerEnabled()) {
      const integrity: AnosaReviewIntegrity = {
        phase: '3.7', status: 'unavailable', checkedAt, checkedReceipts: 0,
        verifiedReceipts: 0, brokenReceipts: 0, currentStates: 0,
        verifiedStates: 0, externalExecution: 'disabled',
      };
      return response.status(200).json({ integrity, persistence: 'device' });
    }
    const database = getAdminFirestore();
    const [reviews, states, audits] = await Promise.all([
      database.collection('anosaEvidenceReviews').where('reviewerUid', '==', principal.uid).limit(100).get(),
      database.collection('anosaEvidenceReviewStates').where('reviewerUid', '==', principal.uid).limit(100).get(),
      database.collection('auditEvents').where('actorUid', '==', principal.uid).limit(150).get(),
    ]);
    const map = (snapshot: FirebaseFirestore.QuerySnapshot) => snapshot.docs.map((document) => ({ id: document.id, data: document.data() }));
    const integrity = verifyReviewIntegrity({ reviewerUid: principal.uid, reviews: map(reviews), states: map(states), audits: map(audits), checkedAt });
    return response.status(200).json({ integrity, persistence: 'firestore' });
  } catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    console.error('ANOSA review integrity verification failed.', error);
    return response.status(503).json({ error: 'Review integrity verification is temporarily unavailable. No records were changed.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
