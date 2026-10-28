import { NextResponse } from "next/server";
import type { NextApiRequest } from "next";
import { requireAnosaStepUp } from "@/lib/anosa/server";
import { AuthenticationError, AuthorizationError } from "@/lib/auth/session";

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

export async function GET() {
  return NextResponse.json({
    status: "HEALTHY",
    framework: "ANOSA_v3.2",
    decisions: [
      {
        id: "DEMO-DEC-2026-001",
        title: "Project Sovereign Foundation Execution",
        status: "DEMO_ONLY_NOT_APPROVED",
        approver: null,
        timestamp: "2026-01-01T00:00:00.000Z",
        governanceDoctrine: "Trust before scale. Security before convenience.",
        demoRecord: true,
      },
    ],
    note: "The included decision is a static demonstration record, not evidence of a live approval.",
  });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "A decision proposal object is required." }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  if (
    typeof input.title !== "string" ||
    input.title.trim().length < 3 ||
    input.title.trim().length > 200 ||
    typeof input.rationale !== "string" ||
    input.rationale.trim().length < 12 ||
    input.rationale.trim().length > 4000
  ) {
    return NextResponse.json({
      error: "Invalid decision proposal.",
      required: { title: "3–200 characters", rationale: "12–4000 characters" },
    }, { status: 400 });
  }

  const headers = Object.fromEntries(request.headers.entries());
  const apiRequest = {
    method: "POST",
    headers,
    body: input,
  } as unknown as NextApiRequest;

  let principal: Awaited<ReturnType<typeof requireAnosaStepUp>>;
  try {
    principal = await requireAnosaStepUp(apiRequest);
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: "Founder access required." }, { status: 403 });
    }
    if (error instanceof AuthenticationError) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    return NextResponse.json({ error: "Recent verified sign-in required.", code: "STEP_UP_REQUIRED" }, { status: 428 });
  }

  // This endpoint only records a proposal response. It does not approve or execute decisions.
  return NextResponse.json({
    id: `DEC-PROPOSAL-${crypto.randomUUID()}`,
    title: input.title.trim(),
    rationale: input.rationale.trim(),
    proposedBy: principal.uid,
    status: "PENDING_FOUNDER_APPROVAL",
    persistence: "not_persisted",
    externalExecution: "disabled",
    timestamp: new Date().toISOString(),
    notice: "This response is not an approval record. Durable evidence storage is not configured by this endpoint.",
  }, { status: 202 });
}
