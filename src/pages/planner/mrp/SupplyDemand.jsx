import React, { useState } from "react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { Boxes } from "lucide-react";
import { useApp } from "../../../context/AppContext";

export function SupplyDemand() {
  const { addToast } = useApp();

  const [data, setData] = useState([
    { id: 1, sku: "SKU-AJ-500ML-ORG", supplyTotal: "145,000 Cases", demandTotal: "142,000 Cases", netStatus: "Surplus" },
    { id: 2, sku: "SKU-AJ-1L-ORG", supplyTotal: "92,000 Cases", demandTotal: "94,000 Cases", netStatus: "Deficit (2k)" }
  ]);

  const handleToggleStatus = (id) => {
    setData(prev => prev.map(d => {
      if (d.id === id) {
        if (d.netStatus.includes("Deficit")) {
          addToast(`${d.sku} supply adjusted to cover deficit.`, "success");
          return { ...d, netStatus: "Surplus", supplyTotal: d.demandTotal };
        } else {
          addToast(`${d.sku} supply reduced, causing a deficit!`, "warning");
          return { ...d, netStatus: "Deficit (2k)", supplyTotal: "92,000 Cases" };
        }
      }
      return d;
    }));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Supply & Demand Balance Sheet
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Reconcile total available supply with customer demand commitments
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {data.map((d) => (
          <Card key={d.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px" }}>
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
            <div 
              onClick={() => handleToggleStatus(d.id)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={d.netStatus.includes("Deficit") ? "danger" : "emerald"}>
                {d.netStatus.toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
