import { randomUUID } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { firestoreLedgerEnabled, integrityHash } from '@/lib/anosa/execution';
import type { AnosaDecisionRecord, AnosaExecutionIntent } from '@/lib/anosa/types';

export const EVIDENCE_SCHEMA_VERSION = 1;

export function evidenceReadiness(runtimeIdentityAvailable = Boolean(process.env.VERCEL_OIDC_TOKEN)) {
  const projectConfigured = Boolean(process.env.GOOGLE_CLOUD_PROJECT ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const federationConfigured = Boolean(process.env.GCP_WIF_AUDIENCE && process.env.GCP_SERVICE_ACCOUNT_EMAIL && runtimeIdentityAvailable);
  const emulatorConfigured = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  const ledgerEnabled = firestoreLedgerEnabled();
  return {
    phase: '3.1',
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    mode: ledgerEnabled ? 'cloud' : 'device',
    projectConfigured,
    identityConfigured: federationConfigured || emulatorConfigured,
    ledgerEnabled,
    canaryReady: ledgerEnabled && projectConfigured && (federationConfigured || emulatorConfigured),
    retention: 'permanent',
    externalExecution: 'disabled',
  } as const;
}

function immutableEnvelope(kind: 'decision' | 'execution_intent' | 'canary', id: string, actorUid: string, contentHash: string) {
  return {
    evidenceKind: kind,
    evidenceId: id,
    actorUid,
    contentHash,
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    immutable: true,
    retentionClass: 'permanent',
    serverReceivedAt: FieldValue.serverTimestamp(),
  };
}

export async function persistDecisionEvidence(record: AnosaDecisionRecord, request: { forwardedFor?: string | string[]; userAgent?: string }) {
  const database = getAdminFirestore();
  const batch = database.batch();
  batch.create(database.collection('anosaDecisions').doc(record.id), {
    ...record,
    ...immutableEnvelope('decision', record.id, record.actorUid, record.contentHash),
  });
  batch.create(database.collection('auditEvents').doc(), {
    ...immutableEnvelope('decision', record.id, record.actorUid, record.contentHash),
    type: 'anosa.decision.recorded',
    occurredAt: FieldValue.serverTimestamp(),
    metadata: { proposalId: record.proposalId, state: record.state, execution: 'locked' },
    request: { forwardedFor: request.forwardedFor ?? null, userAgent: request.userAgent ?? null },
  });
  await batch.commit();
}

export async function persistIntentEvidence(intent: AnosaExecutionIntent) {
  const database = getAdminFirestore();
  const batch = database.batch();
  batch.create(database.collection('anosaExecutionIntents').doc(intent.id), {
    ...intent,
    ...immutableEnvelope('execution_intent', intent.id, intent.actorUid, intent.contentHash),
  });
  batch.create(database.collection('auditEvents').doc(), {
    ...immutableEnvelope('execution_intent', intent.id, intent.actorUid, intent.contentHash),
    type: 'anosa.execution_intent.simulated',
    occurredAt: FieldValue.serverTimestamp(),
    metadata: { proposalId: intent.proposalId, connector: intent.connector, status: intent.status, externalExecution: 'disabled' },
  });
  await batch.commit();
}

export async function runEvidenceCanary(actorUid: string) {
  const database = getAdminFirestore();
  const id = randomUUID();
  const occurredAt = new Date().toISOString();
  const contentHash = integrityHash({ id, actorUid, occurredAt, purpose: 'phase-3.1-cloud-evidence-canary' });
  const reference = database.collection('anosaEvidenceCanaries').doc(id);
  const auditReference = database.collection('auditEvents').doc();
  const batch = database.batch();
  batch.create(reference, {
    ...immutableEnvelope('canary', id, actorUid, contentHash),
    occurredAt,
    purpose: 'phase-3.1-cloud-evidence-canary',
    externalExecution: 'disabled',
  });
  batch.create(auditReference, {
    ...immutableEnvelope('canary', id, actorUid, contentHash),
    type: 'anosa.evidence.canary.passed',
    occurredAt: FieldValue.serverTimestamp(),
    metadata: { canaryId: id, externalExecution: 'disabled' },
  });
  await batch.commit();
  const stored = await reference.get();
  const data = stored.data();
  const serverReceivedAt = data?.serverReceivedAt instanceof Timestamp ? data.serverReceivedAt.toDate().toISOString() : null;
  if (!stored.exists || data?.contentHash !== contentHash) throw new Error('Evidence canary verification failed.');
  return { id, contentHash, serverReceivedAt, persistence: 'firestore' as const, verified: true as const };
}
