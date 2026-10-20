// EGONUX OS v3.3 — Controlled Alpha Invitation & Consent Protocol
// Jurisdictional Baseline: Ugandan Data Protection and Privacy Act (2019)

const inMemoryTokenStore = new Map([
  ['INV-UG-001', { id: 'INV-UG-001', emailHash: 'anon_tester_001', status: 'PENDING', expiresAt: Date.now() + 7 * 86400 * 1000, used: false }],
  ['INV-UG-002', { id: 'INV-UG-002', emailHash: 'anon_tester_002', status: 'PENDING', expiresAt: Date.now() + 7 * 86400 * 1000, used: false }],
  ['INV-UG-EXPIRED', { id: 'INV-UG-EXPIRED', emailHash: 'anon_tester_exp', status: 'PENDING', expiresAt: Date.now() - 1000, used: false }],
  ['INV-UG-REVOKED', { id: 'INV-UG-REVOKED', emailHash: 'anon_tester_rev', status: 'REVOKED', expiresAt: Date.now() + 7 * 86400 * 1000, used: false }]
]);

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    const { token, action, consentAccepted, participantId } = req.body || {};

    if (action === 'dispatch_initial_test') {
      const initialBatch = [
        { id: 'INV-UG-001', participantId: 'PARTICIPANT_UG_001', status: 'PENDING', expires: '7d' },
        { id: 'INV-UG-002', participantId: 'PARTICIPANT_UG_002', status: 'PENDING', expires: '7d' }
      ];

      return res.status(200).json({
        success: true,
        batchSize: initialBatch.length,
        invitations: initialBatch,
        notice: "Ugandan Data Protection & Privacy Act (2019) consent required upon redemption.",
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'revoke') {
      if (!token || !inMemoryTokenStore.has(token)) {
        return res.status(404).json({ error: 'TOKEN_NOT_FOUND', message: 'Token not found.' });
      }
      const item = inMemoryTokenStore.get(token);
      item.status = 'REVOKED';
      inMemoryTokenStore.set(token, item);
      return res.status(200).json({ success: true, token, status: 'REVOKED' });
    }

    if (action === 'redeem') {
      if (!token) {
        return res.status(400).json({ error: 'INVALID_INVITATION', message: 'Invitation token is required.' });
      }

      const tokenData = inMemoryTokenStore.get(token);

      if (!tokenData) {
        return res.status(404).json({ error: 'TOKEN_NOT_FOUND', message: 'Token does not exist.' });
      }

      if (tokenData.status === 'REVOKED') {
        return res.status(403).json({ error: 'TOKEN_REVOKED', message: 'This invitation token has been revoked.' });
      }

      if (tokenData.expiresAt < Date.now()) {
        return res.status(400).json({ error: 'TOKEN_EXPIRED', message: 'This invitation token has expired.' });
      }

      if (tokenData.used) {
        return res.status(400).json({ error: 'TOKEN_ALREADY_USED', message: 'This invitation token has already been redeemed.' });
      }

      if (!consentAccepted) {
        return res.status(400).json({ error: 'CONSENT_REQUIRED', message: 'Explicit consent under PDPA 2019 is required.' });
      }

      // Mark token as consumed
      tokenData.used = true;
      tokenData.status = 'REDEEMED';
      inMemoryTokenStore.set(token, tokenData);

      return res.status(200).json({
        success: true,
        redeemedToken: token,
        participantId: participantId || 'PARTICIPANT_UG_001',
        consentCaptured: true,
        pdpaPrivacyNoticeAccepted: true,
        profileStatus: 'ALPHA_SANDBOX_ACTIVE'
      });
    }

    return res.status(400).json({ error: 'INVALID_ACTION', message: 'Unsupported action requested.' });
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'HTTP Method Not Allowed.' });
}
