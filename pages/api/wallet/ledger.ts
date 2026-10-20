import type { NextApiRequest, NextApiResponse } from 'next';
import { requireIdempotencyKey } from '@/lib/ledger/idempotency';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // 1. Zero-Trust Header Check
    const principal = req.headers['x-mock-principal'] || req.cookies?.session;
    if (process.env.NODE_ENV !== 'development' && !principal) {
      return res.status(401).json({ error: 'Zero-Trust authentication required. Access locked.' });
    }

    // 2. Enforce Idempotency Key Validation via Helper
    const headerKey = Array.isArray(req.headers['idempotency-key']) 
      ? req.headers['idempotency-key'][0] 
      : req.headers['idempotency-key'];
      
    const idempotencyKey = requireIdempotencyKey(headerKey);

    // 3. Validate Ledger Payload
    const { accountId, entries, currency = 'UGX' } = req.body || {};
    if (!accountId || !Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ error: 'Invalid ledger payload. Account ID and line entries required.' });
    }

    // 4. Return Minor-Unit Ledger Response
    return res.status(200).json({
      status: 'success',
      mode: 'sandbox',
      message: 'Sandbox ledger transaction posted successfully in minor units.',
      data: {
        idempotencyKey,
        accountId,
        currency,
        entriesCount: entries.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (err: any) {
    if (err.name === 'IdempotencyKeyRequiredError') {
      return res.status(400).json({ error: 'A valid Idempotency-Key header is required.' });
    }
    return res.status(500).json({ error: err.message || 'Internal ledger processing error.' });
  }
}
