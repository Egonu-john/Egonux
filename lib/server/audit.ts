import { FieldValue } from 'firebase-admin/firestore';
import type { NextApiRequest } from 'next';
import { getAdminFirestore } from '@/lib/firebase/admin';
import type { AuditEventType } from '@/types/backend';

interface AuditEventInput {
  actorUid: string;
  type: AuditEventType;
  subjectUid?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function appendAuditEvent(request: NextApiRequest, event: AuditEventInput) {
  await getAdminFirestore().collection('auditEvents').add({
    ...event,
    occurredAt: FieldValue.serverTimestamp(),
    request: {
      forwardedFor: request.headers['x-forwarded-for'] ?? null,
      userAgent: request.headers['user-agent'] ?? null,
    },
  });
}
