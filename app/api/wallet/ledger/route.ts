import { NextResponse } from "next/server";
import type { IncomingHttpHeaders } from "node:http";
import { requirePrincipal } from "@/lib/auth/session";

// This endpoint is a synthetic sandbox adapter, not a financial settlement system.
// The in-memory cache is process-local and must never be treated as a durable ledger.
const processedKeys = new Map<string, Record<string, unknown>>();
const MAX_IDEMPOTENCY_KEY_LENGTH = 160;

function requestHeaders(request: Request): IncomingHttpHeaders {
  return Object.fromEntries(request.headers.entries()) as IncomingHttpHeaders;
}

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") ?? new URL(request.url).protocol.replace(":", "");
  const expected = host ? `${protocol}://${host}` : new URL(request.url).origin;
  const allowed = (process.env.EGONUX_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return origin === expected || origin === new URL(request.url).origin || allowed.includes(origin);
}

export async function POST(request: Request) {
  // Authenticate before parsing or disclosing validation details.
  let principal: Awaited<ReturnType<typeof requirePrincipal>>;
  try {
    principal = await requirePrincipal({ headers: requestHeaders(request) });
  } catch {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  if (process.env.EGONUX_SANDBOX_MODE !== "true") {
    return NextResponse.json({
      error: "Sandbox ledger writes are disabled in this environment.",
      code: "SANDBOX_MODE_REQUIRED",
      externalExecution: "disabled",
    }, { status: 503 });
  }

  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid ledger payload." }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const { idempotencyKey, amount, currency } = input;
    if (
      typeof idempotencyKey !== "string" ||
      idempotencyKey.trim().length < 8 ||
      idempotencyKey.length > MAX_IDEMPOTENCY_KEY_LENGTH
    ) {
      return NextResponse.json({ error: "A valid idempotencyKey is required." }, { status: 400 });
    }
    if (typeof amount !== "number" || !Number.isSafeInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: "amount must be a positive integer in minor units." }, { status: 400 });
    }
    if (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency)) {
      return NextResponse.json({ error: "currency must be a three-letter uppercase code." }, { status: 400 });
    }

    const requestFingerprint = JSON.stringify({ amount, currency, ownerUid: principal.uid });
    const existing = processedKeys.get(idempotencyKey);
    if (existing) {
      if (existing.requestFingerprint !== requestFingerprint) {
        return NextResponse.json({ error: "Idempotency key was reused with different transaction data." }, { status: 409 });
      }
      return NextResponse.json({ ...existing, replayed: true });
    }

    const transactionRecord = {
      transactionId: `sandbox_${crypto.randomUUID()}`,
      idempotencyKey,
      accountId: `sandbox:${principal.uid}`,
      amount,
      currency,
      status: "SIMULATED",
      reconciled: false,
      replayed: false,
      requestFingerprint,
      persistence: "process-memory-only",
      externalExecution: "disabled",
      timestamp: new Date().toISOString(),
    };

    processedKeys.set(idempotencyKey, transactionRecord);
    return NextResponse.json(transactionRecord, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid ledger payload format." }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "SANDBOX_ONLY",
    externalExecution: "disabled",
    persistence: "process-memory-only",
    invariants: {
      doubleEntryBalanced: "not_applicable_to_this_simulation_adapter",
      duplicateEventsPrevented: processedKeys.size,
      reconciliationExceptions: "not_assessed",
    },
  });
}
