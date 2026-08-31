import React from "react";
import { Card } from "../../../components/common/Card";
import { Clock } from "lucide-react";

export function DemandHistory() {
  const history = [
    { period: "August 2026", SKU500ml: "142,000 Cases", SKU1L: "94,000 Cases", complianceRate: "98.8% OTIF" },
    { period: "July 2026", SKU500ml: "135,000 Cases", SKU1L: "88,000 Cases", complianceRate: "97.5% OTIF" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Historical Sales Demand
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Examine past shipping compliance to improve current forecast baseline values
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {history.map((h, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Clock size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{h.period}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  500ml SKU: {h.SKU500ml} | 1L SKU: {h.SKU1L}
                </span>
              </div>
            </div>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#10B981" }}>{h.complianceRate}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
