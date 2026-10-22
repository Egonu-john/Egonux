import type { NextApiRequest, NextApiResponse } from 'next';
import {
  AuthenticationError,
  AuthorizationError,
  requirePrincipal,
} from '@/lib/auth/session';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    const principal = await requirePrincipal(req, ['admin', 'founder']);
    return res.status(200).json({
      authorized: true,
      uid: principal.uid,
      roles: principal.roles,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return res.status(403).json({ error: 'Insufficient permissions.' });
    }
    if (error instanceof AuthenticationError) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    return res.status(500).json({ error: 'Unable to verify authorization.' });
  }
}
