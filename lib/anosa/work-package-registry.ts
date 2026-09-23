import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { integrityHash } from '@/lib/anosa/execution';
import type { AnosaReleaseSimulation, AnosaWorkPackage, AnosaWorkPackageRegistrySnapshot } from '@/lib/anosa/types';
import { getAdminFirestore } from '@/lib/firebase/admin';

export const WORK_PACKAGE_REGISTRY_VERSION = '4.1.0' as const;

const packages: AnosaWorkPackage[] = [
  { id: 'brand-interface', name: 'Brand & interface foundation', sequence: 1, owner: 'Product & Design', risk: 'low', status: 'complete', dependencies: [], acceptanceEvidence: ['locked-brand-system', 'responsive-interface'] },
  { id: 'identity-auth', name: 'Identity & authentication', sequence: 2, owner: 'Identity Engineering', risk: 'high', status: 'complete', dependencies: ['brand-interface'], acceptanceEvidence: ['founder-authentication', 'step-up-session'] },
  { id: 'roles-permissions', name: 'Roles & permissions', sequence: 3, owner: 'Security Engineering', risk: 'high', status: 'complete', dependencies: ['identity-auth'], acceptanceEvidence: ['founder-role-claim', 'server-authorization'] },
  { id: 'authorization-data', name: 'Authorization & protected data', sequence: 4, owner: 'Platform Security', risk: 'high', status: 'complete', dependencies: ['roles-permissions'], acceptanceEvidence: ['deny-by-default-rules', 'server-only-writes'] },
  { id: 'evidence-controls', name: 'Evidence & resilience controls', sequence: 5, owner: 'Governance Engineering', risk: 'high', status: 'complete', dependencies: ['authorization-data'], acceptanceEvidence: ['permanent-evidence', 'verified-recovery-drill', 'release-simulation'] },
  { id: 'kyc-aml', name: 'KYC/AML & customer profiles', sequence: 6, owner: 'Compliance & Identity', risk: 'high', status: 'planned', dependencies: ['evidence-controls'], acceptanceEvidence: ['consent-record', 'identity-proofing', 'sanctions-screening', 'manual-review-path'] },
  { id: 'wallet-ledger', name: 'Wallet & ledger foundation', sequence: 7, owner: 'Financial Core', risk: 'high', status: 'dependency-gated', dependencies: ['kyc-aml'], acceptanceEvidence: ['double-entry-ledger', 'balance-invariants', 'reconciliation'] },
  { id: 'payment-sandbox', name: 'Payment provider sandbox', sequence: 8, owner: 'Payments Engineering', risk: 'high', status: 'dependency-gated', dependencies: ['wallet-ledger'], acceptanceEvidence: ['signed-webhooks', 'idempotent-transactions', 'sandbox-only'] },
  { id: 'marketplace-affiliate', name: 'Marketplace & affiliate engine', sequence: 9, owner: 'Commerce Engineering', risk: 'medium', status: 'dependency-gated', dependencies: ['payment-sandbox'], acceptanceEvidence: ['commission-rules', 'order-state-machine'] },
  { id: 'learning-rewards', name: 'Learning & rewards', sequence: 10, owner: 'Learning Product', risk: 'medium', status: 'dependency-gated', dependencies: ['marketplace-affiliate'], acceptanceEvidence: ['course-completion', 'reward-policy'] },
  { id: 'community', name: 'Community', sequence: 11, owner: 'Community Product', risk: 'medium', status: 'dependency-gated', dependencies: ['learning-rewards'], acceptanceEvidence: ['moderation-controls', 'privacy-controls'] },
  { id: 'anosa-intelligence', name: 'ANOSA intelligence integration', sequence: 12, owner: 'AI & Data', risk: 'high', status: 'dependency-gated', dependencies: ['community'], acceptanceEvidence: ['grounded-sources', 'human-approval', 'model-monitoring'] },
  { id: 'production-readiness', name: 'Production-readiness certification', sequence: 13, owner: 'Release Governance', risk: 'high', status: 'dependency-gated', dependencies: ['anosa-intelligence'], acceptanceEvidence: ['security-review', 'rollback-proof', 'founder-go-no-go'] },
];

