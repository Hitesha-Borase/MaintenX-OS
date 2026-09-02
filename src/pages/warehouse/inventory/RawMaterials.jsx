import React from "react";
import { Package } from "lucide-react";
import { Card } from "../../../components/common/Card";
import { Badge } from "../../../components/common/Badge";
import { useApp } from "../../../context/AppContext";
import { useInventory } from "../../../context/InventoryContext";

export function RawMaterials() {
  const { addToast } = useApp();
  const { lots } = useInventory();

  // Filter lots that are Raw Materials and not just staged
  const rmLots = lots.filter(lot => lot.category === "Raw Material");

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
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Operations overview of raw concentrates and liquid feedstocks
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
                <span style={{ fontSize: "13px", color: "#a855f7" }}>
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
        {rmLots.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)" }}>No raw materials in inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
