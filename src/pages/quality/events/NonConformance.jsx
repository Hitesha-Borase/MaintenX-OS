import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { ShieldAlert } from "lucide-react";

export function NonConformance() {
  const ncrList = [
    { id: "NCR-402", part: "Aseptic Orange Caps (LOT-ORG-442)", reason: "Plastic thread dimensions out-of-spec (0.2mm variance)", status: "Pending QA review" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Non-Conformance Reports (NCR)
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Track raw component quality defects and supplier claims
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {ncrList.map((n) => (
          <Card key={n.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #EF4444" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ShieldAlert size={16} color="#EF4444" />
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{n.id}: {n.part}</span>
                <Badge variant="warning">{n.status}</Badge>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Reason: {n.reason}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
