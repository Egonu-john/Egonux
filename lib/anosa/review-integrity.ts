import { integrityHash } from '@/lib/anosa/execution';
import type { AnosaEvidenceReview, AnosaReviewIntegrity } from '@/lib/anosa/types';

const HASH_PATTERN = /^[a-f0-9]{64}$/;

type StoredDocument = { id: string; data: FirebaseFirestore.DocumentData };

function validReceiptEnvelope(document: StoredDocument, reviewerUid: string, targetKind: unknown, targetId: unknown) {
  const data = document.data;
  const basis = {
    evidenceKind: targetKind,
    evidenceId: targetId,
    state: data.state,
    reason: data.reason,
    requestId: data.requestId,
    reviewedAt: data.reviewedAt,
    reviewerUid: data.reviewerUid,
    externalExecution: data.externalExecution,
  };
  return document.id === integrityHash({ reviewerUid, requestId: data.requestId })
    && data.reviewerUid === reviewerUid
    && data.actorUid === reviewerUid
    && data.evidenceId === document.id
    && data.evidenceKind === 'review'
    && data.immutable === true
    && data.retentionClass === 'permanent'
    && data.externalExecution === 'disabled'
    && HASH_PATTERN.test(String(data.contentHash ?? ''))
    && data.contentHash === integrityHash(basis);
}

export function verifyReviewIntegrity(input: {
  reviewerUid: string;
  reviews: StoredDocument[];
  states: StoredDocument[];
  audits: StoredDocument[];
  checkedAt: string;
}): AnosaReviewIntegrity {
  const reviewsById = new Map(input.reviews.map((review) => [review.id, review]));
  const auditByReceipt = new Map(input.audits.filter((audit) => {
    const data = audit.data;
    return data.type === 'anosa.evidence.reviewed'
      && data.actorUid === input.reviewerUid
      && data.evidenceKind === 'review'
      && data.immutable === true
      && data.retentionClass === 'permanent';
  }).map((audit) => [String(audit.data.evidenceId), audit]));

  let verifiedReceipts = 0;
  for (const receipt of input.reviews) {
    const data = receipt.data as AnosaEvidenceReview & FirebaseFirestore.DocumentData;
    const audit = auditByReceipt.get(receipt.id);
    const targetKind = data.targetEvidenceKind ?? audit?.data.metadata?.evidenceKind;
    const targetId = data.targetEvidenceId ?? audit?.data.metadata?.evidenceId;
    const previous = data.previousReviewId ? reviewsById.get(data.previousReviewId) : undefined;
    const validTransition = !data.previousReviewId || Boolean(previous
      && previous.data.reviewerUid === input.reviewerUid
      && (previous.data.targetEvidenceKind ?? targetKind) === targetKind
      && (previous.data.targetEvidenceId ?? targetId) === targetId
      && previous.data.state === 'escalated'
      && (data.state === 'approved' || data.state === 'rejected'));
    if (validReceiptEnvelope(receipt, input.reviewerUid, targetKind, targetId)
      && validTransition
      && audit?.data.contentHash === data.contentHash) verifiedReceipts += 1;
  }

  let verifiedStates = 0;
  for (const state of input.states) {
    const data = state.data;
    const receipt = reviewsById.get(String(data.reviewId ?? ''));
    const receiptAudit = receipt ? auditByReceipt.get(receipt.id) : undefined;
    const receiptTargetKind = receipt?.data.targetEvidenceKind ?? receiptAudit?.data.metadata?.evidenceKind;
    const receiptTargetId = receipt?.data.targetEvidenceId ?? receiptAudit?.data.metadata?.evidenceId;
    const expectedId = integrityHash({ reviewerUid: input.reviewerUid, evidenceKind: data.evidenceKind, evidenceId: data.evidenceId });
    if (state.id === expectedId
      && data.reviewerUid === input.reviewerUid
      && data.externalExecution === 'disabled'
      && receipt
      && receiptTargetKind === data.evidenceKind
      && receiptTargetId === data.evidenceId
      && receipt.data.state === data.state) verifiedStates += 1;
  }

  const brokenReceipts = input.reviews.length - verifiedReceipts;
  const stateMismatch = input.states.length - verifiedStates;
  return {
    phase: '3.7',
    status: brokenReceipts === 0 && stateMismatch === 0 ? 'verified' : 'attention',
    checkedAt: input.checkedAt,
    checkedReceipts: input.reviews.length,
    verifiedReceipts,
    brokenReceipts,
    currentStates: input.states.length,
    verifiedStates,
    externalExecution: 'disabled',
  };
}
