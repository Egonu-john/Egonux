import type { AnosaSource } from '@/lib/anosa/sources';

export type AnosaRisk = 'Low' | 'Medium' | 'High';
export type AnosaDecisionState = 'approved' | 'rejected' | 'changes_requested';

export interface AnosaProposal {
  id: string;
  title: string;
  purpose: string;
  detail: string;
  impact: string;
  risk: AnosaRisk;
  executionBoundary: string;
  sourceIds: string[];
  createdAt: string;
  state: 'pending' | AnosaDecisionState;
  actionType?: 'brief' | 'email_draft' | 'task_draft' | 'github_draft';
  draftPreview?: string;
}

export interface AnosaAnswer {
  answer: string;
  confidence: 'grounded' | 'limited';
  engine: 'ai-gateway' | 'grounded-fallback';
  sources: AnosaSource[];
  proposals: AnosaProposal[];
  generatedAt: string;
}

export interface AnosaDecisionRecord {
  id: string;
  proposalId: string;
  title: string;
  state: AnosaDecisionState;
  recordedAt: string;
  actorUid: string;
  contentHash: string;
  actionType?: NonNullable<AnosaProposal['actionType']>;
  payloadHash?: string;
  persistence?: 'firestore' | 'device';
}

export type AnosaConnector = 'internal' | 'email' | 'task' | 'github';
export type AnosaExecutionStatus = 'simulated' | 'blocked';

export interface AnosaExecutionIntent {
  id: string;
  proposalId: string;
  title: string;
  actionType: NonNullable<AnosaProposal['actionType']>;
  connector: AnosaConnector;
  status: AnosaExecutionStatus;
  mode: 'simulation';
  requestedAt: string;
  actorUid: string;
  decisionHash: string;
  idempotencyKey: string;
  payloadHash: string;
  contentHash: string;
  policy: {
    allowed: boolean;
    checks: string[];
    reason: string;
  };
  persistence?: 'firestore' | 'device';
}

export interface AnosaAuditEvent {
  id: string;
  evidenceKind: 'decision' | 'execution_intent' | 'canary' | 'controlled_test';
  evidenceId: string;
  type: string;
  occurredAt: string;
  contentHash: string;
  schemaVersion: 1 | 2 | 3;
  signatureVerified: boolean;
  verified: boolean;
}

export interface AnosaEvidenceVerification {
  phase: '3.4';
  status: 'verified' | 'attention' | 'unavailable';
  checkedAt: string;
  checkedRecords: number;
  verifiedRecords: number;
  brokenRecords: number;
  signedRecords: number;
  auditEvents: AnosaAuditEvent[];
  externalExecution: 'disabled';
}

export type AnosaReviewState = 'approved' | 'rejected' | 'escalated';
export type AnosaReviewEvidenceKind = 'decision' | 'execution_intent' | 'controlled_test';

export interface AnosaEvidenceReview {
  id: string;
  evidenceKind: AnosaReviewEvidenceKind;
  evidenceId: string;
  state: AnosaReviewState;
  reason: string;
  reviewedAt: string;
  reviewerUid: string;
  contentHash: string;
  externalExecution: 'disabled';
  requestId: string;
  previousReviewId?: string;
  persistence?: 'firestore' | 'device';
}

export interface AnosaReviewIntegrity {
  phase: '3.7';
  status: 'verified' | 'attention' | 'unavailable';
  checkedAt: string;
  checkedReceipts: number;
  verifiedReceipts: number;
  brokenReceipts: number;
  currentStates: number;
  verifiedStates: number;
  externalExecution: 'disabled';
}

export interface AnosaIntegrityIncident {
  id: string;
  fingerprint: string;
  severity: 'high' | 'medium';
  status: 'open';
  detectedAt: string;
  actorUid: string;
  brokenReceipts: number;
  mismatchedStates: number;
  checkedReceipts: number;
  currentStates: number;
  contentHash: string;
  immutable: true;
  externalExecution: 'disabled';
}
