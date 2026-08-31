import React, { useState } from "react";
import { Package, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function MaterialStatus() {
  const { addToast } = useApp();

  const [materials, setMaterials] = useState([
    { id: 1, name: "Aseptic Bottles 500ml", sku: "SKU-AJ-500ML-ORG", level: 12000, safetyMin: 5000, status: "OK" },
    { id: 2, name: "Aseptic Orange Caps", sku: "SKU-CAP-ORG-01", level: 2500, safetyMin: 4000, status: "LOW STOCK" },
    { id: 3, name: "Organic Orange Concentrate 1000L", sku: "SKU-BLK-SYRUP-1000L", level: 850, safetyMin: 500, status: "OK" },
    { id: 4, name: "Cardboard Packing Boxes", sku: "SKU-BOX-L1-A", level: 1200, safetyMin: 800, status: "OK" }
  ]);

  const handleRequestReplenish = (name, sku) => {
    addToast(`Urgent inventory pull requested for ${name} (${sku}). WMS notified.`, "warning");
    setMaterials(prev =>
      prev.map(m => m.sku === sku ? { ...m, status: "REPLENISHING" } : m)
    );
  };

  const handleReceiveStock = (sku) => {
    setMaterials(prev =>
      prev.map(m => {
        if (m.sku === sku) {
          const replenishmentQty = m.sku === "SKU-CAP-ORG-01" ? 15000 : 5000;
          return { ...m, level: m.level + replenishmentQty, status: "OK" };
        }
        return m;
      })
    );
    addToast(`Inventory replenishment batch received for SKU ${sku}.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Stock & Material Feedstock
        </h1>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Verify raw lot feedstock counts and initiate replenishment orders to WMS
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {materials.map((mat) => {
          const isLow = mat.level < mat.safetyMin;
          const isReplenishing = mat.status === "REPLENISHING";

          return (
            <Card
              key={mat.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "12px",
                borderLeft: isLow ? "4px solid #F59E0B" : isReplenishing ? "4px solid #38BDF8" : "4px solid var(--border-subtle)"
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: 700, color: "#FFFFFF" }}>{mat.name}</h4>
                  <Badge variant={isLow ? "warning" : isReplenishing ? "cyan" : "emerald"}>
                    {mat.status}
                  </Badge>
                </div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginTop: "2px" }}>
                  SKU: {mat.sku} • Stock On Line: <strong style={{ color: "#FFFFFF" }}>{mat.level.toLocaleString()}</strong> (Safety Limit: {mat.safetyMin.toLocaleString()})
                </span>
              </div>

              <div style={{ display: "flex", gap: "6px" }}>
                {isLow && (
                  <Button variant="warning" size="sm" icon={Send} onClick={() => handleRequestReplenish(mat.name, mat.sku)}>
                    Order Replenishment
                  </Button>
                )}
                {isReplenishing && (
                  <Button variant="success" size="sm" icon={CheckCircle2} onClick={() => handleReceiveStock(mat.sku)}>
                    Confirm Receipt
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
