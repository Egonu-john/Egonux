import { FieldValue } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticationError, requirePrincipal } from '@/lib/auth/session';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appendAuditEvent } from '@/lib/server/audit';
import { InvalidOriginError, requireSameOrigin } from '@/lib/server/origin';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET' && request.method !== 'PUT') {
    response.setHeader('Allow', 'GET, PUT');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const principal = await requirePrincipal(request);
    const reference = getAdminFirestore().collection('users').doc(principal.uid);
    if (request.method === 'GET') {
      const snapshot = await reference.get();
      response.status(200).json({ profile: snapshot.exists ? snapshot.data() : null });
      return;
    }

    requireSameOrigin(request);
    const displayName = typeof request.body?.displayName === 'string'
      ? request.body.displayName.trim().slice(0, 100)
      : '';
    if (displayName.length < 2) {
      response.status(400).json({ error: 'Display name must contain at least two characters.' });
      return;
    }

    const existing = await reference.get();
    const profile = {
      displayName,
      email: principal.email,
      phoneNumber: null,
      photoURL: null,
      onboardingStatus: 'started',
      updatedAt: FieldValue.serverTimestamp(),
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    };
    await reference.set(profile, { merge: true });
    await appendAuditEvent(request, {
      actorUid: principal.uid,
      subjectUid: principal.uid,
      type: 'profile.upserted',
    });
    response.status(200).json({ updated: true });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      response.status(401).json({ error: error.message });
      return;
    }
    if (error instanceof InvalidOriginError) {
      response.status(403).json({ error: error.message });
      return;
    }
    response.status(500).json({ error: 'Unable to process the member profile.' });
  }
}
