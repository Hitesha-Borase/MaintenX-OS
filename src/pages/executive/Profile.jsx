import React from "react";
import { Award, ShieldCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";

export function Profile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Executive Profile
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Managing corporate profile settings, enterprise roles, and security authorization levels
        </p>
      </div>

      <div className="grid-3">
        <Card style={{ gridColumn: "span 2", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#38BDF8", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "24px", fontWeight: 800 }}>
            EO
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>Enterprise Operator</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>VP of Global Manufacturing Operations</span>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <Badge variant="cyan">Admin Authority</Badge>
              <Badge variant="purple">Portfolio Lead</Badge>
            </div>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", gap: "8px", justifyContent: "center" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Multi-Plant Portfolio:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#10B981" }}>3 Facilities</span>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Compliance Status:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#38BDF8" }}>Verified</span>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <ShieldCheck size={16} color="#F59E0B" /> Enterprise Security Credentials
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { name: "Global ERP Access (SAP Sync)", status: "Active" },
            { name: "HACCP Compliance Oversight Authority", status: "Active" },
            { name: "CAPEX Capital Expenditure Sign-off Limit: $250K", status: "Active" }
          ].map((cert, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>{cert.name}</span>
              <Badge variant="emerald">{cert.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
