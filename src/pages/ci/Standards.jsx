import React from "react";
import { FileText, Printer } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";

export function Standards() {
  const docs = [
    { code: "SOP-CCP-001", title: "HTST Pasteurizer CCP Control Procedure", rev: "Rev 4", status: "Current" },
    { code: "SOP-QA-002", title: "Allergen Pre-Op Verification Standard", rev: "Rev 2", status: "Current" },
    { code: "ENG-001", title: "Filler Nozzle Calibration Engineering Standard", rev: "Rev 1", status: "Under Review" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>Engineering Standards Library</h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>SOPs, engineering standards, and control procedures controlled by the CI/Engineering team</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {docs.map((d, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <FileText size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "13px", fontWeight: 700, color: "#FFFFFF" }}>{d.code} — {d.title}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{d.rev}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <Badge variant={d.status === "Current" ? "emerald" : "warning"}>{d.status}</Badge>
              <Button variant="secondary" size="sm" icon={Printer} onClick={() => window.print()}>Print</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
