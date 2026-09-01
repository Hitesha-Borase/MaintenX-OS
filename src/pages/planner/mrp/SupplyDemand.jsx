import React from "react";
import { Card } from "../../../components/common/Card";
import { Boxes } from "lucide-react";

export function SupplyDemand() {
  const data = [
    { sku: "SKU-AJ-500ML-ORG", supplyTotal: "145,000 Cases", demandTotal: "142,000 Cases", netStatus: "Surplus" },
    { sku: "SKU-AJ-1L-ORG", supplyTotal: "92,000 Cases", demandTotal: "94,000 Cases", netStatus: "Deficit (2k)" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Supply & Demand Balance Sheet
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Reconcile total available supply with customer demand commitments
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {data.map((d, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px" }}>
                <Boxes size={24} color="#C89547" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <h4 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>{d.sku}</h4>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: 500 }}>
                  Supply: {d.supplyTotal} | Demand: {d.demandTotal}
                </span>
              </div>
            </div>
            <span style={{ fontSize: "14px", fontWeight: 800, color: d.netStatus.includes("Deficit") ? "#EF4444" : "#10B981" }}>
              {d.netStatus}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
