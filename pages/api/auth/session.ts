import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminAuth } from '@/lib/firebase/admin';
import {
  requirePrincipal,
  sessionDurationMs,
  setSessionCookie,
} from '@/lib/auth/session';
import { appendAuditEvent } from '@/lib/server/audit';
import { InvalidOriginError, requireSameOrigin } from '@/lib/server/origin';

const RECENT_SIGN_IN_SECONDS = 5 * 60;

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');

  if (request.method === 'POST') {
    try {
      requireSameOrigin(request);
    } catch (error) {
      const message = error instanceof InvalidOriginError ? error.message : 'Request rejected.';
      response.status(403).json({ error: message });
      return;
    }
    const idToken = typeof request.body?.idToken === 'string' ? request.body.idToken : '';
    if (!idToken) {
      response.status(400).json({ error: 'A Firebase ID token is required.' });
      return;
    }

    try {
      const decoded = await getAdminAuth().verifyIdToken(idToken, true);
      if (Date.now() / 1000 - decoded.auth_time > RECENT_SIGN_IN_SECONDS) {
        response.status(401).json({ error: 'Recent sign-in required.' });
        return;
      }

      const duration = sessionDurationMs();
      const session = await getAdminAuth().createSessionCookie(idToken, { expiresIn: duration });
      await appendAuditEvent(request, {
        actorUid: decoded.uid,
        subjectUid: decoded.uid,
        type: 'auth.session.created',
      });
      setSessionCookie(response, session, duration / 1000);
      response.status(201).json({ authenticated: true, expiresIn: duration });
    } catch {
      response.status(401).json({ error: 'Unable to establish a secure session.' });
    }
    return;
  }

  if (request.method === 'DELETE') {
    try {
      requireSameOrigin(request);
    } catch (error) {
      const message = error instanceof InvalidOriginError ? error.message : 'Request rejected.';
      response.status(403).json({ error: message });
      return;
    }
    try {
      const principal = await requirePrincipal(request);
      await appendAuditEvent(request, {
        actorUid: principal.uid,
        subjectUid: principal.uid,
        type: 'auth.session.deleted',
      });
    } catch {
      // Clearing a missing or expired cookie is intentionally idempotent.
    }
    setSessionCookie(response, '', 0);
    response.status(204).end();
    return;
  }

  response.setHeader('Allow', 'POST, DELETE');
  response.status(405).json({ error: 'Method not allowed.' });
}
