import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { integrityHash } from '@/lib/anosa/execution';
import type { AnosaRecoveryDrill, AnosaReleaseSimulation, AnosaReleaseWorkstream, AnosaReviewIntegrity } from '@/lib/anosa/types';
import { getAdminFirestore } from '@/lib/firebase/admin';

export const RELEASE_MANIFEST_VERSION = '4.0.0' as const;

const releasePlan = [
  { id: 'brand-interface', name: 'Brand & interface foundation', dependencies: [] },
  { id: 'identity-auth', name: 'Identity & authentication', dependencies: ['brand-interface'] },
  { id: 'roles-permissions', name: 'Roles & permissions', dependencies: ['identity-auth'] },
  { id: 'authorization-data', name: 'Authorization & protected data', dependencies: ['roles-permissions'] },
  { id: 'evidence-controls', name: 'Evidence & resilience controls', dependencies: ['authorization-data'] },
  { id: 'kyc-aml', name: 'KYC/AML & customer profiles', dependencies: ['evidence-controls'] },
  { id: 'wallet-ledger', name: 'Wallet & ledger foundation', dependencies: ['kyc-aml'] },
  { id: 'payment-sandbox', name: 'Payment provider sandbox', dependencies: ['wallet-ledger'] },
  { id: 'marketplace-affiliate', name: 'Marketplace & affiliate engine', dependencies: ['payment-sandbox'] },
  { id: 'learning-rewards', name: 'Learning & rewards', dependencies: ['marketplace-affiliate'] },
  { id: 'community', name: 'Community', dependencies: ['learning-rewards'] },
  { id: 'anosa-intelligence', name: 'ANOSA intelligence integration', dependencies: ['community'] },
  { id: 'production-readiness', name: 'Production-readiness certification', dependencies: ['anosa-intelligence'] },
] as const;

const completedFoundation = new Set(['brand-interface', 'identity-auth', 'roles-permissions', 'authorization-data', 'evidence-controls']);

export function readReleaseManifest() {
  const workstreams: AnosaReleaseWorkstream[] = releasePlan.map((item, index) => ({
    ...item,
    dependencies: [...item.dependencies],
    sequence: index + 1,
    status: item.dependencies.every((dependency) => completedFoundation.has(dependency)) && completedFoundation.has(item.id) ? 'ready' : 'blocked',
  }));
  return {
    phase: '4.0' as const,
    version: RELEASE_MANIFEST_VERSION,
    manifestHash: integrityHash({ version: RELEASE_MANIFEST_VERSION, releasePlan }),
    workstreams,
    externalExecution: 'disabled' as const,
  };
}

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : String(value ?? '');
}

export async function listReleaseSimulations(actorUid: string) {
  const snapshot = await getAdminFirestore().collection('anosaReleaseSimulations')
    .where('actorUid', '==', actorUid).orderBy('simulatedAt', 'desc').limit(25).get();
  return snapshot.docs.map((document) => {
    const data = document.data();
    return { id: document.id, ...data, simulatedAt: isoDate(data.simulatedAt) } as AnosaReleaseSimulation;
  });
}

export async function readLatestRecoveryDrill(actorUid: string) {
  const snapshot = await getAdminFirestore().collection('anosaRecoveryDrills')
    .where('actorUid', '==', actorUid).orderBy('runAt', 'desc').limit(1).get();
  if (snapshot.empty) return null;
  const document = snapshot.docs[0];
  return { id: document.id, ...document.data(), runAt: isoDate(document.data().runAt) } as AnosaRecoveryDrill;
}

export async function runReleaseSimulation(actorUid: string, requestId: string, integrity: AnosaReviewIntegrity, recovery: AnosaRecoveryDrill | null) {
  if (integrity.status !== 'verified' || recovery?.status !== 'recovered' || recovery.recovery !== 'verified') {
    return { status: 'blocked' as const, simulation: null };
  }
  const manifest = readReleaseManifest();
  const id = integrityHash({ actorUid, requestId, operation: 'release_readiness_simulation' });
  const simulatedAt = new Date().toISOString();
  const readyWorkstreams = manifest.workstreams.filter((item) => item.status === 'ready').length;
  const basis = {
    id, requestId, manifestVersion: RELEASE_MANIFEST_VERSION, manifestHash: manifest.manifestHash,
    status: 'ready' as const, mode: 'simulation' as const, simulatedAt, actorUid,
    readyWorkstreams, blockedWorkstreams: manifest.workstreams.length - readyWorkstreams,
    dependencyChecks: manifest.workstreams.reduce((total, item) => total + item.dependencies.length, 0),
    recoveryDrillId: recovery.id, reviewIntegrityCheckedAt: integrity.checkedAt,
    externalExecution: 'disabled' as const,
  };
  const simulation: AnosaReleaseSimulation = { ...basis, contentHash: integrityHash(basis), immutable: true };
  const database = getAdminFirestore();
  const reference = database.collection('anosaReleaseSimulations').doc(id);
  return database.runTransaction(async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists) return { status: 'replayed' as const, simulation: { id: existing.id, ...existing.data(), simulatedAt: isoDate(existing.data()?.simulatedAt) } as AnosaReleaseSimulation };
    transaction.create(reference, { ...simulation, serverReceivedAt: FieldValue.serverTimestamp() });
    transaction.create(database.collection('auditEvents').doc(), {
      actorUid, type: 'anosa.release.simulation.completed', occurredAt: FieldValue.serverTimestamp(),
      evidenceKind: 'release_simulation', evidenceId: id, contentHash: simulation.contentHash,
      immutable: true, retentionClass: 'permanent', externalExecution: 'disabled',
      metadata: { manifestVersion: RELEASE_MANIFEST_VERSION, manifestHash: manifest.manifestHash, readyWorkstreams, blockedWorkstreams: simulation.blockedWorkstreams },
    });
    return { status: 'created' as const, simulation };
  });
}
