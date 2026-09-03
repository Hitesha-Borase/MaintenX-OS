import React, { useState } from "react";
import { Package } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";
import { useMasterData } from "../../../context/MasterDataContext";

export function RawMaterials() {
  const { addToast } = useApp();
  const { lots } = useInventory();
  const { skus = [] } = useMasterData();

  // Filter lots that are Raw Materials from InventoryContext (live data)
  const rmLots = lots.filter(lot => lot.category === "Raw Material");

  // Seed inventory from MasterDataContext non-finished goods SKUs (pulled changes)
  const rawMasterSkus = skus.filter((s) => s.category !== "Finished Goods");

  const [materials, setMaterials] = useState(() => {
    if (rawMasterSkus.length > 0) {
      return rawMasterSkus.map((s, idx) => ({
        id: s.skuId || `RM-${idx + 1}`,
        name: s.name,
        sku: s.skuCode,
        qty: idx === 0 ? "8,500 Liters (4 Bulk Tanks)" : idx === 1 ? "1,200 Kg (48 Bags)" : "42,000 Units (Staged)",
        status: idx === 0 ? "Allocated" : idx === 1 ? "Secure Stock" : "Available"
      }));
    }
    return [
      { id: "SKU-101", name: "Liquid Cane Sugar 67°Bx", sku: "ING-1001", qty: "8,500 Liters", status: "Allocated" },
      { id: "SKU-102", name: "Citric Acid Anhydrous USP", sku: "ING-1002", qty: "1,200 Kg", status: "Secure Stock" }
    ];
  });

  const handleToggleStatus = (lotNumber, currentStatus) => {
    // Basic mock toggle for demonstration on the UI
    addToast(`Status toggle for ${lotNumber} not fully implemented in mock.`, "info");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "100%" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Raw Material Inventory
        </h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {/* Live lots from InventoryContext (Receiving flow) */}
        {rmLots.map((m) => (
          <Card 
            key={m.lotNumber} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0, height: "fit-content" }}>
                <Package size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {m.materialName} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  Lot: {m.lotNumber} <span style={{ margin: "0 4px" }}>•</span> On-Hand: {m.quantity} {m.unit}
                </span>
                <br/>
                <span style={{ fontSize: "13px", color: "#C89547" }}>
                  Location: {m.location}
                </span>
              </span>
            </div>
            
            <div 
              onClick={() => handleToggleStatus(m.lotNumber, m.status)}
              style={{ cursor: "pointer", transition: "opacity 0.2s" }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.8}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              <Badge variant={m.status === "PUT-AWAY" ? "emerald" : m.status === "STAGED" ? "warning" : "slate"}>
                {(m.status || m.qaStatus || "AVAILABLE").toUpperCase()}
              </Badge>
            </div>
          </Card>
        ))}

        {/* Master Data SKUs (pulled changes) */}
        {rmLots.length === 0 && materials.map((m) => (
          <Card 
            key={m.id} 
            style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: "250px" }}>
              <div style={{ padding: "10px", backgroundColor: "rgba(200, 149, 71, 0.1)", borderRadius: "10px", flexShrink: 0, height: "fit-content" }}>
                <Package size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {m.name} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
                  SKU: {m.sku} <span style={{ margin: "0 4px" }}>•</span> On-Hand: {m.qty}
                </span>
              </span>
            </div>
            <Badge variant={m.status === "Allocated" ? "emerald" : m.status === "Secure Stock" ? "warning" : "slate"}>
              {m.status.toUpperCase()}
            </Badge>
          </Card>
        ))}

        {rmLots.length === 0 && materials.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center" }}>
          </div>
        )}
      </div>
    </div>
  );
}


