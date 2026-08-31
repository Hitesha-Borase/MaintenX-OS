import React, { useState } from "react";
import {
  Award,
  Plus,
  CheckCircle2
} from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";

export function SkillsMasterPage() {
  const [skills] = useState([
    { id: "SKL-01", name: "Isobaric Filler Operation & CIP Sanitization", tier: "Level 3 - Expert", certValidity: "12 Months", certifiedCount: 14, department: "Operations" },
    { id: "SKL-02", name: "High-Speed Can Seamer Mechanical Timing", tier: "Level 4 - Master", certValidity: "24 Months", certifiedCount: 6, department: "Maintenance" },
    { id: "SKL-03", name: "Laboratory Refractometry & Microbiological Swabs", tier: "Level 3 - Expert", certValidity: "12 Months", certifiedCount: 10, department: "Quality" },
    { id: "SKL-04", name: "Automated Laser Guided Vehicle (AGV) Dispatch", tier: "Level 2 - Operator", certValidity: "12 Months", certifiedCount: 18, department: "Warehouse" }
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
              Skills & Operator Qualifications Master
            </h1>
            <Badge variant="emerald">{skills.length} Certified Skills</Badge>
          </div>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Skill competency taxonomy, qualification tier requirements, and recertification validity rules.
          </p>
        </div>
      </div>

      <Card>
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Skill Code</th>
                <th>Skill Description</th>
                <th>Competency Tier</th>
                <th>Certification Validity</th>
                <th>Certified Count</th>
                <th>Department</th>
              </tr>
            </thead>
            <tbody>
              {skills.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span style={{ fontWeight: 700, color: "#38BDF8", fontFamily: "var(--font-mono)" }}>{s.id}</span>
                  </td>
                  <td>
                    <strong style={{ color: "#FFFFFF" }}>{s.name}</strong>
                  </td>
                  <td>
                    <Badge variant="cyan">{s.tier}</Badge>
                  </td>
                  <td style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{s.certValidity}</td>
                  <td style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: "#10B981" }}>{s.certifiedCount} Staff</td>
                  <td>
                    <span style={{ fontSize: "12px", color: "var(--text-primary)" }}>{s.department}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
