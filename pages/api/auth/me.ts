import type { NextApiRequest, NextApiResponse } from 'next';
import {
  AuthenticationError,
  AuthorizationError,
  requirePrincipal,
} from '@/lib/auth/session';

export default async function handler(request: NextApiRequest, response: NextApiResponse) {
  response.setHeader('Cache-Control', 'no-store');
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    response.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  try {
    response.status(200).json({ principal: await requirePrincipal(request) });
  } catch (error) {
    const status = error instanceof AuthorizationError ? 403 : 401;
    const message =
      error instanceof AuthenticationError || error instanceof AuthorizationError
        ? error.message
        : 'Authentication failed.';
    response.status(status).json({ error: message });
  }
}
