import { createHash } from 'node:crypto';
import type { AnosaConnector, AnosaExecutionIntent, AnosaProposal } from '@/lib/anosa/types';

const connectorByAction: Record<NonNullable<AnosaProposal['actionType']>, AnosaConnector> = {
  brief: 'internal',
  email_draft: 'email',
  task_draft: 'task',
  github_draft: 'github',
};

export function executionMode(): 'locked' | 'simulate' {
  return process.env.ANOSA_EXECUTION_MODE === 'locked' ? 'locked' : 'simulate';
}

export function firestoreLedgerEnabled() {
  return process.env.ANOSA_FIRESTORE_LEDGER_ENABLED === 'true';
}

export function connectorFor(actionType: NonNullable<AnosaProposal['actionType']>) {
  return connectorByAction[actionType];
}

export function evaluateExecutionPolicy(input: {
  actionType: NonNullable<AnosaProposal['actionType']>;
  decisionHash: string;
  draftPreview: string;
}) {
  const connector = connectorFor(input.actionType);
  const checks = [
    'founder-session-step-up',
    'approved-decision-linked',
    'exact-draft-present',
    'connector-isolated',
    'external-side-effects-disabled',
  ];
  const evidenceValid = /^[a-f0-9]{64}$/.test(input.decisionHash);
  const draftValid = input.draftPreview.trim().length >= 8;
  const allowed = evidenceValid && draftValid;

  return {
    connector,
    allowed,
    checks,
    reason: allowed
      ? `Policy passed for ${connector} simulation. External execution remains disabled.`
      : 'Policy blocked the intent because approval evidence or an exact draft is missing.',
  };
}

export function integrityHash(value: unknown) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

export function intentDocumentId(actorUid: string, idempotencyKey: string) {
  return integrityHash({ actorUid, idempotencyKey }).slice(0, 40);
}

export function publicExecutionStatus() {
  return {
    phase: 3,
    mode: executionMode(),
    capability: 'policy-checked simulation',
    externalExecution: 'disabled',
    ledger: firestoreLedgerEnabled() ? 'firestore' : 'device',
    connectors: [
      { id: 'internal', status: 'simulation' },
      { id: 'email', status: 'isolated' },
      { id: 'task', status: 'isolated' },
      { id: 'github', status: 'isolated' },
    ],
  } as const;
}

export function toExecutionIntent(input: Omit<AnosaExecutionIntent, 'contentHash'>): AnosaExecutionIntent {
  return { ...input, contentHash: integrityHash(input) };
}
