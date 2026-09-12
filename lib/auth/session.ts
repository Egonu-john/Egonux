import type { DecodedIdToken } from 'firebase-admin/auth';
import type { NextApiResponse } from 'next';
import type { IncomingHttpHeaders } from 'node:http';
import { getAdminAuth } from '@/lib/firebase/admin';
import { parseRoles } from '@/lib/auth/roles';
import type { AuthenticatedPrincipal, EgonuxRole } from '@/types/backend';

const DEFAULT_COOKIE_NAME = 'egonux_session';
const DEFAULT_TTL_DAYS = 5;

export class AuthenticationError extends Error {}
export class AuthorizationError extends Error {}

export function sessionCookieName() {
  return process.env.EGONUX_SESSION_COOKIE_NAME || DEFAULT_COOKIE_NAME;
}

export function sessionDurationMs() {
  const days = Number(process.env.EGONUX_SESSION_TTL_DAYS || DEFAULT_TTL_DAYS);
  if (!Number.isInteger(days) || days < 1 || days > 14) {
    throw new Error('EGONUX_SESSION_TTL_DAYS must be an integer from 1 to 14.');
  }
  return days * 24 * 60 * 60 * 1000;
}

interface RequestWithHeaders {
  headers: IncomingHttpHeaders;
}

export function readCookie(request: RequestWithHeaders, name: string) {
  return request.headers.cookie
    ?.split(';')
    .map((part) => part.trim().split('='))
    .find(([key]) => key === name)
    ?.slice(1)
    .join('=');
}

export function setSessionCookie(
  response: NextApiResponse,
  value: string,
  maxAgeSeconds: number,
) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  response.setHeader(
    'Set-Cookie',
    `${sessionCookieName()}=${value}; Max-Age=${maxAgeSeconds}; Path=/; HttpOnly; SameSite=Lax${secure}`,
  );
}

function toPrincipal(token: DecodedIdToken): AuthenticatedPrincipal {
  return {
    uid: token.uid,
    email: token.email ?? null,
    emailVerified: token.email_verified ?? false,
    roles: parseRoles(token.roles),
    sessionIssuedAt: token.iat,
  };
}

export async function requirePrincipal(
  request: RequestWithHeaders,
  requiredRoles: readonly EgonuxRole[] = [],
) {
  const cookie = readCookie(request, sessionCookieName());
  if (!cookie) throw new AuthenticationError('Authentication required.');

  try {
    const token = await getAdminAuth().verifySessionCookie(cookie, true);
    const principal = toPrincipal(token);
    if (requiredRoles.length && !requiredRoles.some((role) => principal.roles.includes(role))) {
      throw new AuthorizationError('Insufficient permissions.');
    }
    return principal;
  } catch (error) {
    if (error instanceof AuthorizationError) throw error;
    throw new AuthenticationError('Session is invalid or expired.');
  }
}
