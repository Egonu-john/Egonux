import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { integrityHash } from '@/lib/anosa/execution';
import type { AnosaIntegrityIncident, AnosaReviewIntegrity } from '@/lib/anosa/types';
import { getAdminFirestore } from '@/lib/firebase/admin';

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : String(value ?? '');
}

export async function listIntegrityIncidents(actorUid: string) {
  const snapshot = await getAdminFirestore().collection('anosaIntegrityIncidents')
    .where('actorUid', '==', actorUid).orderBy('detectedAt', 'desc').limit(25).get();
  return snapshot.docs.map((document) => {
    const data = document.data();
    return { id: document.id, ...data, detectedAt: isoDate(data.detectedAt) } as AnosaIntegrityIncident;
  });
}

export async function recordIntegrityIncident(actorUid: string, integrity: AnosaReviewIntegrity) {
  if (integrity.status !== 'attention') return { status: 'healthy' as const, incident: null };
  const mismatchedStates = integrity.currentStates - integrity.verifiedStates;
  const fingerprint = integrityHash({
    actorUid,
    brokenReceipts: integrity.brokenReceipts,
    mismatchedStates,
    checkedReceipts: integrity.checkedReceipts,
    currentStates: integrity.currentStates,
  });
  const id = integrityHash({ actorUid, fingerprint });
  const detectedAt = new Date().toISOString();
  const basis = {
    id, fingerprint, severity: integrity.brokenReceipts > 0 ? 'high' as const : 'medium' as const,
    status: 'open' as const, detectedAt, actorUid, brokenReceipts: integrity.brokenReceipts,
    mismatchedStates, checkedReceipts: integrity.checkedReceipts, currentStates: integrity.currentStates,
    externalExecution: 'disabled' as const,
  };
  const incident: AnosaIntegrityIncident = { ...basis, contentHash: integrityHash(basis), immutable: true };
  const database = getAdminFirestore();
  const reference = database.collection('anosaIntegrityIncidents').doc(id);
  return database.runTransaction(async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists) return { status: 'replayed' as const, incident: { id: existing.id, ...existing.data(), detectedAt: isoDate(existing.data()?.detectedAt) } as AnosaIntegrityIncident };
    transaction.create(reference, { ...incident, serverReceivedAt: FieldValue.serverTimestamp() });
    transaction.create(database.collection('auditEvents').doc(), {
      actorUid, type: 'anosa.integrity.incident.detected', occurredAt: FieldValue.serverTimestamp(),
      evidenceKind: 'integrity_incident', evidenceId: id, contentHash: incident.contentHash,
      immutable: true, retentionClass: 'permanent', externalExecution: 'disabled',
      metadata: { severity: incident.severity, brokenReceipts: incident.brokenReceipts, mismatchedStates },
    });
    return { status: 'created' as const, incident };
  });
}
