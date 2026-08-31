import React from "react";
import { User, Award, ShieldCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";

export function Profile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Supply Planner / Scheduler Profile
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Verify credentials and trade qualifications
        </p>
      </div>

      <div className="grid-3">
        <Card style={{ gridColumn: "span 2", display: "flex", gap: "16px", alignItems: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#0284C7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "24px",
              fontWeight: 800
            }}
          >
            SM
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>Stephen Miller</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Lead Production Scheduler</span>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <Badge variant="cyan">APS Planner</Badge>
              <Badge variant="purple">MRP Lead</Badge>
            </div>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>OTIF Compliance Rate:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#10B981" }}>98.9%</span>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Planning Cycles Complete:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#38BDF8" }}>240</span>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Award size={16} color="#F59E0B" /> Trade Qualifications
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>APICS CPIM Certification</span>
            <Badge variant="emerald">Certified</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>Advanced Production Sequencing (APS)</span>
            <Badge variant="emerald">Expert</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
