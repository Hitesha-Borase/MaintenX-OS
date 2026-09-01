import React from "react";
import { Award } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";

export function Profile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Supply Planner / Scheduler Profile
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Verify credentials and trade qualifications
        </p>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {/* Left Profile Card */}
        <Card style={{ 
          display: "flex", 
          gap: "24px", 
          alignItems: "center",
          padding: "32px",
          flex: "1 1 350px"
        }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              backgroundColor: "#C89547",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "28px",
              fontWeight: 800,
              flexShrink: 0
            }}
          >
            SM
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Sarah Miller</h2>
            <span style={{ fontSize: "15px", color: "var(--text-secondary)", fontWeight: 500 }}>Lead Production Scheduler</span>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Badge variant="cyan">APS PLANNER</Badge>
              <Badge variant="slate">MRP LEAD</Badge>
            </div>
          </div>
        </Card>

        {/* Right Stats Card */}
        <Card style={{ 
          display: "flex", 
          flexDirection: "column", 
          justifyContent: "center", 
          gap: "16px",
          padding: "32px",
          flex: "1 1 200px"
        }}>
          <div>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>OTIF Compliance Rate:</span>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#10b981" }}>98.9%</span>
          </div>
          <div>
            <span style={{ fontSize: "14px", color: "var(--text-muted)", display: "block", marginBottom: "4px" }}>Planning Cycles Complete:</span>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#38BDF8" }}>240</span>
          </div>
        </Card>
      </div>

      {/* Qualifications Card */}
      <Card style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "4px" }}>
          <Award size={24} color="#C89547" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "16px 20px", borderRadius: "12px", backgroundColor: "rgba(200, 149, 71, 0.05)", border: "1px solid rgba(200, 149, 71, 0.2)" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>APICS CPIM Certification</span>
            <Badge variant="emerald">CERTIFIED</Badge>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "16px 20px", borderRadius: "12px", backgroundColor: "rgba(200, 149, 71, 0.05)", border: "1px solid rgba(200, 149, 71, 0.2)" }}>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Advanced Production Sequencing (APS)</span>
            <Badge variant="emerald">EXPERT</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
