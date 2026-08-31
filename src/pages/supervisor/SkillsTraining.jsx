import React from "react";
import { Card } from "../../components/common/Card";
import { Badge } from "../../components/common/Badge";
import { Award } from "lucide-react";

export function SkillsTraining() {
  const qualifications = [
    { name: "Elena Rostova", skill: "Aseptic Processing Level 3", expiry: "2027-04-12" },
    { name: "Carlos Mendez", skill: "Packaging Controls", expiry: "2026-11-20" },
    { name: "Sarah Jenkins", skill: "CIP Allergen Wash Procedures", expiry: "2027-01-15" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", width: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Departmental Qualifications & Skills
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Verify active operator skills credentials and safety training certificates
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {qualifications.map((q, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Award size={18} color="#F59E0B" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{q.name}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Credential: <strong style={{ color: "#38BDF8" }}>{q.skill}</strong>
                </span>
              </div>
            </div>
            <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Expires: {q.expiry}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
