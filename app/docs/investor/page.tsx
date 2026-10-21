"use client";

import { useState, useEffect } from "react";

export default function InvestorPortalPage() {
  const [systemState, setSystemState] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch("/api/os/ecosystem")
      .then((res) => res.json())
      .then((d) => setSystemState(d))
      .catch(() => {});
  }, []);

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "#0A0A0A", color: "#F5F5F7", padding: "40px 20px", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(212,175,55,0.3)", paddingBottom: "16px", marginBottom: "32px" }}>
          <div>
            <span style={{ color: "#D4AF37", fontSize: "12px", letterSpacing: "2px", fontWeight: "bold" }}>EGONUX WEALTH CENTRAL HUB</span>
            <h1 style={{ color: "#FFF", fontSize: "28px", margin: "4px 0 0 0" }}>Partner & Investor Readiness Portal</h1>
          </div>
          <span style={{ backgroundColor: "#10B981", color: "#000", padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
            ANOSA VERIFIED v3.1
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px", marginBottom: "32px" }}>
          <div style={{ backgroundColor: "#121212", border: "1px solid #222", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#D4AF37", fontSize: "14px", margin: 0 }}>SECURITY MODEL</h3>
            <p style={{ fontSize: "20px", fontWeight: "bold", margin: "8px 0 0 0", color: "#FFF" }}>Zero-Trust Middleware</p>
            <p style={{ color: "#8E8E93", fontSize: "12px", margin: "4px 0 0 0" }}>HTTP-Only Session Cookies & Server-Enforced RBAC</p>
          </div>

          <div style={{ backgroundColor: "#121212", border: "1px solid #222", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#D4AF37", fontSize: "14px", margin: 0 }}>FINANCIAL INTEGRITY</h3>
            <p style={{ fontSize: "20px", fontWeight: "bold", margin: "8px 0 0 0", color: "#FFF" }}>Idempotent Ledger</p>
            <p style={{ color: "#8E8E93", fontSize: "12px", margin: "4px 0 0 0" }}>Duplicate-Event Protection & Audit-Trail Signatures</p>
          </div>

          <div style={{ backgroundColor: "#121212", border: "1px solid #222", borderRadius: "12px", padding: "20px" }}>
            <h3 style={{ color: "#D4AF37", fontSize: "14px", margin: 0 }}>ECOSYSTEM STATE</h3>
            <p style={{ fontSize: "20px", fontWeight: "bold", margin: "8px 0 0 0", color: "#10B981" }}>
              {systemState ? (systemState.status as string) : "INITIALIZING"}
            </p>
            <p style={{ color: "#8E8E93", fontSize: "12px", margin: "4px 0 0 0" }}>Connected: Identity, Wallet, Marketplace, Learn, Gaming</p>
          </div>
        </div>

        <section style={{ backgroundColor: "#121212", border: "1px solid #222", borderRadius: "12px", padding: "24px", marginBottom: "32px" }}>
          <h2 style={{ color: "#D4AF37", fontSize: "18px", marginTop: 0, marginBottom: "16px" }}>Ecosystem Operating Metrics</h2>
          {systemState ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "14px" }}>
              <div style={{ padding: "12px", border: "1px solid #222", borderRadius: "8px" }}>
                <span style={{ color: "#8E8E93", fontSize: "12px" }}>WALLETS & LEDGER</span>
                <p style={{ margin: "4px 0 0 0", fontWeight: "bold" }}>UGX {(systemState as any).modules?.wallet?.balance?.toLocaleString() || 0} Balance</p>
              </div>
              <div style={{ padding: "12px", border: "1px solid #222", borderRadius: "8px" }}>
                <span style={{ color: "#8E8E93", fontSize: "12px" }}>MARKETPLACE</span>
                <p style={{ margin: "4px 0 0 0", fontWeight: "bold" }}>{(systemState as any).modules?.marketplace?.activeListings || 0} Active Asset Listings</p>
              </div>
              <div style={{ padding: "12px", border: "1px solid #222", borderRadius: "8px" }}>
                <span style={{ color: "#8E8E93", fontSize: "12px" }}>LEARNING & CERTS</span>
                <p style={{ margin: "4px 0 0 0", fontWeight: "bold" }}>{(systemState as any).modules?.learning?.activeModules || 0} Active Academy Modules</p>
              </div>
              <div style={{ padding: "12px", border: "1px solid #222", borderRadius: "8px" }}>
                <span style={{ color: "#8E8E93", fontSize: "12px" }}>COMMUNITY</span>
                <p style={{ margin: "4px 0 0 0", fontWeight: "bold" }}>{(systemState as any).modules?.community?.activeMembers || 0} Verified Ecosystem Members</p>
              </div>
            </div>
          ) : (
            <p style={{ color: "#8E8E93" }}>Loading ecosystem API metrics...</p>
          )}
        </section>

        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <a href="/docs/sdk" style={{ color: "#000", backgroundColor: "#D4AF37", padding: "12px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
            🛠️ Interactive SDK Sandbox
          </a>
          <a href="/docs/analytics" style={{ color: "#FFF", backgroundColor: "#222", border: "1px solid #444", padding: "12px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
            📈 Financial Intelligence
          </a>
        </div>
      </div>
    </main>
  );
}
