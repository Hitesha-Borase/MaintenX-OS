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
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Historical Sales Demand
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Examine past shipping compliance to improve current forecast baseline values
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {history.map((h, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px" }}>
                <Clock size={24} color="#C89547" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{h.period}</h4>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  500ml SKU: {h.SKU500ml} | 1L SKU: {h.SKU1L}
                </span>
              </div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 800, color: "#10B981" }}>{h.complianceRate}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}
