import { NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({
      status: "HEALTHY",
      framework: "ANOSA_v3.2",
      decisions: [
        {
          id: "DEC-2026-001",
          title: "Project Sovereign Foundation Execution",
          status: "APPROVED",
          approver: "Founder & CEO (John William Egonu)",
          timestamp: new Date().toISOString(),
          governanceDoctrine: "Trust before scale. Security before convenience."
        }
      ]
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Decision Registry Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { title, rationale } = body;

    if (!title || !rationale) {
      return NextResponse.json({ 
        error: "Missing parameters", 
        required: ["title", "rationale"] 
      }, { status: 400 });
    }

    return NextResponse.json({
      id: `DEC-${Date.now()}`,
      title,
      rationale,
      status: "PENDING_FOUNDER_APPROVAL",
      anosaAuditSignature: `sig_anosa_decision_${Date.now()}`,
      timestamp: new Date().toISOString()
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON Payload" }, { status: 400 });
  }
}
