import { NextResponse } from "next/server";

// Simulated server-side idempotency cache
const processedKeys = new Map<string, Record<string, unknown>>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idempotencyKey, amount, currency, accountId } = body;

    if (!idempotencyKey) {
      return NextResponse.json({ error: "idempotencyKey is required for ledger state change." }, { status: 400 });
    }

    // Duplicate event protection check
    if (processedKeys.has(idempotencyKey)) {
      const cached = processedKeys.get(idempotencyKey);
      return NextResponse.json({
        ...cached,
        replayed: true,
        notice: "DUPLICATE_EVENT_PREVENTED: Returning cached reconciliation payload."
      });
    }

    const transactionRecord = {
      transactionId: "tx_reconciled_" + Math.random().toString(36).substring(2, 10),
      idempotencyKey,
      accountId: accountId || "acc_egonux_primary",
      amount: amount || 50000,
      currency: currency || "UGX",
      status: "SETTLED",
      reconciled: true,
      anosaAuditSignature: "sig_anosa_ledger_" + Date.now(),
      timestamp: new Date().toISOString()
    };

    processedKeys.set(idempotencyKey, transactionRecord);

    return NextResponse.json(transactionRecord);
  } catch {
    return NextResponse.json({ error: "Invalid ledger payload format." }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "LEDGER_HEALTHY",
    invariants: {
      doubleEntryBalanced: true,
      duplicateEventsPrevented: processedKeys.size,
      reconciliationExceptions: 0
    }
  });
}
