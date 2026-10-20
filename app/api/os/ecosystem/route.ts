import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cookieHeader = request.headers.get("cookie");
  const isAuthenticated = authHeader?.includes("Bearer egx_") || cookieHeader?.includes("egx_session=");

  return NextResponse.json({
    status: "ACTIVE",
    timestamp: new Date().toISOString(),
    governance: "ANOSA Protocols",
    modules: {
      identity: { status: isAuthenticated ? "AUTHENTICATED" : "GUEST", userRole: "ADMIN" },
      wallet: { currency: "UGX", balance: 12500000, ledgerState: "RECONCILED" },
      marketplace: { activeListings: 18, featuredAsset: "EGONUX Developer License" },
      learning: { activeModules: 12, completedTracks: 4, certification: "ANOSA Architect" },
      gaming: { activeTournaments: 3, prizePoolUGX: 5000000 },
      community: { activeMembers: 1420, governanceVotesPending: 2 }
    }
  });
}
