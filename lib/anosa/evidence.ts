import { randomUUID } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getAdminFirestore } from '@/lib/firebase/admin';
import { firestoreLedgerEnabled, integrityHash } from '@/lib/anosa/execution';
import type { AnosaDecisionRecord, AnosaEvidenceReview, AnosaExecutionIntent } from '@/lib/anosa/types';
import { kmsSigningConfigured, kmsSigningEnabled, signEvidenceHash, verifyEvidenceSignature, type EvidenceKmsSignature } from '@/lib/anosa/kms';

export const EVIDENCE_SCHEMA_VERSION = 3;

export class EvidenceReplayConflictError extends Error {
  constructor() { super('An idempotency key was reused with a different simulation payload.'); }
}

export function evidenceReadiness(runtimeIdentityAvailable = Boolean(process.env.VERCEL_OIDC_TOKEN)) {
  const projectConfigured = Boolean(process.env.GOOGLE_CLOUD_PROJECT ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
  const federationConfigured = Boolean(process.env.GCP_WIF_AUDIENCE && process.env.GCP_SERVICE_ACCOUNT_EMAIL && runtimeIdentityAvailable);
  const emulatorConfigured = Boolean(process.env.FIRESTORE_EMULATOR_HOST);
  const ledgerEnabled = firestoreLedgerEnabled();
  return {
    phase: '3.4',
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    mode: ledgerEnabled ? 'cloud' : 'device',
    projectConfigured,
    identityConfigured: federationConfigured || emulatorConfigured,
    ledgerEnabled,
    canaryReady: ledgerEnabled && projectConfigured && (federationConfigured || emulatorConfigured),
    signingEnabled: kmsSigningEnabled(),
    signingReady: ledgerEnabled && projectConfigured && federationConfigured && kmsSigningConfigured(),
    signatureMode: kmsSigningConfigured() ? 'cloud-kms' : 'unsigned',
    retention: 'permanent',
    externalExecution: 'disabled',
  } as const;
}

function immutableEnvelope(kind: 'decision' | 'execution_intent' | 'canary' | 'review', id: string, actorUid: string, contentHash: string, signature: EvidenceKmsSignature | null) {
  return {
    evidenceKind: kind,
    evidenceId: id,
    actorUid,
    contentHash,
    schemaVersion: signature ? EVIDENCE_SCHEMA_VERSION : 2,
    immutable: true,
    retentionClass: 'permanent',
    ...(signature ? { signature } : {}),
    serverReceivedAt: FieldValue.serverTimestamp(),
  };
}

export async function persistDecisionEvidence(record: AnosaDecisionRecord, request: { forwardedFor?: string | string[]; userAgent?: string }) {
  const signature = await signEvidenceHash(record.contentHash);
  const database = getAdminFirestore();
  const batch = database.batch();
  batch.create(database.collection('anosaDecisions').doc(record.id), {
    ...record,
    ...immutableEnvelope('decision', record.id, record.actorUid, record.contentHash, signature),
  });
  batch.create(database.collection('auditEvents').doc(), {
    ...immutableEnvelope('decision', record.id, record.actorUid, record.contentHash, signature),
    type: 'anosa.decision.recorded',
    occurredAt: FieldValue.serverTimestamp(),
    metadata: { proposalId: record.proposalId, state: record.state, execution: 'locked' },
    request: { forwardedFor: request.forwardedFor ?? null, userAgent: request.userAgent ?? null },
  });
  await batch.commit();
}

export async function persistIntentEvidence(intent: AnosaExecutionIntent) {
  const signature = await signEvidenceHash(intent.contentHash);
  const database = getAdminFirestore();
  const reference = database.collection('anosaExecutionIntents').doc(intent.id);
  return database.runTransaction(async (transaction) => {
    const stored = await transaction.get(reference);
    if (stored.exists) {
      const existing = { id: stored.id, ...stored.data() } as AnosaExecutionIntent;
      const sameRequest = existing.actorUid === intent.actorUid
        && existing.proposalId === intent.proposalId
        && existing.title === intent.title
        && existing.actionType === intent.actionType
        && existing.decisionHash === intent.decisionHash
        && existing.idempotencyKey === intent.idempotencyKey
        && existing.payloadHash === intent.payloadHash;
      if (!sameRequest) throw new EvidenceReplayConflictError();
      return { status: 'replayed' as const, intent: existing };
    }
    transaction.create(reference, {
      ...intent,
      ...immutableEnvelope('execution_intent', intent.id, intent.actorUid, intent.contentHash, signature),
    });
    const auditReference = database.collection('auditEvents').doc();
    transaction.create(auditReference, {
      ...immutableEnvelope('execution_intent', intent.id, intent.actorUid, intent.contentHash, signature),
      type: 'anosa.execution_intent.simulated',
      occurredAt: FieldValue.serverTimestamp(),
      metadata: { proposalId: intent.proposalId, connector: intent.connector, status: intent.status, externalExecution: 'disabled' },
    });
    return { status: 'created' as const, intent };
  });
}

export async function persistEvidenceReview(review: AnosaEvidenceReview) {
  const signature = await signEvidenceHash(review.contentHash);
  const database = getAdminFirestore();
  const batch = database.batch();
  batch.create(database.collection('anosaEvidenceReviews').doc(review.id), {
    ...review,
    ...immutableEnvelope('review', review.id, review.reviewerUid, review.contentHash, signature),
  });
  batch.create(database.collection('auditEvents').doc(), {
    ...immutableEnvelope('review', review.id, review.reviewerUid, review.contentHash, signature),
    type: 'anosa.evidence.reviewed',
    occurredAt: FieldValue.serverTimestamp(),
    metadata: { evidenceKind: review.evidenceKind, evidenceId: review.evidenceId, state: review.state, externalExecution: 'disabled' },
  });
  await batch.commit();
}

export async function runEvidenceCanary(actorUid: string) {
  const database = getAdminFirestore();
  const id = randomUUID();
  const occurredAt = new Date().toISOString();
  const contentHash = integrityHash({ id, actorUid, occurredAt, purpose: 'phase-3.1-cloud-evidence-canary' });
  const signature = await signEvidenceHash(contentHash);
  const reference = database.collection('anosaEvidenceCanaries').doc(id);
  const auditReference = database.collection('auditEvents').doc();
  const batch = database.batch();
  batch.create(reference, {
    ...immutableEnvelope('canary', id, actorUid, contentHash, signature),
    occurredAt,
    purpose: 'phase-3.1-cloud-evidence-canary',
    externalExecution: 'disabled',
  });
  batch.create(auditReference, {
    ...immutableEnvelope('canary', id, actorUid, contentHash, signature),
    type: 'anosa.evidence.canary.passed',
    occurredAt: FieldValue.serverTimestamp(),
    metadata: { canaryId: id, externalExecution: 'disabled' },
  });
  await batch.commit();
  const stored = await reference.get();
  const data = stored.data();
  const serverReceivedAt = data?.serverReceivedAt instanceof Timestamp ? data.serverReceivedAt.toDate().toISOString() : null;
  if (!stored.exists || data?.contentHash !== contentHash) throw new Error('Evidence canary verification failed.');
  const signatureVerified = signature ? await verifyEvidenceSignature(contentHash, data?.signature) : false;
  if (kmsSigningEnabled() && !signatureVerified) throw new Error('Evidence KMS signature verification failed.');
  return { id, contentHash, serverReceivedAt, persistence: 'firestore' as const, verified: true as const, signed: Boolean(signature), signatureVerified, signatureMode: signature ? 'cloud-kms' as const : 'unsigned' as const };
}
