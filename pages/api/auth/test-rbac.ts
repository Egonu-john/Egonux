import { NextApiRequest, NextApiResponse } from 'next';
import { verifyRole } from '../../lib/auth/rbac';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const principal = await verifyRole(req, ['ADMIN', 'FOUNDER']);
    return res.status(200).json({ authorized: true, uid: principal.uid, roles: principal.roles });
  } catch (error: any) {
    const msg = error?.message || 'Unauthorized';
    return res.status(401).json({ error: msg });
  }
}
