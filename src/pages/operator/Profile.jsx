import React from "react";
import { User, Award, ShieldCheck, Activity, Calendar } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";

export function Profile() {
  const skills = [
    { name: "Aseptic Filler Calibration", level: "Expert" },
    { name: "Allergen Control Protocol", level: "Certified" },
    { name: "Raw Product Recipe Formulation", level: "Advanced" },
    { name: "SCADA HMI Line Diagnostics", level: "Competent" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Operator Profile
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Active operator training and qualifications log
        </p>
      </div>

      <div className="grid-3">
        {/* User Card */}
        <Card style={{ gridColumn: "span 2", display: "flex", gap: "16px", alignItems: "center" }}>
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              backgroundColor: "#38BDF8",
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
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>Lead Line Operator</span>
            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
              <Badge variant="cyan">Shift A</Badge>
              <Badge variant="emerald">Line 1 Bottling</Badge>
            </div>
          </div>
        </Card>

        {/* Status Statistics */}
        <Card style={{ display: "flex", flexDirection: "column", justifyBox: "center", gap: "8px" }}>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Shift OEE Average:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#10B981" }}>88.2%</span>
          </div>
          <div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Hourly PM Compliance:</span>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "#38BDF8" }}>100%</span>
          </div>
        </Card>
      </div>

      {/* Qualifications */}
      <Card>
        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
          <Award size={16} color="#F59E0B" /> Qualifications & Certifications
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {skills.map((skill, idx) => (
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
              <span style={{ fontSize: "13px", fontWeight: 600, color: "#FFFFFF" }}>{skill.name}</span>
              <Badge variant={skill.level === "Expert" || skill.level === "Certified" ? "emerald" : "cyan"}>
                {skill.level}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
