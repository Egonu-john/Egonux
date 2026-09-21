import { Timestamp } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { requireAnosaFounder } from '@/lib/anosa/server';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { firestoreLedgerEnabled } from '@/lib/anosa/execution';
import { getAdminFirestore, withVercelOidcToken } from '@/lib/firebase/admin';
import type { AnosaAuditEvent, AnosaEvidenceVerification } from '@/lib/anosa/types';

const HASH_PATTERN = /^[a-f0-9]{64}$/;

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : String(value ?? '');
}

function validEnvelope(data: FirebaseFirestore.DocumentData, id: string, actorUid: string) {
  return data.evidenceId === id
    && data.actorUid === actorUid
    && data.immutable === true
    && data.retentionClass === 'permanent'
    && data.schemaVersion === 2
    && HASH_PATTERN.test(String(data.contentHash ?? ''));
}

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
      const verification: AnosaEvidenceVerification = {
        phase: '3.3', status: 'unavailable', checkedAt, checkedRecords: 0,
        verifiedRecords: 0, brokenRecords: 0, auditEvents: [], externalExecution: 'disabled',
      };
      return response.status(200).json({ verification, persistence: 'device' });
    }

    const database = getAdminFirestore();
    const [decisions, intents, audits] = await Promise.all([
      database.collection('anosaDecisions').where('actorUid', '==', principal.uid).orderBy('recordedAt', 'desc').limit(50).get(),
      database.collection('anosaExecutionIntents').where('actorUid', '==', principal.uid).orderBy('requestedAt', 'desc').limit(50).get(),
      database.collection('auditEvents').where('actorUid', '==', principal.uid).orderBy('occurredAt', 'desc').limit(150).get(),
    ]);
    const auditByEvidence = new Map(audits.docs.map((document) => {
      const data = document.data();
      return [`${data.evidenceKind}:${data.evidenceId}`, { id: document.id, data }] as const;
    }));
    const records = [
      ...decisions.docs.map((document) => ({ kind: 'decision', document, expectedType: 'anosa.decision.recorded' })),
      ...intents.docs.map((document) => ({ kind: 'execution_intent', document, expectedType: 'anosa.execution_intent.simulated' })),
    ];
    let verifiedRecords = 0;
    const auditEvents: AnosaAuditEvent[] = [];
    for (const record of records) {
      const data = record.document.data();
      const audit = auditByEvidence.get(`${record.kind}:${record.document.id}`);
      const auditData = audit?.data;
      const verified = validEnvelope(data, record.document.id, principal.uid)
        && Boolean(auditData)
        && validEnvelope(auditData!, record.document.id, principal.uid)
        && auditData?.type === record.expectedType
        && auditData?.contentHash === data.contentHash;
      if (verified) verifiedRecords += 1;
      auditEvents.push({
        id: audit?.id ?? `missing:${record.document.id}`,
        evidenceKind: record.kind as 'decision' | 'execution_intent',
        evidenceId: record.document.id,
        type: String(auditData?.type ?? 'audit.missing'),
        occurredAt: isoDate(auditData?.occurredAt ?? data.recordedAt ?? data.requestedAt),
        contentHash: String(data.contentHash ?? ''),
        verified,
      });
    }
    auditEvents.sort((left, right) => right.occurredAt.localeCompare(left.occurredAt));
    const brokenRecords = records.length - verifiedRecords;
    const verification: AnosaEvidenceVerification = {
      phase: '3.3', status: brokenRecords === 0 ? 'verified' : 'attention', checkedAt,
      checkedRecords: records.length, verifiedRecords, brokenRecords,
      auditEvents: auditEvents.slice(0, 50), externalExecution: 'disabled',
    };
    return response.status(200).json({ verification, persistence: 'firestore' });
  } catch (error) {
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    console.error('ANOSA evidence verification failed.', error);
    return response.status(503).json({ error: 'Evidence verification is temporarily unavailable. No records were changed.' });
  }
}

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
