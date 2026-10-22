import { NextApiRequest, NextApiResponse } from 'next';
import { authenticateRequest } from '../../../lib/auth/rbac';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : (req.cookies?.session || '');
      
    const principal = authenticateRequest(token);
    if (!principal) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    return res.status(200).json({ authorized: true, principal });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unauthorized';
    return res.status(401).json({ error: msg });
  }
}
