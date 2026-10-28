import { NextResponse } from "next/server";
import type { IncomingHttpHeaders } from "node:http";
import type { NextApiRequest } from "next";
import {
  AuthenticationError,
  AuthorizationError,
  requirePrincipal,
} from "@/lib/auth/session";
import {
  requireAnosaStepUp,
  StepUpRequiredError,
} from "@/lib/anosa/server";

function authRequest(request: Request) {
  const headers = Object.fromEntries(request.headers.entries()) as IncomingHttpHeaders;
  return { headers } as unknown as NextApiRequest;
}

function authErrorResponse(error: unknown) {
  if (error instanceof AuthenticationError) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }
  if (error instanceof AuthorizationError) {
    return NextResponse.json({ error: "Founder access required." }, { status: 403 });
  }
  if (error instanceof StepUpRequiredError) {
    return NextResponse.json(
      { error: "Recent verified sign-in required.", code: "STEP_UP_REQUIRED" },
      { status: 428 },
    );
  }
  return NextResponse.json(
    { error: "Authorization service unavailable." },
    { status: 503 },
  );
}

export async function GET(request: Request) {
  try {
    await requirePrincipal(authRequest(request), ["founder"]);
    return NextResponse.json({
      status: "ANOSA_DECISION_QUEUE",
      decisions: [],
      persistence: "not_configured",
      externalExecution: "disabled",
    });
  } catch (error) {
    return authErrorResponse(error);
  }
}

export async function POST(request: Request) {
  const adaptedRequest = authRequest(request);

  // Authenticate first so an anonymous caller never reaches proposal handling.
  try {
    await requirePrincipal(adaptedRequest);
  } catch (error) {
    return authErrorResponse(error);
  }

  // Fail closed even on preview/development deployments until auth enforcement is configured.
  if (process.env.EGONUX_AUTH_REQUIRED !== "true") {
    return NextResponse.json(
      { error: "Decision proposals are disabled until EGONUX_AUTH_REQUIRED=true.", externalExecution: "disabled" },
      { status: 503 },
    );
  }

  try {
    const principal = await requireAnosaStepUp(adaptedRequest);
    const body: unknown = await request.json().catch(() => ({}));
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "A JSON object is required." }, { status: 400 });
    }
    const { title, rationale } = body as Record<string, unknown>;

    if (
      typeof title !== "string" ||
      title.trim().length < 3 ||
      title.length > 200 ||
      typeof rationale !== "string" ||
      rationale.trim().length < 12 ||
      rationale.length > 4000
    ) {
      return NextResponse.json(
        { error: "A title (3–200 characters) and rationale (12–4000 characters) are required." },
        { status: 400 },
      );
    }

    return NextResponse.json({
      id: `proposal_${crypto.randomUUID()}`,
      title: title.trim(),
      rationale: rationale.trim(),
      submittedBy: principal.uid,
      status: "PENDING_FOUNDER_APPROVAL",
      approvalRequired: true,
      persistence: "not_persisted",
      externalExecution: "disabled",
      timestamp: new Date().toISOString(),
    }, { status: 202 });
  } catch (error) {
    return authErrorResponse(error);
  }
}
