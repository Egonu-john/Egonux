import { NextResponse } from "next/server";

// ANOSA Governance Decision State Registry
const decisionStore = new Map<string, any>();

export async function GET() {
  const decisions = Array.from(decisionStore.values());
  return NextResponse.json({
    status: "ACTIVE",
    framework: "ANOSA_v3.2",
    totalDecisionsLogged: decisions.length,
    decisions: decisions.length > 0 ? decisions : [
      {
        id: "DEC-2026-001",
        title: "Project Sovereign Foundation Execution",
        status: "APPROVED",
        approver: "Founder & CEO (John William Egonu)",
        timestamp: new Date().toISOString(),
        governanceDoctrine: "Trust before scale. Security before convenience."
      }
    ]
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, rationale, category } = body;

    if (!title || !rationale) {
      return NextResponse.json({ error: "Missing decision parameters (title, rationale required)." }, { status: 400 });
    }

    const decisionId = `DEC-${Date.now()}`;
    const decisionRecord = {
      id: decisionId,
      title,
      rationale,
      category: category || "GOVERNANCE",
      status: "PENDING_FOUNDER_APPROVAL",
      anosaAuditSignature: `sig_anosa_decision_${Date.now()}`,
      timestamp: new Date().toISOString()
    };

    decisionStore.set(decisionId, decisionRecord);
    return NextResponse.json(decisionRecord, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "Invalid payload format." }, { status: 400 });
  }
}
