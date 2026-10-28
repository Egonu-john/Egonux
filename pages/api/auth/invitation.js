// EGONUX controlled invitation lifecycle.
// Invitation records contain only SHA-256 token hashes. Raw tokens are returned
// only once, from the authenticated dispatch action.
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { AuthenticationError, AuthorizationError, requirePrincipal } from '@/lib/auth/session';
import { getAdminFirestore, withVercelOidcToken } from '@/lib/firebase/admin';
import { InvalidOriginError, requireSameOrigin } from '@/lib/server/origin';

const INVITATIONS = 'invitations';
const CONSENT_EVIDENCE = 'invitationConsentEvidence';
const AUDIT_EVENTS = 'auditEvents';
const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const NOTICE_VERSION = 'EGONUX-PDPA-2019-v1';
const MAX_DISPATCH_BATCH = 2;
const PRIVILEGED_ROLES = ['founder', 'admin'];

function hashToken(token) {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function newToken() {
  return randomBytes(32).toString('base64url');
}

function sendError(response, status, error, message) {
  return response.status(status).json({ error, message });
}

async function dispatch(request, response) {
  const principal = await requirePrincipal(request, PRIVILEGED_ROLES);
  const requestedCount = request.body?.count === undefined ? MAX_DISPATCH_BATCH : request.body.count;
  if (!Number.isInteger(requestedCount) || requestedCount < 1 || requestedCount > MAX_DISPATCH_BATCH) {
    return sendError(response, 400, 'INVALID_BATCH_SIZE', 'Batch count must be between 1 and 2.');
  }

  const firestore = getAdminFirestore();
  const invitations = [];
  const batch = firestore.batch();
  const now = Date.now();

  for (let index = 0; index < requestedCount; index += 1) {
    const token = newToken();
    const tokenHash = hashToken(token);
    const invitationId = randomUUID();
    const participantId = randomUUID();
    const expiresAt = Timestamp.fromMillis(now + INVITATION_TTL_MS);
    const record = {
      invitationId,
      participantId,
      status: 'PENDING',
      tokenHash,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: principal.uid,
      expiresAt,
      redeemedAt: null,
      revokedAt: null,
    };
    batch.create(firestore.collection(INVITATIONS).doc(tokenHash), record);
    invitations.push({ invitationId, participantId, token, expiresAt: expiresAt.toDate().toISOString() });
  }

  const auditRef = firestore.collection(AUDIT_EVENTS).doc(randomUUID());
  batch.create(auditRef, {
    eventId: auditRef.id,
    type: 'invitation.batch_dispatched',
    actorUid: principal.uid,
    occurredAt: FieldValue.serverTimestamp(),
    metadata: { count: requestedCount },
  });
  await batch.commit();

  // Raw bearer tokens are intentionally exposed only at this authorized boundary.
  return response.status(201).json({
    success: true,
    batchSize: invitations.length,
    invitations,
    noticeVersion: NOTICE_VERSION,
  });
}

async function revoke(request, response) {
  const principal = await requirePrincipal(request, PRIVILEGED_ROLES);
  const token = typeof request.body?.token === 'string' ? request.body.token.trim() : '';
  if (!token || token.length > 512) {
    return sendError(response, 400, 'INVALID_INVITATION', 'A valid invitation token is required.');
  }

  const firestore = getAdminFirestore();
  const tokenHash = hashToken(token);
  const invitationRef = firestore.collection(INVITATIONS).doc(tokenHash);
  const auditRef = firestore.collection(AUDIT_EVENTS).doc(randomUUID());

  const outcome = await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(invitationRef);
    if (!snapshot.exists) return 'NOT_FOUND';
    const invitation = snapshot.data();
    if (invitation.status === 'REDEEMED') return 'ALREADY_REDEEMED';
    if (invitation.status === 'REVOKED') return 'REVOKED';

    transaction.update(invitationRef, {
      status: 'REVOKED',
      revokedAt: FieldValue.serverTimestamp(),
      revokedBy: principal.uid,
    });
    transaction.create(auditRef, {
      eventId: auditRef.id,
      type: 'invitation.revoked',
      actorUid: principal.uid,
      subjectId: invitation.invitationId,
      occurredAt: FieldValue.serverTimestamp(),
    });
    return 'UPDATED';
  });

  if (outcome === 'NOT_FOUND') return sendError(response, 404, 'TOKEN_NOT_FOUND', 'Invitation not found.');
  if (outcome === 'ALREADY_REDEEMED') return sendError(response, 409, 'TOKEN_ALREADY_USED', 'A redeemed invitation cannot be revoked.');
  return response.status(200).json({ success: true, status: 'REVOKED' });
}

