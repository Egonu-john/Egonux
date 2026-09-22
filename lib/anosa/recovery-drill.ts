import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { integrityHash } from '@/lib/anosa/execution';
import type { AnosaRecoveryDrill, AnosaReviewIntegrity } from '@/lib/anosa/types';
import { getAdminFirestore } from '@/lib/firebase/admin';

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : String(value ?? '');
}

export async function listRecoveryDrills(actorUid: string) {
  const snapshot = await getAdminFirestore().collection('anosaRecoveryDrills')
    .where('actorUid', '==', actorUid).orderBy('runAt', 'desc').limit(25).get();
  return snapshot.docs.map((document) => {
    const data = document.data();
    return { id: document.id, ...data, runAt: isoDate(data.runAt) } as AnosaRecoveryDrill;
  });
}

export async function runRecoveryDrill(actorUid: string, requestId: string, integrity: AnosaReviewIntegrity) {
  if (integrity.status !== 'verified') return { status: 'blocked' as const, drill: null };
  const id = integrityHash({ actorUid, requestId, operation: 'controlled_recovery_drill' });
  const runAt = new Date().toISOString();
  const basis = {
    id, requestId, scenario: 'controlled_integrity_isolation' as const,
    status: 'recovered' as const, containment: 'isolated' as const,
    recovery: 'verified' as const, runAt, actorUid,
    checkedReceipts: integrity.checkedReceipts,
    verifiedReceipts: integrity.verifiedReceipts,
    verifiedStates: integrity.verifiedStates,
    externalExecution: 'disabled' as const,
  };
  const drill: AnosaRecoveryDrill = { ...basis, contentHash: integrityHash(basis), immutable: true };
  const database = getAdminFirestore();
  const reference = database.collection('anosaRecoveryDrills').doc(id);
  return database.runTransaction(async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists) {
      return { status: 'replayed' as const, drill: { id: existing.id, ...existing.data(), runAt: isoDate(existing.data()?.runAt) } as AnosaRecoveryDrill };
    }
    transaction.create(reference, { ...drill, serverReceivedAt: FieldValue.serverTimestamp() });
    transaction.create(database.collection('auditEvents').doc(), {
      actorUid, type: 'anosa.recovery.drill.completed', occurredAt: FieldValue.serverTimestamp(),
      evidenceKind: 'recovery_drill', evidenceId: id, contentHash: drill.contentHash,
      immutable: true, retentionClass: 'permanent', externalExecution: 'disabled',
      metadata: { scenario: drill.scenario, containment: drill.containment, recovery: drill.recovery },
    });
    return { status: 'created' as const, drill };
  });
}
