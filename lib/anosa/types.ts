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
  persistence?: 'firestore' | 'device';
}
