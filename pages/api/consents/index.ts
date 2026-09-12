import { FieldValue } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { AuthenticationError, requirePrincipal } from '@/lib/auth/session';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { appendAuditEvent } from '@/lib/server/audit';
import { InvalidOriginError, requireSameOrigin } from '@/lib/server/origin';
import type { ConsentPurpose } from '@/types/backend';

const purposes = new Set<ConsentPurpose>([
  'terms-of-service',
  'privacy-policy',
  'identity-verification',
  'marketing',
]);

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET' && request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    const principal = await requirePrincipal(request);
    const collection = getAdminFirestore().collection('users').doc(principal.uid).collection('consents');

    if (request.method === 'GET') {
      const snapshot = await collection.orderBy('occurredAt', 'desc').limit(100).get();
      response.status(200).json({
        consents: snapshot.docs.map((document) => ({ id: document.id, ...document.data() })),
      });
      return;
    }

    requireSameOrigin(request);

    const purpose = request.body?.purpose as ConsentPurpose;
    const version = typeof request.body?.version === 'string' ? request.body.version.trim() : '';
    const granted = request.body?.granted;
    if (!purposes.has(purpose) || !version || typeof granted !== 'boolean') {
      response.status(400).json({ error: 'Valid purpose, version, and granted fields are required.' });
      return;
    }

    const record = await collection.add({
      purpose,
      version,
      granted,
      source: 'web',
      occurredAt: FieldValue.serverTimestamp(),
    });
    await appendAuditEvent(request, {
      actorUid: principal.uid,
      subjectUid: principal.uid,
      type: 'consent.recorded',
      metadata: { purpose, version, granted },
    });
    response.status(201).json({ id: record.id });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      response.status(401).json({ error: error.message });
      return;
    }
    if (error instanceof InvalidOriginError) {
      response.status(403).json({ error: error.message });
      return;
    }
    response.status(500).json({ error: 'Unable to process the consent record.' });
  }
}