export function readWorkPackageRegistry() {
  return {
    phase: '4.1' as const,
    version: WORK_PACKAGE_REGISTRY_VERSION,
    registryHash: integrityHash({ version: WORK_PACKAGE_REGISTRY_VERSION, packages }),
    packages,
    externalExecution: 'disabled' as const,
  };
}

function isoDate(value: unknown) {
  return value instanceof Timestamp ? value.toDate().toISOString() : String(value ?? '');
}

export async function listRegistrySnapshots(actorUid: string) {
  const snapshot = await getAdminFirestore().collection('anosaWorkPackageRegistries')
    .where('actorUid', '==', actorUid).orderBy('recordedAt', 'desc').limit(25).get();
  return snapshot.docs.map((document) => {
    const data = document.data();
    return { id: document.id, ...data, recordedAt: isoDate(data.recordedAt) } as AnosaWorkPackageRegistrySnapshot;
  });
}

export async function readLatestReleaseSimulation(actorUid: string) {
  const snapshot = await getAdminFirestore().collection('anosaReleaseSimulations')
    .where('actorUid', '==', actorUid).orderBy('simulatedAt', 'desc').limit(1).get();
  if (snapshot.empty) return null;
  const document = snapshot.docs[0];
  return { id: document.id, ...document.data(), simulatedAt: isoDate(document.data().simulatedAt) } as AnosaReleaseSimulation;
}

export async function recordWorkPackageRegistry(actorUid: string, requestId: string, releaseSimulation: AnosaReleaseSimulation | null) {
  if (releaseSimulation?.status !== 'ready' || releaseSimulation.mode !== 'simulation' || releaseSimulation.externalExecution !== 'disabled') {
    return { status: 'blocked' as const, snapshot: null };
  }
  const registry = readWorkPackageRegistry();
  const id = integrityHash({ actorUid, requestId, operation: 'record_work_package_registry' });
  const recordedAt = new Date().toISOString();
  const basis = {
    id, requestId, registryVersion: WORK_PACKAGE_REGISTRY_VERSION, registryHash: registry.registryHash,
    status: 'recorded' as const, recordedAt, actorUid, packageCount: packages.length,
    completePackages: packages.filter((item) => item.status === 'complete').length,
    plannedPackages: packages.filter((item) => item.status === 'planned').length,
    gatedPackages: packages.filter((item) => item.status === 'dependency-gated').length,
    releaseSimulationId: releaseSimulation.id, externalExecution: 'disabled' as const,
  };
  const snapshot: AnosaWorkPackageRegistrySnapshot = { ...basis, contentHash: integrityHash(basis), immutable: true };
  const database = getAdminFirestore();
  const reference = database.collection('anosaWorkPackageRegistries').doc(id);
  return database.runTransaction(async (transaction) => {
    const existing = await transaction.get(reference);
    if (existing.exists) return { status: 'replayed' as const, snapshot: { id: existing.id, ...existing.data(), recordedAt: isoDate(existing.data()?.recordedAt) } as AnosaWorkPackageRegistrySnapshot };
    transaction.create(reference, { ...snapshot, packages, serverReceivedAt: FieldValue.serverTimestamp() });
    transaction.create(database.collection('auditEvents').doc(), {
      actorUid, type: 'anosa.work_package.registry.recorded', occurredAt: FieldValue.serverTimestamp(),
      evidenceKind: 'work_package_registry', evidenceId: id, contentHash: snapshot.contentHash,
      immutable: true, retentionClass: 'permanent', externalExecution: 'disabled',
      metadata: { registryVersion: WORK_PACKAGE_REGISTRY_VERSION, registryHash: registry.registryHash, packageCount: packages.length },
    });
    return { status: 'created' as const, snapshot };
  });
}
