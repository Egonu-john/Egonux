import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { evaluateExecutionPolicy, executionMode, firestoreLedgerEnabled, integrityHash, intentDocumentId, publicExecutionStatus, toExecutionIntent } from '@/lib/anosa/execution';
import { requireAnosaFounder, requireAnosaStepUp, StepUpRequiredError } from '@/lib/anosa/server';
import { anosaLog } from '@/lib/anosa/telemetry';
import type { AnosaExecutionIntent } from '@/lib/anosa/types';
import { AuthenticationError, AuthorizationError } from '@/lib/auth/session';
import { getAdminFirestore } from '@/lib/firebase/admin';

const intentSchema = z.object({
  proposalId: z.string().min(3).max(160),
  title: z.string().min(3).max(160),
  actionType: z.enum(['brief', 'email_draft', 'task_draft', 'github_draft']),
  draftPreview: z.string().min(8).max(8_000),
  decisionHash: z.string().regex(/^[a-f0-9]{64}$/),
  idempotencyKey: z.string().min(12).max(200),
});

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  const startedAt = Date.now();
  response.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(request.method ?? '')) {
    response.setHeader('Allow', 'GET, POST');
    return response.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const principal = request.method === 'POST' ? await requireAnosaStepUp(request) : await requireAnosaFounder(request);
    if (request.method === 'GET') {
      if (!firestoreLedgerEnabled()) {
        return response.status(200).json({ intents: [], ...publicExecutionStatus() });
      }
      try {
        const snapshot = await getAdminFirestore().collection('anosaExecutionIntents')
          .where('actorUid', '==', principal.uid).limit(50).get();
        const intents = snapshot.docs.map((document) => {
          const data = document.data();
          const requestedAt = data.requestedAt instanceof Timestamp ? data.requestedAt.toDate().toISOString() : String(data.requestedAt);
          return { id: document.id, ...data, requestedAt } as AnosaExecutionIntent;
        }).sort((left, right) => right.requestedAt.localeCompare(left.requestedAt));
        return response.status(200).json({ intents, ...publicExecutionStatus() });
      } catch (error) {
        console.warn('ANOSA execution-intent storage unavailable; continuing with device records.', {
          message: error instanceof Error ? error.message : String(error),
        });
        return response.status(200).json({ intents: [], persistence: 'device', ...publicExecutionStatus() });
      }
    }

    if (executionMode() === 'locked') {
      return response.status(423).json({ error: 'ANOSA controlled simulations are paused by the server kill switch.', code: 'EXECUTION_LOCKED' });
    }
    const input = intentSchema.parse(request.body);
    const requestedAt = new Date().toISOString();
    const policy = evaluateExecutionPolicy(input);
    const id = intentDocumentId(principal.uid, input.idempotencyKey);
    const basis = {
      id,
      proposalId: input.proposalId,
      title: input.title,
      actionType: input.actionType,
      connector: policy.connector,
      status: policy.allowed ? 'simulated' as const : 'blocked' as const,
      mode: 'simulation' as const,
      requestedAt,
      actorUid: principal.uid,
      decisionHash: input.decisionHash,
      idempotencyKey: input.idempotencyKey,
      payloadHash: integrityHash(input.draftPreview),
      policy: { allowed: policy.allowed, checks: policy.checks, reason: policy.reason },
      persistence: firestoreLedgerEnabled() ? 'firestore' as const : 'device' as const,
    };
    const intent = toExecutionIntent(basis);

    if (firestoreLedgerEnabled()) {
      try {
        const database = getAdminFirestore();
        const batch = database.batch();
        batch.create(database.collection('anosaExecutionIntents').doc(intent.id), {
          ...intent, serverReceivedAt: FieldValue.serverTimestamp(), immutable: true,
        });
        batch.create(database.collection('auditEvents').doc(), {
          actorUid: principal.uid,
          type: 'anosa.execution_intent.simulated',
          occurredAt: FieldValue.serverTimestamp(),
          metadata: { intentId: intent.id, proposalId: intent.proposalId, connector: intent.connector, status: intent.status, contentHash: intent.contentHash, externalExecution: 'disabled' },
        });
        await batch.commit();
      } catch (error) {
        intent.persistence = 'device';
        console.warn('ANOSA Firestore intent ledger unavailable; returning an integrity-hashed device receipt.', {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }

    anosaLog(request, '/api/anosa/intents', 'simulated', startedAt, { connector: intent.connector, status: intent.status, externalExecution: 'disabled' });
    return response.status(201).json({ intent, ...publicExecutionStatus(), persistence: intent.persistence });
  } catch (error) {
    if (error instanceof z.ZodError) return response.status(400).json({ error: 'Invalid controlled-execution intent.' });
    if (error instanceof AuthenticationError) return response.status(401).json({ error: 'Authentication required.' });
    if (error instanceof AuthorizationError) return response.status(403).json({ error: 'Founder access required.' });
    if (error instanceof StepUpRequiredError) return response.status(428).json({ error: 'Please sign in again before authorizing an execution simulation.', code: 'STEP_UP_REQUIRED' });
    console.error('ANOSA controlled-execution intent failed.', error);
    return response.status(503).json({ error: 'The controlled-execution service is temporarily unavailable. Nothing was executed.' });
  }
}
