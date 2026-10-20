/**
 * ANOSA decision state machine.
 *
 * This is a pure policy module. Persist transitions together with a trusted
 * auditEvents record in one Firestore transaction at the API/service boundary.
 */
export type AnosaDecisionWorkflowState =
  | 'proposed'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'changes_requested';

export type AnosaDecisionAction =
  | 'submit_for_review'
  | 'approve'
  | 'reject'
  | 'request_changes';

export interface DecisionTransition {
  from: AnosaDecisionWorkflowState;
  action: AnosaDecisionAction;
  to: AnosaDecisionWorkflowState;
  auditEventId: string;
  actorUid: string;
  rationale: string;
}

export class DecisionTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecisionTransitionError';
  }
}

const TRANSITIONS: Record<AnosaDecisionWorkflowState, Partial<Record<AnosaDecisionAction, AnosaDecisionWorkflowState>>> = {
  proposed: { submit_for_review: 'under_review' },
  under_review: {
    approve: 'approved',
    reject: 'rejected',
    request_changes: 'changes_requested',
  },
  approved: {},
  rejected: {},
  changes_requested: { submit_for_review: 'under_review' },
};

export function validateDecisionTransition(input: DecisionTransition) {
  if (!input.actorUid.trim() || input.actorUid.length > 128) {
    throw new DecisionTransitionError('A valid actorUid is required.');
  }
  if (!input.auditEventId.trim() || input.auditEventId.length > 200) {
    throw new DecisionTransitionError('A trusted auditEvents reference is required for every transition.');
  }
  if (!input.rationale.trim() || input.rationale.length > 2_000) {
    throw new DecisionTransitionError('A transition rationale between 1 and 2000 characters is required.');
  }

  const expected = TRANSITIONS[input.from][input.action];
  if (!expected) {
    throw new DecisionTransitionError(`Action ${input.action} is not permitted from state ${input.from}.`);
  }
  if (expected !== input.to) {
    throw new DecisionTransitionError(`Invalid transition target: expected ${expected}.`);
  }

  return {
    from: input.from,
    to: input.to,
    action: input.action,
    actorUid: input.actorUid,
    auditEventId: input.auditEventId,
    rationale: input.rationale.trim(),
  } as const;
}
