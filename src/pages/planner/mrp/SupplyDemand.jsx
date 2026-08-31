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
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Supply & Demand Balance Sheet
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Reconcile total available supply with customer demand commitments
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {data.map((d, idx) => (
          <Card key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Boxes size={18} color="#38BDF8" />
              <div>
                <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{d.sku}</h4>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                  Supply: {d.supplyTotal} | Demand: {d.demandTotal}
                </span>
              </div>
            </div>
            <span style={{ fontSize: "13px", fontWeight: 750, color: d.netStatus.includes("Deficit") ? "#EF4444" : "#10B981" }}>
              {d.netStatus}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
