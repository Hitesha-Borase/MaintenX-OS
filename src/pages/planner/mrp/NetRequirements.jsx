import React from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Layers } from "lucide-react";

export function NetRequirements() {
  const requirements = [
    { part: "Aseptic Glass Bottles 1L", onHand: 42000, demand: 68000, netRequired: 26000, dateNeeded: "2026-09-08" },
    { part: "Organic Orange Concentrate 1000L", onHand: 850, demand: 700, netRequired: 0, dateNeeded: "2026-09-12" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Net Material Requirements (MRP)
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          MRP net requirements calculations: on-hand inventory subtracted from scheduled demand
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {requirements.map((r, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Layers size={18} color="#A855F7" />
              <div>
                <h4 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>{r.part}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Stock on Hand: {r.onHand.toLocaleString()} | Total Demand: {r.demand.toLocaleString()}
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: r.netRequired > 0 ? "#EF4444" : "#10B981", display: "block" }}>
                Net Required: {r.netRequired.toLocaleString()}
              </span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>
                Needed by: {r.dateNeeded}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
