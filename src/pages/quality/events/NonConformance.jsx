import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { AlertOctagon } from "lucide-react";

export function NonConformance() {
  const ncrList = [
    { id: "NCR-402", part: "Aseptic Orange Caps (LOT-ORG-442)", reason: "Plastic thread dimensions out-of-spec (0.2mm variance)", status: "PENDING QA REVIEW" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)" }}>
          Non-Conformance Reports (NCR)
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Track raw component quality defects and supplier claims
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {ncrList.map((n) => (
          <Card 
            key={n.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              borderLeft: "4px solid #EF4444",
              padding: "20px 24px",
              borderRadius: "16px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
              <AlertOctagon size={22} color="#EF4444" strokeWidth={2} style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Reason: {n.reason}
                </span>
                <Badge variant="slate">{n.status}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
