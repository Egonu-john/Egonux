import React, { useState } from 'react';

interface LedgerResponse {
  status: string;
  mode: string;
  message: string;
  data: {
    idempotencyKey: string;
    accountId: string;
    currency: string;
    entriesCount: number;
    timestamp: string;
  };
}

export const WalletLedgerView: React.FC = () => {
  const [accountId, setAccountId] = useState('acc_egonux_sandbox_01');
  const [amountUGX, setAmountUGX] = useState('10000');
  const [idempotencyKey, setIdempotencyKey] = useState(() => 'key_' + Date.now());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LedgerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePostTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const amountMinor = parseInt(amountUGX, 10) * 100; // Convert to minor units

    try {
      const response = await fetch('/api/wallet/ledger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({
          accountId,
          currency: 'UGX',
          entries: [{ amountMinor, type: 'credit' }],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to post transaction.');
      }

      setResult(data);
      // Generate fresh idempotency key for next transaction
      setIdempotencyKey(`key_${Date.now()}`);
    } catch (err: unknown) {
      setError((err as Error).message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 max-w-lg mx-auto my-6">
      <h2 className="text-xl font-bold mb-2 text-amber-400">EGONUX Sandbox Wallet Ledger</h2>
      <p className="text-sm text-slate-400 mb-6">Double-entry integer ledger engine operating in minor units (UGX).</p>

      <form onSubmit={handlePostTransaction} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Account ID</label>
          <input
            type="text"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Amount (UGX)</label>
          <input
            type="number"
            value={amountUGX}
            onChange={(e) => setAmountUGX(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Idempotency Key Header</label>
          <input
            type="text"
            value={idempotencyKey}
            onChange={(e) => setIdempotencyKey(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-400"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-sm transition-colors disabled:opacity-50"
        >
          {loading ? 'Posting to Ledger...' : 'Post Sandbox Transaction'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-950/80 border border-red-500 text-red-200 text-xs rounded">
          ❌ {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded space-y-1">
          <p className="font-bold text-emerald-400">✓ {result.message}</p>
          <p><span className="text-slate-400">Key:</span> <code className="text-emerald-300">{result.data.idempotencyKey}</code></p>
          <p><span className="text-slate-400">Account:</span> {result.data.accountId}</p>
          <p><span className="text-slate-400">Entries Count:</span> {result.data.entriesCount}</p>
          <p><span className="text-slate-400">Timestamp:</span> {result.data.timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default WalletLedgerView;