async function redeem(request, response) {
  const token = typeof request.body?.token === 'string' ? request.body.token.trim() : '';
  const consentAccepted = request.body?.consentAccepted;
  const noticeVersion = typeof request.body?.noticeVersion === 'string' ? request.body.noticeVersion.trim() : '';

  if (!token || token.length > 512) {
    return sendError(response, 400, 'INVALID_INVITATION', 'A valid invitation token is required.');
  }
  if (consentAccepted !== true || noticeVersion !== NOTICE_VERSION) {
    return sendError(response, 400, 'CONSENT_REQUIRED', 'Explicit consent to the current privacy notice is required.');
  }

  const firestore = getAdminFirestore();
  const tokenHash = hashToken(token);
  const invitationRef = firestore.collection(INVITATIONS).doc(tokenHash);
  const consentRef = firestore.collection(CONSENT_EVIDENCE).doc(randomUUID());
  const eventRef = firestore.collection(AUDIT_EVENTS).doc(randomUUID());

  const outcome = await firestore.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(invitationRef);
    if (!snapshot.exists) return { error: 'TOKEN_NOT_FOUND' };
    const invitation = snapshot.data();
    if (invitation.status === 'REVOKED') return { error: 'TOKEN_REVOKED' };
    if (invitation.status === 'REDEEMED') return { error: 'TOKEN_ALREADY_USED' };

    const expiresAt = invitation.expiresAt;
    const expiryMs = expiresAt instanceof Timestamp
      ? expiresAt.toMillis()
      : expiresAt instanceof Date
        ? expiresAt.getTime()
        : Number.NaN;
    if (!Number.isFinite(expiryMs) || expiryMs <= Date.now()) return { error: 'TOKEN_EXPIRED' };
    if (typeof invitation.participantId !== 'string' || !invitation.participantId) {
      return { error: 'INVITATION_INVALID' };
    }

    transaction.update(invitationRef, {
      status: 'REDEEMED',
      redeemedAt: FieldValue.serverTimestamp(),
      redeemedByParticipant: invitation.participantId,
    });
    transaction.create(consentRef, {
      eventId: consentRef.id,
      invitationId: invitation.invitationId,
      participantId: invitation.participantId,
      noticeVersion: NOTICE_VERSION,
      purpose: 'invitation_redemption',
      granted: true,
      source: 'invitation_redemption',
      occurredAt: FieldValue.serverTimestamp(),
    });
    transaction.create(eventRef, {
      eventId: eventRef.id,
      type: 'invitation.redeemed',
      subjectId: invitation.invitationId,
      participantId: invitation.participantId,
      occurredAt: FieldValue.serverTimestamp(),
      metadata: { consentEventId: consentRef.id, noticeVersion: NOTICE_VERSION },
    });
    return { invitationId: invitation.invitationId, participantId: invitation.participantId, consentEventId: consentRef.id };
  });

  if ('error' in outcome) {
    if (outcome.error === 'TOKEN_NOT_FOUND') return sendError(response, 404, outcome.error, 'Invitation not found.');
    if (outcome.error === 'TOKEN_REVOKED') return sendError(response, 403, outcome.error, 'Invitation has been revoked.');
    if (outcome.error === 'TOKEN_ALREADY_USED') return sendError(response, 409, outcome.error, 'Invitation has already been redeemed.');
    if (outcome.error === 'TOKEN_EXPIRED') return sendError(response, 410, outcome.error, 'Invitation has expired.');
    return sendError(response, 400, outcome.error, 'Invitation record is invalid.');
  }

  return response.status(200).json({
    success: true,
    invitationId: outcome.invitationId,
    participantId: outcome.participantId,
    consent: { captured: true, eventId: outcome.consentEventId, noticeVersion: NOTICE_VERSION },
    profileStatus: 'ALPHA_SANDBOX_ACTIVE',
  });
}

async function handleRequest(request, response) {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('Pragma', 'no-cache');

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return sendError(response, 405, 'METHOD_NOT_ALLOWED', 'HTTP method not allowed.');
  }

  try {
    requireSameOrigin(request);
    const action = typeof request.body?.action === 'string' ? request.body.action : '';
    if (action === 'dispatch_initial_test') return await dispatch(request, response);
    if (action === 'revoke') return await revoke(request, response);
    if (action === 'redeem') return await redeem(request, response);
    return sendError(response, 400, 'INVALID_ACTION', 'Unsupported invitation action.');
  } catch (error) {
    if (error instanceof AuthenticationError) return sendError(response, 401, 'UNAUTHENTICATED', 'Authentication required.');
    if (error instanceof AuthorizationError) return sendError(response, 403, 'FORBIDDEN', 'Insufficient permissions.');
    if (error instanceof InvalidOriginError) return sendError(response, 403, 'INVALID_ORIGIN', 'Request origin is not allowed.');
    return sendError(response, 500, 'INVITATION_SERVICE_ERROR', 'Unable to process invitation request.');
  }
}

export default function handler(request, response) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
