import { NextResponse } from "next/server";
import type { IncomingHttpHeaders } from "node:http";
import {
  AuthenticationError,
  AuthorizationError,
  requirePrincipal,
} from "@/lib/auth/session";

// Process-local storage is intentional for this demo only; it is not a durable ledger.
const processedKeys = new Map<string, Record<string, unknown>>();

function requestHeaders(request: Request) {
  return Object.fromEntries(request.headers.entries()) as IncomingHttpHeaders;
}

async function authenticationFailure(request: Request) {
  try {
    await requirePrincipal({ headers: requestHeaders(request) });
    return null;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: "Insufficient permissions." }, { status: 403 });
    }
    return NextResponse.json({ error: "Authentication service unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const authFailure = await authenticationFailure(request);
  if (authFailure) return authFailure;

  // This route is a sandbox simulator, never a real-money payment rail.
  if (request.headers.get("x-egonux-sandbox") !== "true") {
    return NextResponse.json(
      { error: "Sandbox header required.", externalExecution: "disabled" },
      { status: 403 },
    );
  }

  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "A JSON object is required." }, { status: 400 });
    }
    const { idempotencyKey, amount, currency, accountId } = body as Record<string, unknown>;

    if (
      typeof idempotencyKey !== "string" ||
      idempotencyKey.length < 8 ||
      idempotencyKey.length > 160 ||
      typeof accountId !== "string" ||
      accountId.trim().length < 3 ||
      accountId.length > 120 ||
      typeof amount !== "number" ||
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      typeof currency !== "string" ||
      !/^[A-Z]{3}$/.test(currency)
    ) {
      return NextResponse.json(
        { error: "Valid idempotencyKey, accountId, positive integer amount, and ISO currency code are required." },
        { status: 400 },
      );
    }

    const existing = processedKeys.get(idempotencyKey);
    if (existing) {
      return NextResponse.json({
        ...existing,
        replayed: true,
        notice: "Duplicate sandbox request; returning the cached simulation result.",
        externalExecution: "disabled",
      });
    }

    const transactionRecord = {
      transactionId: `sim_${crypto.randomUUID()}`,
      idempotencyKey,
      accountId: accountId.trim(),
      amount,
      currency,
      status: "SIMULATED",
      reconciled: false,
      auditReference: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      externalExecution: "disabled",
    };

    processedKeys.set(idempotencyKey, transactionRecord);
    return NextResponse.json(transactionRecord, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "SANDBOX_ONLY",
    externalExecution: "disabled",
    persistence: "process-local-demo-only",
    invariants: {
      duplicateEventsPrevented: processedKeys.size,
      reconciliationExceptions: "unknown",
    },
  });
}
