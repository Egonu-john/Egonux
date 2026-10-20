// EGONUX OS v3.3 — Controlled Alpha Invitation & Consent Protocol
// Jurisdictional Baseline: Ugandan Data Protection and Privacy Act (2019)

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    const { token, action, participantEmail } = req.body || {};

    if (action === 'dispatch_initial_test') {
      // Gate Check: Restrict initial batch to exactly 2 test recipients
      const initialBatch = [
        { id: 'INV-UG-001', email: participantEmail || 'tester1@egonux.com', status: 'PENDING', expires: '7d' },
        { id: 'INV-UG-002', email: 'tester2@egonux.com', status: 'PENDING', expires: '7d' }
      ];

      return res.status(200).json({
        success: true,
        batchSize: initialBatch.length,
        invitations: initialBatch,
        notice: "Ugandan Data Protection & Privacy Act (2019) consent required upon redemption.",
        timestamp: new Date().toISOString()
      });
    }

    if (action === 'redeem') {
      if (!token) {
        return res.status(400).json({ error: 'INVALID_INVITATION', message: 'Invitation token is required.' });
      }

      // Simulate single-use token redemption & consent capture
      return res.status(200).json({
        success: true,
        redeemedToken: token,
        consentCaptured: true,
        pdpaPrivacyNoticeAccepted: true,
        profileStatus: 'ALPHA_SANDBOX_ACTIVE'
      });
    }

    return res.status(400).json({ error: 'INVALID_ACTION', message: 'Unsupported action requested.' });
  }

  return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'HTTP Method Not Allowed.' });
}
