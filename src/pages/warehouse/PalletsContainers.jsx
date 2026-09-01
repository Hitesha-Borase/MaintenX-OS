import React, { useState } from "react";
import { Boxes, Check } from "lucide-react";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Badge } from "../../components/common/Badge";
import { useApp } from "../../context/AppContext";

export function PalletsContainers() {
  const { addToast } = useApp();

  const [pallets, setPallets] = useState([
    { id: "PLT-1020", sku: "SKU-AJ-1L-ORG", description: "Organic Orange Juice 1L (1,000 Bottles)", status: "Staged WH-B" },
    { id: "PLT-1021", sku: "SKU-AJ-500ML-ORG", description: "Organic Orange Juice 500ml (2,000 Bottles)", status: "Loaded Carrier" }
  ]);

  const handleStage = (id) => {
    setPallets(prev =>
      prev.map(p => p.id === id ? { ...p, status: "Loaded Carrier" } : p)
    );
    addToast(`Pallet ${id} marked as Loaded. Outbound dispatch updated.`, "success");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "800px" }}>
      <div style={{ marginBottom: "8px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
          Pallets & Cargo Containers
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontWeight: 500 }}>
          Monitor finished cargo pallets staged in shipping docks
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {pallets.map((p) => (
          <Card 
            key={p.id} 
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
                <Boxes size={24} color="#C89547" />
              </div>
              <span style={{ fontSize: "16px", color: "var(--text-primary)", fontWeight: 500, lineHeight: 1.5 }}>
                {p.id} <br/>
                <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>SKU: {p.sku} <span style={{ margin: "0 4px" }}>•</span> Contents: {p.description}</span>
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <Badge variant={p.status === "Loaded Carrier" ? "emerald" : "warning"}>
                {p.status.toUpperCase()}
              </Badge>
              {p.status === "Staged WH-B" && (
                <Button variant="success" size="sm" icon={Check} onClick={() => handleStage(p.id)}>
                  Load Cargo
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
