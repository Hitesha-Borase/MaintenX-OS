import React from "react";
import { User, Award, ShieldCheck, Activity } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";

export function Profile() {
  const certifications = [
    { name: "Continuous Improvement Green Belt", level: "LSS Certified" },
    { name: "High-Speed Bottling Diagnostics v2.0", level: "Advanced" },
    { name: "Shift Leadership & Communication", level: "Competent" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Lead Profile
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Operational credentials and staffing qualifiers
        </p>
      </div>

      <div className="grid-3">
        <Card style={{ gridColumn: "span 2", display: "flex", gap: "16px", alignItems: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#A855F7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0F172A",
              fontSize: "24px",
              fontWeight: 800
            }}
          >
            ER
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "#FFFFFF" }}>Elena Rostova</h3>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Aseptic Line Lead</span>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <Badge variant="cyan">Shift A Lead</Badge>
              <Badge variant="purple">Line 1 Bottling</Badge>
            </div>
          </div>
        </Card>

        <Card style={{ display: "flex", flexDirection: "column", justifyBox: "center", gap: "8px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Shift Target Compliance:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#10B981" }}>96.4%</span>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Downtime Incidents Restored:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#38BDF8" }}>14</span>
          </div>
        </Card>
      </div>

      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Award size={16} color="#F59E0B" /> Roster Certifications
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {certifications.map((cert, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "var(--bg-card-subtle)",
                border: "1px solid var(--border-subtle)"
              }}
            >
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>{cert.name}</span>
              <Badge variant="emerald">{cert.level}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
