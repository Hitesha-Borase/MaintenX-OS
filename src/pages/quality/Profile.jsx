import React from "react";
import { Award } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";

export function Profile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Quality Assurance Lead Profile
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Verify QA authorizations and compliance certifications
        </p>
      </div>

      <div className="grid-3">
        <Card style={{ gridColumn: "span 2", display: "flex", gap: "20px", alignItems: "center", padding: "24px", borderRadius: "16px" }}>
          <div style={{ width: "72px", height: "72px", borderRadius: "50%", backgroundColor: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "28px", fontWeight: 800, flexShrink: 0 }}>
            MS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>Maria Santos</h3>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)", display: "block" }}>Quality Assurance Lead</span>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <Badge variant="purple">QA SIGNATORY AUTHORITY</Badge>
              <Badge variant="cyan">CCP AUDITOR</Badge>
            </div>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "16px", padding: "24px", borderRadius: "16px" }}>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Batches Reviewed:</span>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#10B981" }}>142</span>
          </div>
          <div>
            <span style={{ fontSize: "13px", color: "var(--text-secondary)", display: "block", marginBottom: "4px" }}>Holds Issued:</span>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "#EF4444" }}>3</span>
          </div>
        </Card>
      </div>

      <Card style={{ padding: "24px", borderRadius: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
          <Award size={22} color="#F59E0B" strokeWidth={2} /> Quality Certifications
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {[
            { name: "HACCP Lead Auditor Certification", status: "ACTIVE" },
            { name: "ISO 22000 Food Safety Management Lead", status: "ACTIVE" },
            { name: "SQF Practitioner Level 3", status: "ACTIVE" }
          ].map((cert, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderRadius: "8px", backgroundColor: "var(--bg-card-subtle)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>{cert.name}</span>
              <Badge variant="emerald">{cert.status}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
