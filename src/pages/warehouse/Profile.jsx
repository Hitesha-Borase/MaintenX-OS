import React from "react";
import { User, Award, ShieldCheck } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";

export function Profile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Warehouse Operator Profile
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Verify qualifications and safety staging clearances
        </p>
      </div>

      <div className="grid-3">
        <Card style={{ gridColumn: "span 2", display: "flex", gap: "16px", alignItems: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#E11D48",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              fontSize: "24px",
              fontWeight: 800
            }}
          >
            JC
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>Julio Chavez</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Lead Warehouse Receiver</span>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <Badge variant="cyan">Receiving Dock Lead</Badge>
              <Badge variant="purple">LOT Inspector</Badge>
            </div>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Cycle Count Accuracy:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#10B981" }}>99.7%</span>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Pallets Dispatched:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#38BDF8" }}>452</span>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Award size={16} color="#F59E0B" /> Forklift & Safety Licenses
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>OSHA Forklift Operations License</span>
            <Badge variant="emerald">Active</Badge>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: "6px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>Hazardous lot staging handling</span>
            <Badge variant="emerald">Certified</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
