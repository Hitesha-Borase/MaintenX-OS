import React from "react";
import { Award } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";

export function Profile() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Quality Assurance Lead Profile
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Verify QA authorizations and compliance certifications
        </p>
      </div>

      <div className="grid-3">
        <Card style={{ gridColumn: "span 2", display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ width: "60px", height: "60px", borderRadius: "50%", backgroundColor: "#7C3AED", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontSize: "24px", fontWeight: 800 }}>
            MS
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>Maria Santos</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Quality Assurance Lead</span>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <Badge variant="purple">QA Signatory Authority</Badge>
              <Badge variant="cyan">CCP Auditor</Badge>
            </div>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "8px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Batches Reviewed:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#10B981" }}>142</span>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Holds Issued:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#EF4444" }}>3</span>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Award size={16} color="#F59E0B" /> Quality Certifications
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { name: "HACCP Lead Auditor Certification", status: "Active" },
            { name: "ISO 22000 Food Safety Management Lead", status: "Active" },
            { name: "SQF Practitioner Level 3", status: "Active" }
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
