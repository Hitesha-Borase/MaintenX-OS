import React, { useState } from "react";
import { Package, Send, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";
import { useMasterData } from "../../context/MasterDataContext";

export function MaterialStatus() {
  const { addToast } = useApp();
  const { skus = [] } = useMasterData();

  const rawMasterSkus = skus.filter((s) => s.category !== "Finished Goods");

  const [materials, setMaterials] = useState(() => {
    if (rawMasterSkus.length > 0) {
      return rawMasterSkus.map((s, idx) => ({
        id: s.skuId || `MAT-${idx + 1}`,
        name: s.name,
        sku: s.skuCode,
        level: idx === 0 ? 12000 : idx === 1 ? 2500 : 850,
        safetyMin: idx === 0 ? 5000 : idx === 1 ? 4000 : 500,
        status: idx === 1 ? "LOW STOCK" : "OK"
      }));
    }
    return [
      { id: "SKU-101", name: "Liquid Cane Sugar 67°Bx", sku: "ING-1001", level: 12000, safetyMin: 5000, status: "OK" },
      { id: "SKU-201", name: "28mm Tamper-Evident Closures", sku: "PKG-2001", level: 2500, safetyMin: 4000, status: "LOW STOCK" }
    ];
  });

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
          const replenishmentQty = 10000;
          return { ...m, level: m.level + replenishmentQty, status: "OK" };
        }
        return m;
      })
    );
    addToast(`Inventory replenishment batch received for SKU ${sku}.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, color: "var(--text-primary)" }}>
          Line Stock & Material Feedstock
        </h1>

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
