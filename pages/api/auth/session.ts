import type { NextApiRequest, NextApiResponse } from 'next';
import { getAdminAuth, withVercelOidcToken } from '@/lib/firebase/admin';
import {
  requirePrincipal,
  setSessionCookie,
} from '@/lib/auth/session';
import { appendAuditEvent } from '@/lib/server/audit';
import { InvalidOriginError, requireSameOrigin } from '@/lib/server/origin';

const RECENT_SIGN_IN_SECONDS = 5 * 60;

async function handleRequest(request: NextApiRequest, response: NextApiResponse) {
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

    let stage = 'verify-id-token';
    try {
      // Sandbox deployments do not hold a Google service-account key. Verify
      // the signed Firebase ID token locally and keep the cookie bounded by the
      // token's own one-hour expiry instead of minting a long-lived session.
      const decoded = await getAdminAuth().verifyIdToken(idToken);
      if (Date.now() / 1000 - decoded.auth_time > RECENT_SIGN_IN_SECONDS) {
        response.status(401).json({ error: 'Recent sign-in required.' });
        return;
      }

      const duration = Math.max(0, decoded.exp * 1000 - Date.now());
      if (duration < 1_000) {
        response.status(401).json({ error: 'Firebase ID token is expired.' });
        return;
      }

      setSessionCookie(response, idToken, Math.floor(duration / 1000));
      stage = 'write-audit-event';
      try {
        await appendAuditEvent(request, {
          actorUid: decoded.uid,
          subjectUid: decoded.uid,
          type: 'auth.session.created',
        });
      } catch (error) {
        console.warn('[api/auth/session] audit deferred', {
          message: error instanceof Error ? error.message : String(error),
        });
      }
      response.status(201).json({ authenticated: true, expiresIn: duration });
    } catch (error) {
      const firebaseError = error as { code?: unknown; message?: unknown; name?: unknown };
      console.error('[api/auth/session] failed', {
        stage,
        code: typeof firebaseError.code === 'string' ? firebaseError.code : undefined,
        name: typeof firebaseError.name === 'string' ? firebaseError.name : undefined,
        message: typeof firebaseError.message === 'string' ? firebaseError.message : String(error),
      });
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

export default function handler(request: NextApiRequest, response: NextApiResponse) {
  return withVercelOidcToken(request.headers['x-vercel-oidc-token'], () => handleRequest(request, response));
}
